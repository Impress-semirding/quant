package task

import (
	"sync"
)

type DataEvent struct {
	Data  interface{}
	Topic string
}

type DataChannel chan DataEvent

type DataChannelSlice []DataChannel

type EventBus struct {
	subscribers map[string]DataChannelSlice
	rm          sync.RWMutex
}

func (eb *EventBus) Publish(topic string, data interface{}) {
	eb.rm.RLock()
	if chans, found := eb.subscribers[topic]; found {
		// 这样做是因为切片引用相同的数组，即使它们是按值传递的
		// 因此我们正在使用我们的元素创建一个新切片，从而正确地保持锁定
		channels := append(DataChannelSlice{}, chans...)
		go func(data DataEvent, dataChannelSlices DataChannelSlice) {
			for _, ch := range dataChannelSlices {
				ch <- data
			}
		}(DataEvent{Data: data, Topic: topic}, channels)
	}
	eb.rm.RUnlock()
}

func (eb *EventBus) Subscribe(topic string, ch DataChannel) {
	eb.rm.Lock()
	if prev, found := eb.subscribers[topic]; found {
		eb.subscribers[topic] = append(prev, ch)
	} else {
		eb.subscribers[topic] = append([]DataChannel{}, ch)
	}
	eb.rm.Unlock()
}

var eb = &EventBus{
	subscribers: map[string]DataChannelSlice{},
}

// func main() {
// 	ch1 := make(chan DataEvent)
// 	ch2 := make(chan DataEvent)
// 	ch3 := make(chan DataEvent)

// 	eb.Subscribe("topic1", ch1)
// 	eb.Subscribe("topic2", ch2)
// 	eb.Subscribe("topic2", ch3)

// 	go publisTo("topic1", "Hi topic 1")
// 	go publisTo("topic2", "Welcome to topic 2")

// 	for {
// 		select {
// 		case d := <-ch1:
// 			go printDataEvent("ch1", d)
// 		case d := <-ch2:
// 			go printDataEvent("ch2", d)
// 		case d := <-ch3:
// 			go printDataEvent("ch3", d)
// 		}
// 	}
// }
