package handler

import (
	"fmt"

	"github.com/Impress-semirding/quant/constant"
	"github.com/Impress-semirding/quant/model"
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
