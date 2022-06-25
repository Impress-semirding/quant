package trader

import (
	"github.com/markcheno/go-talib"
)

type Talib struct {
}

func (t Talib) Rsi(prices []float64, period int) interface{} {
	result := talib.Rsi(prices, period)
	return result
}

func (t Talib) Ema(prices []float64, period int) interface{} {
	result := talib.Ema(prices, period)
	return result
}

func (t Talib) Ma(prices []float64, period int, inMAType talib.MaType) interface{} {
	result := talib.Ma(prices, period, inMAType)
	return result
}

func (t Talib) Bool(price []float64, period int) map[string][]float64 {
	upper, middle, lower := talib.BBands(price, period, 2, 2, 0)
	return map[string][]float64{
		"upper":  upper,
		"middle": middle,
		"lower":  lower,
	}
}
