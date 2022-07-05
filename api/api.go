package api

import "github.com/nntaoli-project/goex"

// Option is an exchange option
type Option struct {
	TraderID   int64
	Type       string
	Name       string
	AccessKey  string
	SecretKey  string
	Passphrase string
	Test       string
	HttpProxy  string
	HttpsProxy string
}

// Exchange interface
type Exchange interface {
	goex.API
	Log(...interface{})
	GetType() string
	SetLimit(times interface{}) float64
	AutoSleep()
	GetMinAmount(stock string) float64
}

var (
	constructor = map[string]func(Option) Exchange{}
)
