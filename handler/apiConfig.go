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
	apiConfig, _ := model.GetTaskConfig(req.ExchangeType, req.FuncName, req.Period)
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
		item.Status = task.GetTaskStatus(item.ID)
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

	exchange, err := model.GetExchange("okex")
	if err != nil {
		resp.Message = fmt.Sprint(err)
		return
	}

	topic := taskConfig.ExchangeType + "-" + taskConfig.FuncName + "-" + fmt.Sprint(taskConfig.Period)
	fmt.Println("topic", topic)
	taskInstance := task.NewTask(taskConfig.ID, topic)
	// ch := task.Sub()

	option := api.Option{
		AccessKey:  exchange.AccessKey,
		SecretKey:  exchange.SecretKey,
		Passphrase: exchange.Passphrase,
	}

	//	test cas
	t, _ := task.CreateTaskContext(taskConfig.ID)

	go taskInstance.Run(t, option)

	resp.Success = true
	return
}

func (apiConfig) Stop(id int64, ctx rpc.Context) (resp response) {
	_, cancel := task.GetContext(id)
	cancel()

	resp.Success = true
	return resp
}

func dealSign(ch chan task.DataEvent) {
	for {
		select {
		case d := <-ch:
			fmt.Println("ch:", d)
		}
	}
}
