package trader

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/Impress-semirding/quant/api"
	"github.com/Impress-semirding/quant/constant"
	"github.com/Impress-semirding/quant/model"
	taskLib "github.com/Impress-semirding/quant/task"
	"github.com/robertkrimen/otto"
)

// Trader Variable
var (
	Executor = make(map[int64]*Global) //保存正在运行的策略，防止重复运行
	errHalt  = fmt.Errorf("HALT")
	// exchangeMaker = map[string]func(api.Option) api.Exchange{ //保存所有交易所的构造函数
	// 	constant.Okex: api.NewOKEX,
	// }

	okexMaker = map[string]func(api.Option) *api.OKEX{ //保存所有交易所的构造函数
		constant.Okex: api.NewOKEX,
	}

	// exchangeMakeDynamic = map[string]func(api.Option) interface{}{ //保存所有交易所的构造函数
	// 	constant.Okex: api.NewOKEXFuture,
	// }
)

// GetTraderStatus ...
func GetTraderStatus(id int64) (status int64) {
	if t, ok := Executor[id]; ok && t != nil {
		status = t.Status
	}
	return
}

// Switch ...
func Switch(id, api int64) (err error) {
	if GetTraderStatus(id) > 0 {
		return stop(id)
	}
	return run(id, api)
}

//核心是初始化js运行环境，及其可以调用的api
func initialize(id int64) (trader Global, err error) {
	if t := Executor[id]; t != nil && t.Status > 0 {
		return
	}
	err = model.DB.First(&trader.Trader, id).Error
	if err != nil {
		return
	}
	self, err := model.GetUserByID(trader.UserID)
	if err != nil {
		return
	}
	if trader.AlgorithmID <= 0 {
		err = fmt.Errorf("Please select a algorithm")
		return
	}
	err = model.DB.First(&trader.Algorithm, trader.AlgorithmID).Error
	if err != nil {
		return
	}
	es, err := self.GetTraderExchanges(trader.ID)
	if err != nil {
		return
	}
	trader.Logger = model.Logger{
		TraderID:     trader.ID,
		ExchangeType: "global",
	}
	trader.tasks = make(Tasks)
	trader.ctx = otto.New()
	trader.ctx.Interrupt = make(chan func(), 1)
	for _, c := range constant.Consts {
		trader.ctx.Set(c, c)
	}

	for _, e := range es {
		if maker, ok := okexMaker[e.ExchangeType]; ok {
			opt := api.Option{
				TraderID:   trader.ID,
				Type:       e.ExchangeType,
				Name:       e.Name,
				AccessKey:  e.AccessKey,
				SecretKey:  e.SecretKey,
				Passphrase: e.Passphrase,
				Test:       e.Test,
			}
			trader.okex = append(trader.okex, maker(opt))
		}
	}
	if len(trader.okex) == 0 && len(trader.es) == 0 {
		err = fmt.Errorf("Please add at least one exchange")
		return
	}

	trader.ctx.Set("Global", &trader)
	trader.ctx.Set("G", &trader)
	// trader.ctx.Set("Exchange", trader.es[0])
	// trader.ctx.Set("E", trader.es[0])
	// trader.ctx.Set("Exchanges", trader.es)
	// trader.ctx.Set("Es", trader.es)
	trader.ctx.Set("Talib", Talib{})
	// trader.ctx.Set("runExchange", runExchange(trader.ctx, trader.es[0]))
	trader.ctx.Set("Okex", trader.okex[0])
	return
}

// func runExchange(vm *otto.Otto, api api.Exchange) func(call otto.FunctionCall) otto.Value {
// 	return func(call otto.FunctionCall) otto.Value {
// 		method, err := call.Argument(0).ToString()
// 		var args []otto.Value
// 		if len(call.ArgumentList) > 0 {
// 			args = call.ArgumentList[1:]
// 		}
// 		if err != nil {
// 			result, _ := vm.ToValue("method provide error")
// 			return result
// 		}

// 		fmt.Println(args)

// 		var result interface{}
// 		switch method {
// 		case "GetTicker":
// 			result, _ = api.GetTicker(goex.BTC_USDT)
// 		case "GetCurrencyPair":
// 			result, _ = vm.ToValue(goex.BTC_USDT)
// 		}

// 		data, err := toMap(result)
// 		if err != nil {
// 			return otto.Value{}
// 		}
// 		val, _ := vm.ToValue(data)
// 		return val
// 	}
// }

// run ...
func run(id, api int64) (err error) {
	trader, err := initialize(id)
	if err != nil {
		return
	}
	go func() {
		defer func() {
			if err := recover(); err != nil && err != errHalt {
				trader.Logger.Log(constant.ERROR, "", 0.0, 0.0, err)
			}
			if exit, err := trader.ctx.Get("exit"); err == nil && exit.IsFunction() {
				if _, err := exit.Call(exit); err != nil {
					trader.Logger.Log(constant.ERROR, "", 0.0, 0.0, err)
				}
			}
			trader.Status = 0
		}()
		trader.LastRunAt = time.Now()
		trader.Status = 1

		// RUN javascript
		if _, err := trader.ctx.Run(trader.Algorithm.Script); err != nil {
			trader.Logger.Log(constant.ERROR, "", 0.0, 0.0, err)
		}

		if subscribe, err := trader.ctx.Get("subscribe"); err == nil && subscribe.IsFunction() {
			taskLib.SubscribeById(api, pipeChanOtto(subscribe))
		} else if main, err := trader.ctx.Get("main"); err != nil || !main.IsFunction() {
			trader.Logger.Log(constant.ERROR, "", 0.0, 0.0, "Can not get the main function")
		} else {
			if _, err := main.Call(main); err != nil {
				trader.Logger.Log(constant.ERROR, "", 0.0, 0.0, err)
			}
		}
	}()
	Executor[trader.ID] = &trader
	return
}

func pipeChanOtto(subscribe otto.Value) func(ch chan taskLib.DataEvent) {
	return func(ch chan taskLib.DataEvent) {
		for {
			select {
			case d := <-ch:
				if _, err := subscribe.Call(subscribe, d); err != nil {
					//trader.Logger.Log(constant.ERROR, "", 0.0, 0.0, err)
				}
				fmt.Println("ch:", d)
			}
		}
	}
}

// getStatus ...
//func getStatus(id int64) (status string) {
//	if t := Executor[id]; t != nil {
//		status = t.statusLog
//	}
//	return
//}

// stop ...
func stop(id int64) (err error) {
	if t, ok := Executor[id]; !ok || t == nil {
		return fmt.Errorf("Can not found the Trader")
	}
	Executor[id].ctx.Interrupt <- func() { panic(errHalt) }
	return
}

// clean ...
//func clean(userID int64) {
//	for _, t := range Executor {
//		if t != nil && t.UserID == userID {
//			stop(t.ID)
//		}
//	}
//}

func toMap(input interface{}) (map[string]interface{}, error) {
	data := make(map[string]interface{})
	j, _ := json.Marshal(input)
	if err := json.Unmarshal(j, &data); err != nil {
		return nil, err
	}

	return data, nil
}
