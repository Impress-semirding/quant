package model

import (
	"time"
)

type ApiConfig struct {
	ID           int64      `gorm:"primary_key" json:"id"`
	UserID       int64      `gorm:"index" json:"userId"`
	FuncName     string     `gorm:"type:varchar(50)" json:"funcName"`
	ExchangeType string     `gorm:"type:varchar(50)" json:"exchangeType"`
	Status       string     `gorm:"type:varchar(50);default:N" json:"status"`
	InstId       string     `gorm:"type:varchar(50);default:N" json:"instId"`
	Period       int        `gorm:"type:int" json:"period"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
	DeletedAt    *time.Time `sql:"index" json:"-"`
	Exchanges    Exchange   `gorm:"-" json:"exchange"`
}

// GetUser ...
func GetTaskConfig(exchangeType, funcName string, instId string, period int) (apiConfig ApiConfig, err error) {
	err = DB.Where("exchange_type = ? AND func_name = ? AND inst_id = ? AND period = ?", exchangeType, funcName, instId, period).First(&apiConfig).Error
	return
}

// ListAlgorithm ...
func ListApiConfig() (apiConfig []ApiConfig, err error) {
	err = DB.Find(&apiConfig).Error
	return
}

func GetTaskConfigById(id int) (apiConfig ApiConfig, err error) {
	err = DB.Where("id = ?", id).First(&apiConfig).Error
	return
}
