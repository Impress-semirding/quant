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
	Period       string     `gorm:"type:int" json:"period"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
	DeletedAt    *time.Time `sql:"index" json:"-"`
}

// ListAlgorithm ...
func (user User) ListApiConfig(size, page int64, order string) (total int64, apiConfig []ApiConfig, err error) {
	_, users, err := user.ListUser(-1, 1, "id")
	if err != nil {
		return
	}
	userIDs := []int64{}
	for _, u := range users {
		userIDs = append(userIDs, u.ID)
	}
	err = DB.Model(&ApiConfig{}).Where("user_id in (?)", userIDs).Count(&total).Error
	if err != nil {
		return
	}
	if size == -1 {
		size = 1000
	}
	err = DB.Where("user_id in (?)", userIDs).Order(toUnderScoreCase(order)).Limit(size).Offset((page - 1) * size).Find(&apiConfig).Error
	return
}
