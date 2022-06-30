package task

import (
	"context"
	"fmt"
	"time"

	"github.com/Impress-semirding/quant/api"
)

type Task struct {
	taskId int64
	topic  string
	status int64
}

type TaskContext struct {
	ctx    context.Context
	cancel context.CancelFunc
}

var (
	goCtx map[int64]TaskContext
)

func InitTaskContext() {
	goCtx = map[int64]TaskContext{}
}

var ExecutorTask = make(map[int64]*Task)

func NewTask(id int64, topic string) (t *Task) {
	task := &Task{
		taskId: id,
		topic:  topic,
	}
	return task
}

func (t *Task) Run(ctx context.Context, option api.Option) {
	if t := ExecutorTask[t.taskId]; t != nil && t.status > 0 {
		fmt.Println("任务正在执行中...请勿连续执行")
		return
	}

	defer func() {
		t.status = 0
		ExecutorTask[t.taskId] = t
	}()

	t.status = 1
	ExecutorTask[t.taskId] = t

	for {
		select {
		case <-ctx.Done():
			fmt.Printf("ctx.Done")
			return
		default:
			client := api.NewOKEX(option)
			data := client.GetKlineRecords("BTC-USDT", 10)
			t.Pub(data)
			time.Sleep(100 * time.Millisecond)
			fmt.Println("轮训执行任务")
		}
	}
}

func Stop() {

}

func GetTaskStatus(id int64) (status int64) {
	if t, ok := ExecutorTask[id]; ok && t != nil {
		status = t.status
	}
	return
}

func (t *Task) Sub() (c chan DataEvent) {
	ch := make(chan DataEvent)
	eb.Subscribe(t.topic, ch)
	return ch
}

func (t *Task) Pub(data interface{}) {
	go eb.Publish(t.topic, data)
}

func CreateTaskContext(id int64) (c context.Context, ca context.CancelFunc) {
	ctx, cancel := context.WithCancel(context.Background())
	goCtx[id] = TaskContext{
		ctx:    ctx,
		cancel: cancel,
	}
	return ctx, cancel
}

func GetContext(id int64) (c context.Context, cancel context.CancelFunc) {
	if id == 0 {
		return nil, nil
	}
	taskContext := goCtx[id]
	return taskContext.ctx, taskContext.cancel
}
