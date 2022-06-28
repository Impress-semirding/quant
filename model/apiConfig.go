package model

import (
	"time"
)

type ApiConfig struct {
	ID           int64      `gorm:"primary_key" json:"id"`
	UserID       int64      `gorm:"index" json:"userId"`
	FuncName     string     `gorm:"type:varchar(50)" json:"funcName"`
	ExchangeType string     `gorm:"type:varchar(50)" json:"exchangeType"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
	DeletedAt    *time.Time `sql:"index" json:"-"`
}
