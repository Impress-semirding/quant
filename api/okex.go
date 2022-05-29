package api

import (
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/miaolz123/conver"
	"github.com/phonegapX/QuantBot/constant"
	"github.com/phonegapX/QuantBot/model"
	"github.com/phonegapX/QuantBot/utils"

	"github.com/nntaoli-project/goex"
	"github.com/nntaoli-project/goex/okex/v5"
)

// OKEX the exchange struct of okex.com
type OKEX struct {
	stockTypeMap     map[string]string
	tradeTypeMap     map[string]string
	recordsPeriodMap map[string]string
	minAmountMap     map[string]float64
	records          map[string][]Record
	host             string
	logger           model.Logger
	option           Option

	limit     float64
	lastSleep int64
	lastTimes int64
	*okex.OKExV5
}

func NewOKEX(opt Option) *OKEX {
	os.Setenv("HTTP_PROXY", "http://127.0.0.1:8001")
	os.Setenv("HTTPS_PROXY", "http://127.0.0.1:8001")
	config := goex.APIConfig{
		Endpoint:      "https://www.okx.com",
		ApiKey:        opt.AccessKey,
		ApiSecretKey:  opt.SecretKey,
		ApiPassphrase: opt.Passphrase,
	}

	config.HttpClient = &http.Client{}
	// if opt.HttpProxy != "" {
	// 	config.HttpClient = &http.Client{
	// 		Transport: &http.Transport{
	// 			Proxy: func(req *http.Request) (*url.URL, error) {
	// 				return &url.URL{
	// 					Scheme: "socks5",
	// 					Host:   opt.HttpProxy,
	// 				}, nil
	// 			},
	// 		},
	// 	}
	// } else {
	// 	config.HttpClient = &http.Client{
	// 		Transport: &http.Transport{
	// 			Proxy: func(req *http.Request) (*url.URL, error) {
	// 				return &url.URL{
	// 					Scheme: "socks5",
	// 					Host:   "https://127.0.0.1:8001",
	// 				}, nil
	// 			},
	// 		},
	// 	}
	// }

	apiClient := okex.NewOKExV5(&config)

	return &OKEX{
		stockTypeMap: map[string]string{
			"BTC-USDT":      "BTC-USDT",
			"ETH-USDT":      "ETH-USDT",
			"BTC-USD-SWAP":  "BTC-USD-SWAP",
			"BTC-USDT-SWAP": "BTC-USDT-SWAP",
		},
		tradeTypeMap: map[string]string{
			"buy":         constant.TradeTypeBuy,
			"sell":        constant.TradeTypeSell,
			"buy_market":  constant.TradeTypeBuy,
			"sell_market": constant.TradeTypeSell,
		},
		recordsPeriodMap: map[string]string{
			"M":   "1m",
			"M5":  "5m",
			"M15": "15m",
			"M30": "30m",
			"H":   "1H",
			"H4":  "4H",
			"D":   "1D",
			"W":   "1W",
		},
		minAmountMap: map[string]float64{
			"BTC/USDT":  0.001,
			"ETH/USDT":  0.001,
			"EOS/USDT":  0.001,
			"ONT/USDT":  0.001,
			"QTUM/USDT": 0.001,
			"ONT/ETH":   0.001,
		},
		records:   make(map[string][]Record),
		logger:    model.Logger{TraderID: opt.TraderID, ExchangeType: opt.Type},
		option:    opt,
		limit:     10.0,
		lastSleep: time.Now().UnixNano(),
		OKExV5:    apiClient,
	}
}

// Log print something to console
func (e *OKEX) Log(msgs ...interface{}) {
	e.logger.Log(constant.INFO, "", 0.0, 0.0, msgs...)
}

// GetType get the type of this exchange
func (e *OKEX) GetType() string {
	return e.option.Type
}

// GetName get the name of this exchange
func (e *OKEX) GetName() string {
	return e.option.Name
}

