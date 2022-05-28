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
}

// Exchange interface
type Exchange interface {
	goex.API
	Log(...interface{})                 //向管理台发送这个交易所的打印信息
	GetType() string                    //获取交易所类型,是火币还是OKEY等。。。
	GetName() string                    //获取交易所名称,自定义的
	SetLimit(times interface{}) float64 //设置交易所的API访问频率,和 E.AutoSleep() 配合使用
	AutoSleep()                         //自动休眠以满足设置的交易所的API访问频率
	GetMinAmount(stock string) float64  //获取交易所的最小交易数量
}

var (
	constructor = map[string]func(Option) Exchange{}
)
