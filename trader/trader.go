package trader

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"time"

	"github.com/nntaoli-project/goex"

	"github.com/Impress-semirding/quant/api"
	"github.com/Impress-semirding/quant/constant"
	"github.com/Impress-semirding/quant/model"
	taskLib "github.com/Impress-semirding/quant/task"
	sim2 "github.com/nntaoli-project/goex_backtest/sim"
	strategies "github.com/nntaoli-project/goex_backtest/strategies"
	"github.com/robertkrimen/otto"
)

var (
	Executor      = make(map[int64]*Global)
	errHalt       = fmt.Errorf("HALT")
	ExchangeMaker = map[string]func(arg interface{}) api.Exchange{
		constant.Okex: api.NewOKEX,
		//constant.Binance: api.NewBinance,
	}
)

// GetTraderStatus ...
func GetTraderStatus(id int64) (status int64) {
	if t, ok := Executor[id]; ok && t != nil {
		status = t.Status
	}
	return
}

func Switch(id int64, api []model.ApiConfig) (err error) {
	if GetTraderStatus(id) > 0 {
		return stop(id, api)
	}
	if len(api) > 0 {
		return run(id, api)
	}

	return nil
}

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

	trader.ctx.Set("Global", &trader)
	trader.ctx.Set("G", &trader)
	trader.ctx.Set("Exchange", trader.es[0])
	trader.ctx.Set("E", trader.es[0])
	trader.ctx.Set("Exchanges", trader.es)
	trader.ctx.Set("Es", trader.es)
	trader.ctx.Set("Talib", Talib{})
	return
}

func run(apiId int64, apis []model.ApiConfig) (err error) {
	trader, err := initialize(apiId)
	if err == nil {
		fmt.Println("initialize task error")
		return
	}

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

	go func() {
		trader.LastRunAt = time.Now()
		trader.Status = 1
		Executor[trader.ID] = &trader

		// RUN javascript
		if _, err := trader.ctx.Run(trader.Algorithm.Script); err != nil {
			trader.Logger.Log(constant.ERROR, "", 0.0, 0.0, err)
		}

		if subscribe, err := trader.ctx.Get("subscribe"); err == nil && subscribe.IsFunction() {
			//	这里需要开发group chan接口，做多任务订阅
			taskIds := []int64{}
			for _, v := range apis {
				taskIds = append(taskIds, v.ID)
			}
			taskLib.RunGroupTask(taskIds, apiId, runClientSubscribe(trader, subscribe))
		} else if main, err := trader.ctx.Get("main"); err != nil || !main.IsFunction() {
			trader.Logger.Log(constant.ERROR, "", 0.0, 0.0, "Can not get the main function")
		} else {
			if _, err := main.Call(main); err != nil {
				trader.Logger.Log(constant.ERROR, "", 0.0, 0.0, err)
			}
		}
	}()
	return
}

func RunBackTesting(id int64, algorithm model.Algorithm) error {
	sim := sim2.NewExchangeSimWithTomlConfig(goex.BINANCE)
	trader, err := initializeBackTestingVM(sim)
	if err != nil {
		return err
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
		Executor[trader.ID] = &trader

		// RUN javascript
		if _, err := trader.ctx.Run(algorithm.Script); err != nil {
			trader.Logger.Log(constant.ERROR, "", 0.0, 0.0, err)
		}

		if subscribe, err := trader.ctx.Get("subscribe"); err == nil && subscribe.IsFunction() {
			ctx, cancel := context.WithCancel(context.Background())
			go func() {
				sig := make(chan os.Signal, 1)
				signal.Notify(sig, os.Interrupt, os.Kill)
				for {
					select {
					case <-sig:
						cancel()
						return
					}
				}
			}()

			backtestStatistics := sim2.NewBacktestStatistics([]*sim2.ExchangeSim{sim})

			strategy := strategies.NewDoubleMovingStrategy(sim, goex.KLINE_PERIOD_1MIN, 600, 150, goex.BTC_USDT)
			// subscribe need run by backtest.Main
			strategy.Main(subscribe, ctx)

			backtestStatistics.NetAssetReport()
			backtestStatistics.OrderReport()
			backtestStatistics.TaLibReport()
		}
	}()
	return nil
}

func initializeBackTestingVM(sim *sim2.ExchangeSim) (Global, error) {
	trader := Global{}
	trader.tasks = make(Tasks)
	trader.ctx = otto.New()
	trader.ctx.Interrupt = make(chan func(), 1)
	for _, c := range constant.Consts {
		trader.ctx.Set(c, c)
	}

	trader.ctx.Set("Global", &trader)
	trader.ctx.Set("G", &trader)
	trader.ctx.Set("Exchange", sim)
	trader.ctx.Set("E", sim)
	trader.ctx.Set("Exchanges", sim)
	trader.ctx.Set("Es", sim)
	trader.ctx.Set("Talib", Talib{})
	return trader, nil
}

func runClientSubscribe(trader Global, subscribe otto.Value) func(data []interface{}) {
	return func(data []interface{}) {
		//for k, v := range data {
		//
		//}
		if _, err := subscribe.Call(subscribe, data...); err != nil {
			trader.Logger.Log(constant.ERROR, "", 0.0, 0.0, err)
		}
	}
}

func stop(id int64, apis []model.ApiConfig) (err error) {
	if t, ok := Executor[id]; !ok || t == nil {
		return fmt.Errorf("Can not found the Trader")
	}

	taskIds := []int64{}
	for _, v := range apis {
		taskIds = append(taskIds, v.ID)
		task, err := taskLib.GetTask(v.ID)

		if err != nil {
			continue
		}
		task.RemoveListener(id)
	}

	trader := Executor[id]
	trader.Status = 0
	delete(Executor, id)
	return
}
