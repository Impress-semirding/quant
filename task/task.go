package task

import (
	"context"
	"fmt"
	"time"

	"github.com/Impress-semirding/quant/api"
)

type Task struct {
	TaskId int64
	Topic  string
	status int64
	api.Option
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

func NewTask(p Task) (t *Task) {
	return &Task{
		TaskId: p.TaskId,
		Topic:  p.Topic,
		Option: p.Option,
	}
}

func (t *Task) Run(ctx context.Context, instId string, period int) {
	if t := ExecutorTask[t.TaskId]; t != nil && t.status > 0 {
		fmt.Println("任务正在执行中...请勿连续执行")
		return
	}

	defer func() {
		t.status = 0
		ExecutorTask[t.TaskId] = t
	}()

	t.status = 1
	ExecutorTask[t.TaskId] = t

	for {
		select {
		case <-ctx.Done():
			fmt.Printf("ctx.Done")
			return
		default:
			client := api.NewOKEX(t.Option)
			data := client.GetKlineRecords("BTC-USDT", 10)
			t.Pub(data)
			time.Sleep(100 * time.Millisecond)
			fmt.Println("轮训执行任务")
		}
	}
}

func (t *Task) Sub() (c chan DataEvent) {
	ch := make(chan DataEvent)
	eb.Subscribe(t.Topic, ch)
	return ch
}

func (t *Task) Pub(data interface{}) {
	go eb.Publish(t.Topic, data)
}

func Stop(id int64) bool {
	defer func() bool {
		return false
	}()
	_, cancel := GetContext(id)
	cancel()

	return true
}

func GetTaskStatus(id int64) (status int64) {
	if t, ok := ExecutorTask[id]; ok && t != nil {
		status = t.status
	}
	return
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
