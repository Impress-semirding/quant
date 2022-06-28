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
	self, err := model.GetUser(username)
	if err != nil {
		resp.Message = fmt.Sprint(err)
		return
	}
	api := req
	if req.ID > 0 {
		if err := model.DB.First(&api, req.ID).Error; err != nil {
			resp.Message = fmt.Sprint(err)
			return
		}
		api.FuncName = req.FuncName
		api.ExchangeType = req.ExchangeType
		if err := model.DB.Save(&api).Error; err != nil {
			resp.Message = fmt.Sprint(err)
			return
		}
		api.Period = req.Period
		resp.Success = true
		return
	}
	req.UserID = self.ID
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
	self, err := model.GetUser(username)
	if err != nil {
		resp.Message = fmt.Sprint(err)
		return
	}
	total, apiConfig, err := self.ListApiConfig(size, page, order)
	if err != nil {
		resp.Message = fmt.Sprint(err)
		return
	}
	resp.Data = struct {
		Total int64
		List  []model.ApiConfig
	}{
		Total: total,
		List:  apiConfig,
	}
	resp.Success = true
	return
}
