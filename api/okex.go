package api

import (
	"time"

	"github.com/miaolz123/conver"
	"github.com/phonegapX/QuantBot/constant"
	"github.com/phonegapX/QuantBot/model"

	"github.com/nntaoli-project/goex"
	"github.com/nntaoli-project/goex/builder"
)

const (
	message = "hello world!"
	secret  = "0933e54e76b24731a2d84b6b463ec04c"
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
	goex.API
}

var mgnModes map[string]bool = map[string]bool{
	"cross":    true,
	"isolated": true,
}

// NewOKEX create an exchange struct of okex.com
func NewOKEX(opt Option) Exchange {
	apiKey := opt.AccessKey
	secretKey := opt.SecretKey
	passphrase := opt.Passphrase
	api := builder.DefaultAPIBuilder.HttpProxy("http://127.0.0.1:8001").APIKey(apiKey).APISecretkey(secretKey).ApiPassphrase(passphrase).Build(goex.OKEX) //创建现货api实例
	ok := &OKEX{
		stockTypeMap: map[string]string{
			"BTC/USDT":      "BTC-USDT",
			"ETH/USDT":      "ETH-USDT",
			"EOS/USDT":      "eos_usdt",
			"ONT/USDT":      "ont_usdt",
			"QTUM/USDT":     "qtum_usdt",
			"ONT/ETH":       "ont_eth",
			"BTC/USD/SWAP":  "BTC-USD-SWAP",
			"BTC/USDT/SWAP": "BTC-USDT-SWAP",
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
		records: make(map[string][]Record),
		// host:    "https://www.okex.com/api/v1/",
		host:   "https://www.okx.com/api/v5/",
		logger: model.Logger{TraderID: opt.TraderID, ExchangeType: opt.Type},
		option: opt,

		limit:     10.0,
		lastSleep: time.Now().UnixNano(),
		API:       api,
	}

	return ok
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
