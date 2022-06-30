package main

import (
	"github.com/Impress-semirding/quant/handler"
	"github.com/Impress-semirding/quant/task"
)

func main() {
	task.InitTaskContext()
	handler.Server()
}
