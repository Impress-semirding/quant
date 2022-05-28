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

type booling struct {
	upper  []float64
	middle []float64
	lower  []float64
}

func (t Talib) Bool(price []float64, period int) map[string][]float64 {
	upper, middle, lower := talib.BBands(price, period, 2, 2, 0)
	return map[string][]float64{
		"upper":  upper,
		"middle": middle,
		"lower":  lower,
	}
}
