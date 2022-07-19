package api

import (
	"github.com/Impress-semirding/quant/constant"
	"github.com/Impress-semirding/quant/model"
	"github.com/miaolz123/conver"
	"github.com/nntaoli-project/goex"
	"github.com/nntaoli-project/goex/binance"
	"time"
)

// OKEX the exchange struct of okex.com
type Binance struct {
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
	*binance.Binance
}

//
//func NewBinance(opt interface{}) Exchange {
//	setProxy()
//
//	config := goex.APIConfig{Endpoint: "https://api.binance.com"}
//
//	if v, ok := opt.(Option); ok {
//		config = goex.APIConfig{
//			Endpoint:      "https://api.binance.com",
//			ApiKey:        v.AccessKey,
//			ApiSecretKey:  v.SecretKey,
//			ApiPassphrase: v.Passphrase,
//		}
//	}
//	config.HttpClient = &http.Client{}
//
//	apiClient := binance.NewWithConfig(&config)
//
//	return &Binance{
//		stockTypeMap: map[string]string{
//			"BTC-USDT":      "BTC-USDT",
//			"ETH-USDT":      "ETH-USDT",
//			"BTC-USD-SWAP":  "BTC-USD-SWAP",
//			"BTC-USDT-SWAP": "BTC-USDT-SWAP",
//		},
//		tradeTypeMap: map[string]string{
//			"buy":         constant.TradeTypeBuy,
//			"sell":        constant.TradeTypeSell,
//			"buy_market":  constant.TradeTypeBuy,
//			"sell_market": constant.TradeTypeSell,
//		},
//		recordsPeriodMap: map[string]string{
//			"M":   "1m",
//			"M5":  "5m",
//			"M15": "15m",
//			"M30": "30m",
//			"H":   "1H",
//			"H4":  "4H",
//			"D":   "1D",
//			"W":   "1W",
//		},
//		minAmountMap: map[string]float64{
//			"BTC/USDT":  0.001,
//			"ETH/USDT":  0.001,
//			"EOS/USDT":  0.001,
//			"ONT/USDT":  0.001,
//			"QTUM/USDT": 0.001,
//			"ONT/ETH":   0.001,
//		},
//		records:   make(map[string][]Record),
//		limit:     10.0,
//		lastSleep: time.Now().UnixNano(),
//		Binance:   apiClient,
//	}
//}

// Log print something to console
func (e *Binance) Log(msgs ...interface{}) {
	e.logger.Log(constant.INFO, "", 0.0, 0.0, msgs...)
}

// GetType get the type of this exchange
func (e *Binance) GetType() string {
	return e.option.Type
}

// GetName get the name of this exchange
func (e *Binance) GetName() string {
	return e.option.Name
}

// SetLimit set the limit calls amount per second of this exchange
func (e *Binance) SetLimit(times interface{}) float64 {
	e.limit = conver.Float64Must(times)
	return e.limit
}

// AutoSleep auto sleep to achieve the limit calls amount per second of this exchange
func (e *Binance) AutoSleep() {
	now := time.Now().UnixNano()
	interval := 1e+9/e.limit*conver.Float64Must(e.lastTimes) - conver.Float64Must(now-e.lastSleep)
	if interval > 0.0 {
		time.Sleep(time.Duration(conver.Int64Must(interval)))
	}
	e.lastTimes = 0
	e.lastSleep = now
}

// GetMinAmount get the min trade amonut of this exchange
func (e *Binance) GetMinAmount(stock string) float64 {
	return e.minAmountMap[stock]
}

//func (e *Binance) Trade(options utils.OptionalParameter) interface{} {
//	instId, _ := options["instId"].(string)
//	tdMode, _ := options["tdMode"].(string)
//	side, _ := options["side"].(string)
//	ordType, _ := options["ordType"].(string)
//	sz, _ := conver.String(options["sz"])
//	price, _ := conver.String(options["px"])
//	posSide, _ := options["posSide"].(string)
//
//	if instId == "" {
//		e.Log("error, need provider instId")
//		return nil
//	}
//
//	if tdMode == "" {
//		e.Log("error, need provider tdMode")
//		return nil
//	}
//	if side == "" {
//		e.Log("error, need provider side")
//		return nil
//	}
//
//	if ordType == "" {
//		e.Log("error, need provider ordType")
//		return nil
//	}
//
//	if sz == "" {
//		e.Log("error, need provider sz")
//		return nil
//	}
//
//	if price == "" {
//		e.Log("error, need provider price")
//		return nil
//	}
//
//	e.updateLastTime()
//	params := &okex.CreateOrderParam{
//		Symbol:    instId,
//		TradeMode: tdMode,
//		Side:      side,
//		OrderType: ordType,
//		Size:      sz,
//		Price:     price,
//		PosSide:   posSide,
//	}
//	res, err := e.CreateOrder(params)
//	if err != nil {
//		e.Log(err)
//		return nil
//	}
//
//	if res.SCode != "0" {
//		e.Log("error, 下单失败")
//		return nil
//	}
//	// return res
//	return res.OrdId
//}

func (e *Binance) updateLastTime() {
	e.lastTimes++
}

func (o *Binance) CancelOrder(orderId string, currency goex.CurrencyPair) (bool, error) {
	return false, nil
}

func (o *Binance) GetAccount() (*goex.Account, error) {
	return nil, nil
}

func (o *Binance) GetDepth(size int, currency goex.CurrencyPair) (*goex.Depth, error) {
	return nil, nil
}

//func (o *Binance) GetKlineRecords(currency goex.CurrencyPair, period goex.KlinePeriod, size int, optional ...goex.OptionalParameter) ([]goex.Kline, error) {
//	options := map[string]interface{}{
//		"limit": size,
//	}
//	data := o.GetKline(currency.CurrencyA.Symbol+"-"+currency.CurrencyB.Symbol, int(period), options)
//	if len(data) > 0 {
//		return data, nil
//	}
//	return nil, nil
//}

//非个人，整个交易所的交易记录
func (o *Binance) GetTrades(currencyPair goex.CurrencyPair, since int64) ([]goex.Trade, error) {
	return nil, nil
}

func (o *Binance) GetExchangeName() string {
	return ""
}

func (o *Binance) GetOneOrder(orderId string, currency goex.CurrencyPair) (*goex.Order, error) {
	return nil, nil
}

func (o *Binance) GetOrderHistorys(currency goex.CurrencyPair, opt ...goex.OptionalParameter) ([]goex.Order, error) {
	return nil, nil
}

func (o *Binance) GetTicker(currency goex.CurrencyPair) (*goex.Ticker, error) {
	return nil, nil
}

func (o *Binance) GetUnfinishOrders(currency goex.CurrencyPair) ([]goex.Order, error) {
	return nil, nil
}

func (o *Binance) LimitBuy(amount, price string, currency goex.CurrencyPair, opt ...goex.LimitOrderOptionalParameter) (*goex.Order, error) {
	return nil, nil
}

func (o *Binance) LimitSell(amount, price string, currency goex.CurrencyPair, opt ...goex.LimitOrderOptionalParameter) (*goex.Order, error) {
	return nil, nil
}

func (o *Binance) MarketBuy(amount, price string, currency goex.CurrencyPair) (*goex.Order, error) {
	return nil, nil
}

func (o *Binance) MarketSell(amount, price string, currency goex.CurrencyPair) (*goex.Order, error) {
	return nil, nil
}
