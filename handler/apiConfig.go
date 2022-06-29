package handler

import (
	"fmt"

	"github.com/Impress-semirding/quant/api"
	"github.com/Impress-semirding/quant/constant"
	"github.com/Impress-semirding/quant/model"
	"github.com/Impress-semirding/quant/task"
	"github.com/hprose/hprose-golang/rpc"
)

type apiConfig struct{}

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
	apiConfig, err := model.GetTaskConfig(req.ExchangeType, req.FuncName, req.Period)
	if err != nil {
		resp.Message = fmt.Sprint(err)
		return
	}

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
	resp.Data = struct {
		Total int64
		List  []model.ApiConfig
	}{
		Total: int64(len(apiConfig)),
		List:  apiConfig,
	}
	resp.Success = true
	return
}

func (apiConfig) Run(req model.ApiConfig, ctx rpc.Context) (resp response) {
	username := ctx.GetString("username")
	if username == "" {
		resp.Message = constant.ErrAuthorizationError
		return
	}
	if req.ID == 0 {
		resp.Message = fmt.Sprintln("执行任务ID不能缺失")
		return
	}

	taskConfig, err := model.GetTaskConfigById(int(req.ID))
	if err != nil {
		resp.Message = fmt.Sprint(err)
		return
	}

	topic := taskConfig.ExchangeType + taskConfig.FuncName + fmt.Sprint(req.Period)
	fmt.Println("topic", topic)
	task := task.NewTask(topic)
	ch := task.Sub()

	exchange, err := model.GetExchange("okex")

	if err != nil {
		resp.Message = fmt.Sprint(err)
		return
	}

	option := api.Option{
		AccessKey:  exchange.Exchanges.AccessKey,
		SecretKey:  exchange.Exchanges.SecretKey,
		Passphrase: exchange.Exchanges.Passphrase,
	}

	//	test case
	go sub(ch)
	go runTask(task, option)

	return
}

func sub(ch chan task.DataEvent) {
	for {
		select {
		case d := <-ch:
			fmt.Println("ch:", d)
		default:
			fmt.Println("位获取到行情信息")
		}
	}
}

func runTask(t *task.Task, option api.Option) {
	client := api.NewOKEX(option)
	data := client.GetKlineRecords("BTC-USDT", 10)
	t.Pub(data)
}
