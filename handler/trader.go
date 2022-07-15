package handler

import (
	"fmt"
	"github.com/miaolz123/conver"

	"github.com/Impress-semirding/quant/constant"
	"github.com/Impress-semirding/quant/model"
	taskLib "github.com/Impress-semirding/quant/task"
	"github.com/Impress-semirding/quant/trader"
	"github.com/hprose/hprose-golang/rpc"
)

type runner struct{}

// List
func (runner) List(algorithmID int64, ctx rpc.Context) (resp response) {
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
	traders, err := self.ListTrader(algorithmID)
	if err != nil {
		resp.Message = fmt.Sprint(err)
		return
	}
	for i, t := range traders {
		traders[i].Status = trader.GetTraderStatus(t.ID)
	}
	resp.Data = traders
	resp.Success = true
	return
}

// Put
func (runner) Put(req model.Trader, ctx rpc.Context) (resp response) {
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
	db, err := model.NewOrm()
	if err != nil {
		resp.Message = fmt.Sprint(err)
		return
	}
	defer db.Close()
	db = db.Begin()
	if req.ID > 0 {
		if err := self.UpdateTrader(req); err != nil {
			resp.Message = fmt.Sprint(err)
			return
		}
		resp.Success = true
		return
	}
	req.UserID = self.ID
	if err := db.Create(&req).Error; err != nil {
		db.Rollback()
		resp.Message = fmt.Sprint(err)
		return
	}
	for _, v := range req.Api {
		traderApi := model.TraderApiConfig{
			TraderID:    req.ID,
			ApiConfigID: v.ID,
		}
		if err := db.Create(&traderApi).Error; err != nil {
			db.Rollback()
			resp.Message = fmt.Sprint(err)
			return
		}
	}
	for _, e := range req.Exchanges {
		traderExchange := model.TraderExchange{
			TraderID:   req.ID,
			ExchangeID: e.ID,
		}
		if err := db.Create(&traderExchange).Error; err != nil {
			db.Rollback()
			resp.Message = fmt.Sprint(err)
			return
		}
	}
	if err := db.Commit().Error; err != nil {
		db.Rollback()
		resp.Message = fmt.Sprint(err)
		return
	}
	resp.Success = true
	return
}

// Delete
func (runner) Delete(id int64, ctx rpc.Context) (resp response) {
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
	if _, err = self.GetTrader(id); err != nil {
		resp.Message = fmt.Sprint(err)
		return
	}
	if err := model.DB.Where("id = ?", id).Delete(&model.Trader{}).Error; err != nil {
		resp.Message = fmt.Sprint(err)
	} else {
		resp.Success = true
	}
	return
}

// Switch
func (runner) Switch(req model.Trader, ctx rpc.Context) (resp response) {
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
	if req, err = self.GetTrader(req.ID); err != nil {
		resp.Message = fmt.Sprint(err)
		return
	}

	var traders model.Trader
	var traderApis []model.TraderApiConfig
	var api []model.ApiConfig
	var ids = []string{}
	if req.ID > 0 {
		model.DB.Where("id = ?", req.ID).Find(&traders)
		model.DB.Model(traders).Related(&traderApis)
		for _, v := range traderApis {
			s, _ := conver.String(v.ApiConfigID)
			ids = append(ids, s)
		}
		model.DB.Where("id IN (?)", ids).Find(&api)
	}

	for _, taskConf := range api {
		task := taskLib.GetTask(taskConf.ID)
		if task == nil {
			resp.Message = fmt.Sprint("交易所api任务未运行，无法订阅api数据")
			return
		}
	}

	if err := trader.Switch(req.ID, api); err != nil {
		resp.Message = fmt.Sprint(err)
		return
	}

	resp.Success = true
	return
}
