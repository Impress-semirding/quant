package handler

import (
	"fmt"
	"time"

	"github.com/Impress-semirding/quant/constant"
	"github.com/Impress-semirding/quant/model"
	taskLib "github.com/Impress-semirding/quant/task"
	"github.com/Impress-semirding/quant/trader"
	"github.com/hprose/hprose-golang/rpc"
	"github.com/nntaoli-project/goex"
)

type apiConfig struct{}

var (
	instIdMaps = map[string]goex.CurrencyPair{"BTC-USDT": goex.BTC_USDT, "ETH-USDT": goex.ETH_USDT}
)

//	 put
func (apiConfig) Put(req model.ApiConfig, ctx rpc.Context) (resp response) {
	username := ctx.GetString("username")
	if username == "" {
		resp.Message = constant.ErrAuthorizationError
		return
	}
	if req.ExchangeType == "" || req.FuncName == "" || req.Period == 0 {
		resp.Message = fmt.Sprintln("exchangeType和funcName,Period参数不能为空")
		return
	}
	apiConfig, _ := model.GetTaskConfig(req.ExchangeType, req.FuncName, req.InstId, req.Period)
	// if err != nil {
	// 	resp.Message = fmt.Sprint(err)
	// 	return
	// }

	if apiConfig.ID != 0 {
		resp.Message = fmt.Sprintln("任务已存在")
		return
	}

	if err := model.DB.Create(&req).Error; err != nil {
		resp.Message = fmt.Sprint(err)
		return
	}
	resp.Success = true
	return
}

// List ...
func (apiConfig) List(size, page int64, order string, ctx rpc.Context) (resp response) {
	username := ctx.GetString("username")
	if username == "" {
		resp.Message = constant.ErrAuthorizationError
		return
	}
	_, err := model.GetUser(username)
	if err != nil {
		resp.Message = fmt.Sprint(err)
		return
	}
	apiConfig, _ := model.ListApiConfig()

	var tasks []model.ApiConfig
	for _, item := range apiConfig {
		id := taskLib.GetTaskStatus(item.ID)
		if id > 0 {
			item.Status = "Y"
		} else {
			item.Status = "N"
		}
		tasks = append(tasks, item)
	}
	resp.Data = struct {
		Total int64
		List  []model.ApiConfig
	}{
		Total: int64(len(apiConfig)),
		List:  tasks,
	}
	resp.Success = true
	return
}

func (apiConfig) Run(id int, ctx rpc.Context) (resp response) {
	username := ctx.GetString("username")
	if username == "" {
		resp.Message = constant.ErrAuthorizationError
		return
	}
	if id == 0 {
		resp.Message = fmt.Sprintln("执行任务ID不能缺失")
		return
	}

	taskConfig, err := model.GetTaskConfigById(id)
	if err != nil {
		resp.Message = fmt.Sprint(err)
		return
	}

	topic := taskConfig.ExchangeType + "-" + taskConfig.FuncName + "-" + taskConfig.InstId + "-" + fmt.Sprint(taskConfig.Period)
	fmt.Println("topic", topic)
	task := taskLib.NewTask(taskLib.Task{
		TaskId: taskConfig.ID,
		//Option: option,
		Topic: topic,
	})

	fmt.Println("topic", topic)

	task.Sub(outputChan)
	task.Run(runTask(taskConfig))

	resp.Success = true
	return
}

func (apiConfig) Stop(id int64, ctx rpc.Context) (resp response) {
	taskLib.Stop(id)

	resp.Success = true
	return resp
}

func outputChan(ch chan taskLib.DataEvent) {
	for {
		select {
		case d := <-ch:
			fmt.Println("ch:", d)
		}
	}
}

func runTask(taskConfig model.ApiConfig) taskLib.RunTaskFucType {
	return func(task *taskLib.Task) {
		ctx := task.Ctx
		for {
			select {
			case <-ctx.Done():
				fmt.Printf("ctx.Done")
				return
			default:
				if maker, ok := trader.ExchangeMaker[taskConfig.ExchangeType]; ok {
					client := maker(task.Option)
					fmt.Println("start", time.Now())
					data, err := client.GetKlineRecords(instIdMaps[taskConfig.InstId], goex.KlinePeriod(taskConfig.Period), 100)
					if err == nil {
						fmt.Println("end", time.Now())
						task.Pub(data)
						time.Sleep(100 * time.Millisecond)
					}
				}

			}
		}

	}
}
