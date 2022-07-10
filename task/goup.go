package task

import (
	"fmt"
	"sync"
)

var m *sync.RWMutex

type Group struct {
}

type callbackType = func(ch chan DataEvent)

func subs(chs []chan DataEvent) {
	queue := []interface{}{}
	lastAppendType := -1
	m = new(sync.RWMutex)

	for k, v := range chs {
		go func(k int) {
			for {
				select {
				case req := <-v:
					m.Lock()
					if lastAppendType == -1 || lastAppendType != k {
						queue = append(queue, req)
					}

					if len(queue) == len(chs) {
						fmt.Println("chan queue已经请求完毕", queue)
						queue = []interface{}{}
					}
					m.Unlock()
				}
			}
		}(k)
	}
}

func outputChan(ch chan DataEvent) {
	//for {
	//	select {
	//	case d := <-ch:
	//		fmt.Println("ch:", d)
	//	}
	//}
}

func RunGroupTask(ids []int64, f func(ch chan []interface{})) {
	chs := []chan DataEvent{}
	for _, v := range ids {
		task := GetTask(v)
		c := task.Sub(outputChan)
		chs = append(chs, c)
	}

	//subs(queue)
	queue := []interface{}{}
	lastAppendType := -1
	m = new(sync.RWMutex)

	c := make(chan []interface{}, 1)
	go f(c)
	for k, v := range chs {
		go func(k int, v chan DataEvent) {
			for {
				select {
				case req := <-v:
					m.Lock()
					if lastAppendType == -1 || lastAppendType != k {
						lastAppendType = k
						queue = append(queue, req)
					}

					if len(queue) == len(chs) {
						c <- queue
						fmt.Println("chan queue已经请求完毕")
						queue = []interface{}{}
					}
					m.Unlock()
				}
			}
		}(k, v)
	}
}
