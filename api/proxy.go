package api

import (
	"os"
)

func setProxy() {
	arg := os.Args[1:]
	for _, v := range arg {
		if v == "--proxy=true" {
			os.Setenv("HTTP_PROXY", "http://127.0.0.1:8001")
			os.Setenv("HTTPS_PROXY", "http://127.0.0.1:8001")
		}
	}
}
