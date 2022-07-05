package api

import "os"

func setProxy() {
	os.Setenv("HTTP_PROXY", "http://127.0.0.1:8001")
	os.Setenv("HTTPS_PROXY", "http://127.0.0.1:8001")
}
