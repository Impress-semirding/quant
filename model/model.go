package model

import (
	"database/sql"
	"gorm.io/driver/sqlite"
	"log"
	"time"

	"github.com/hprose/hprose-golang/io"
	"gorm.io/gorm"
	// for db SQL
	"github.com/Impress-semirding/quant/config"
)

var (
	// DB Database
	DB     *gorm.DB
	dbType = config.String("dbtype")
	dbURL  = config.String("dburl")
)

func init() {
	io.Register((*User)(nil), "User", "json")
	io.Register((*Exchange)(nil), "Exchange", "json")
	io.Register((*Algorithm)(nil), "Algorithm", "json")
	io.Register((*Trader)(nil), "Trader", "json")
	io.Register((*Log)(nil), "Log", "json")
	io.Register((*ApiConfig)(nil), "ApiConfig", "json")
	var err error
	DB, err = gorm.Open(sqlite.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Printf("Connect to %v database error: %v\n", dbType, err)
		log.Fatalln("Connect to database error:", err)
	}
	sqlDB, err := DB.DB()

	defer func() {
		if err := recover(); err != nil {
			sqlDB.Close()
		}
	}()

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
	DB.AutoMigrate(&User{}, &Exchange{}, &Algorithm{}, &ApiConfig{}, &TraderExchange{}, &TraderApiConfig{}, &Trader{}, &Log{})
	users := []User{}
	DB.Find(&users)
	if len(users) == 0 {
		admin := User{
			Username: "admin",
			Password: "admin",
			Level:    99,
		}
		if err := DB.Create(&admin).Error; err != nil {
			log.Fatalln("Create admin error:", err)
		}
	}
	go ping(sqlDB)
}

func ping(db *sql.DB) {
	for {
		err := db.Ping()
		if err != nil {
			log.Println("Database ping error:", err)
		}
		time.Sleep(time.Minute)
	}
}
