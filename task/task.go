package task

type Task struct {
	topic string
}

func NewTask(topic string) (t *Task) {
	task := &Task{
		topic: topic,
	}
	return task
}

func (t *Task) Sub() (c chan DataEvent) {
	ch := make(chan DataEvent)
	eb.Subscribe(t.topic, ch)
	return ch
}

func (t *Task) Pub(data interface{}) {
	go eb.Publish(t.topic, data)
}
