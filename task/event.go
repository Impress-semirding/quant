package task

import (
	"sync"
)

type DataEvent struct {
	Data  interface{}
	Topic string
}

type DataChannel struct {
	ch chan DataEvent
	id int64
}

type DataChannelSlice []DataChannel

type EventBus struct {
	subscribers map[string]DataChannelSlice
	rm          sync.RWMutex
}

var eb = &EventBus{
	subscribers: map[string]DataChannelSlice{},
}

func (eb *EventBus) Publish(topic string, data interface{}) {
	eb.rm.RLock()
	if chans, found := eb.subscribers[topic]; found {
		channels := append(DataChannelSlice{}, chans...)
		go func(data DataEvent, dataChannelSlices DataChannelSlice) {
			for _, m := range dataChannelSlices {
				m.ch <- data
			}
		}(DataEvent{Data: data, Topic: topic}, channels)
	}
	eb.rm.RUnlock()
}

func (eb *EventBus) Subscribe(topic string, m DataChannel) {
	eb.rm.Lock()
	if prev, found := eb.subscribers[topic]; found {
		eb.subscribers[topic] = append(prev, m)
	} else {
		eb.subscribers[topic] = append([]DataChannel{}, m)
	}
	eb.rm.Unlock()
}

func (eb *EventBus) removeListener(topic string, id int64) {
	eb.rm.Lock()
	if prev, found := eb.subscribers[topic]; found {
		index := -1
		for k, v := range prev {
			if v.id == id {
				index = k
			}
		}
		if index >= 0 {
			eb.subscribers[topic] = append(prev[:index], prev[index+1:]...)
		}
	}
	eb.rm.Unlock()
}