// SetLimit set the limit calls amount per second of this exchange
func (e *OKEX) SetLimit(times interface{}) float64 {
	e.limit = conver.Float64Must(times)
	return e.limit
}

// AutoSleep auto sleep to achieve the limit calls amount per second of this exchange
func (e *OKEX) AutoSleep() {
	now := time.Now().UnixNano()
	interval := 1e+9/e.limit*conver.Float64Must(e.lastTimes) - conver.Float64Must(now-e.lastSleep)
	if interval > 0.0 {
		time.Sleep(time.Duration(conver.Int64Must(interval)))
	}
	e.lastTimes = 0
	e.lastSleep = now
}

// GetMinAmount get the min trade amonut of this exchange
func (e *OKEX) GetMinAmount(stock string) float64 {
	return e.minAmountMap[stock]
}

//	获取单个产品行情信息
func (e *OKEX) GetTicker(instId string) interface{} {
	if _, ok := e.stockTypeMap[instId]; !ok {
		e.Log("error instId not in stockTypeMap")
		return nil
	}
	tickets, err := e.OKExV5.GetTickerV5(instId)
	if err != nil {
		e.Log("error", err)
		return nil
	}

	data, _ := utils.ToMapJson(tickets)
	return data
}

func (e *OKEX) GetKlineRecords(instId string, period int, options ...utils.OptionalParameter) []Record {
	if _, ok := e.stockTypeMap[instId]; !ok {
		e.Log("error instId not in stockTypeMap")
		return nil
	}

	param := &url.Values{}
	utils.MergeOptionalParameter(param, options...)

	tickets, err := e.OKExV5.GetKlineRecordsV5(instId, goex.KlinePeriod(period), param)
	if err != nil {
		e.Log("error", err)
		return nil
	}

	recordsNew := []Record{}
	for _, v := range tickets {
		recordsNew = append([]Record{{
			Time:   conver.Int64Must(v[0]),
			Open:   conver.Float64Must(v[1]),
			High:   conver.Float64Must(v[2]),
			Low:    conver.Float64Must(v[3]),
			Close:  conver.Float64Must(v[4]),
			Volume: conver.Float64Must(v[5]),
		}}, recordsNew...)
	}

	return recordsNew

	// json, err := simplejson.NewJson(tickets)
	// if err != nil {
	// e.logger.Log(constant.ERROR, "", 0.0, 0.0, "GetRecords() error, ", err)
	// return false
	// }
}

func (e *OKEX) Trade(options utils.OptionalParameter) interface{} {
	instId, _ := options["instId"].(string)
	tdMode, _ := options["tdMode"].(string)
	side, _ := options["side"].(string)
	ordType, _ := options["ordType"].(string)
	sz, _ := options["sz"].(string)
	price, _ := options["px"].(string)

	if instId == "" {
		e.Log("error, need provider instId")
		return nil
	}

	if tdMode == "" {
		e.Log("error, need provider instId")
		return nil
	}
	if side == "" {
		e.Log("error, need provider instId")
		return nil
	}

	if ordType == "" {
		e.Log("error, need provider instId")
		return nil
	}

	if sz == "" {
		e.Log("error, need provider instId")
		return nil
	}

	if price == "" {
		e.Log("error, need provider instId")
		return nil
	}

	params := &okex.CreateOrderParam{
		Symbol:    instId,
		TradeMode: tdMode,
		Side:      side,
		OrderType: ordType,
		Size:      sz,
		Price:     price,
		PosSide:   "short",
	}
	res, err := e.CreateOrder(params)
	if err != nil {
		e.Log("error, need provider instId")
		return nil
	}

	if res.SCode != "0" {
		e.Log("error, 下单失败")
		return nil
	}
	// return res
	return res.OrdId
}

func (e *OKEX) GetAccountPosition(options ...map[string]interface{}) interface{} {
	res, err := e.OKExV5.GetAccountPosition()

	if err != nil {
		e.Log("error, need provider instId")
		return nil
	}

	return res
}
