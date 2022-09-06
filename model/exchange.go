package model

//	即将废弃
import (
	"time"
)

// Exchange struct
type Exchange struct {
	ID           int64      `gorm:"primary_key" json:"id"`
	UserID       int64      `gorm:"index" json:"userId"`
	Name         string     `gorm:"type:varchar(50)" json:"name"`
	ExchangeType string     `gorm:"type:varchar(50)" json:"type"`
	AccessKey    string     `gorm:"type:varchar(200)" json:"accessKey"`
	SecretKey    string     `gorm:"type:varchar(200)" json:"secretKey"`
	Passphrase   string     `gorm:"type:varchar(200)" json:"passphrase"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
	DeletedAt    *time.Time `sql:"index" json:"-"`
	Test         string
}

// ListExchange ...
func (user User) ListExchange(size, page int, order string) (total int64, exchanges []Exchange, err error) {
	_, users, err := user.ListUser(-1, 1, "id")
	if err != nil {
		return
	}
	userIDs := []int64{}
	for _, u := range users {
		userIDs = append(userIDs, u.ID)
	}
	err = DB.Model(&Exchange{}).Where("user_id in (?)", userIDs).Count(&total).Error
	if err != nil {
		return
	}
	if size == -1 {
		size = 1000
	}
	err = DB.Where("user_id in (?)", userIDs).Order(toUnderScoreCase(order)).Limit(size).Offset((page - 1) * size).Find(&exchanges).Error
	return
}

// GetUser ...
func GetExchange(exchangeType string) (exchange Exchange, err error) {
	err = DB.Where("exchange_type = ?", exchangeType).First(&exchange).Error
	return
}
