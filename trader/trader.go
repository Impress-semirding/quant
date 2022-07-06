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

var (
	Executor      = make(map[int64]*Global)
	errHalt       = fmt.Errorf("HALT")
	ExchangeMaker = map[string]func(api.Option) api.Exchange{
		constant.Okex: api.NewOKEX,
	}
)

// GetTraderStatus ...
func GetTraderStatus(id int64) (status int64) {
	if t, ok := Executor[id]; ok && t != nil {
		status = t.Status
	}
	return
}

// Switch ...
func Switch(id int64, api []model.ApiConfig) (err error) {
	if GetTraderStatus(id) > 0 {
		return stop(id)
	}
	if len(api) > 0 {
		return run(id, api[0].ID)
	}

	return nil
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
		if maker, ok := ExchangeMaker[e.ExchangeType]; ok {
			opt := api.Option{
				TraderID:   trader.ID,
				Type:       e.ExchangeType,
				Name:       e.Name,
				AccessKey:  e.AccessKey,
				SecretKey:  e.SecretKey,
				Passphrase: e.Passphrase,
				Test:       e.Test,
			}
			trader.es = append(trader.es, maker(opt))
		}
	}
	if len(trader.okex) == 0 && len(trader.es) == 0 {
		err = fmt.Errorf("Please add at least one exchange")
		return
	}

	trader.ctx.Set("Global", &trader)
	trader.ctx.Set("G", &trader)
	trader.ctx.Set("Exchange", trader.es[0])
	trader.ctx.Set("E", trader.es[0])
	trader.ctx.Set("Exchanges", trader.es)
	trader.ctx.Set("Es", trader.es)
	trader.ctx.Set("Talib", Talib{})
	return
}

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
			//	这里需要开发group chan接口，做多任务订阅
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

// stop ...
func stop(id int64) (err error) {
	if t, ok := Executor[id]; !ok || t == nil {
		return fmt.Errorf("Can not found the Trader")
	}
	Executor[id].ctx.Interrupt <- func() { panic(errHalt) }
	return
}

func toMap(input interface{}) (map[string]interface{}, error) {
	data := make(map[string]interface{})
	j, _ := json.Marshal(input)
	if err := json.Unmarshal(j, &data); err != nil {
		return nil, err
	}

	return data, nil
}
