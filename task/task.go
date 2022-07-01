package task

import (
	"context"
	"fmt"

	"github.com/Impress-semirding/quant/api"
)

type Task struct {
	TaskId int64
	Topic  string
	status int64
	api.Option
	Ctx    context.Context
	Cancel context.CancelFunc
}

type SubscribeFuncType = func(ch chan DataEvent)

type RunTaskFucType = func(t *Task)

var (
	ExecutorTask = make(map[int64]*Task)
)

func NewTask(p Task) (t *Task) {
	ctx, cancel := createTaskContext(p.TaskId)
	return &Task{
		TaskId: p.TaskId,
		Topic:  p.Topic,
		Option: p.Option,
		Ctx:    ctx,
		Cancel: cancel,
	}
}

func (t *Task) Run(taskfunc RunTaskFucType) {
	if t := ExecutorTask[t.TaskId]; t != nil && t.status > 0 {
		fmt.Println("任务正在执行中...请勿连续执行")
		return
	}

	t.status = 1
	ExecutorTask[t.TaskId] = t

	go taskfunc(t)
}

func (t *Task) Sub(callback SubscribeFuncType) (c chan DataEvent) {
	ch := make(chan DataEvent)
	eb.Subscribe(t.Topic, ch)
	go callback(ch)

	return ch
}

func (t *Task) Pub(data interface{}) {
	go eb.Publish(t.Topic, data)
}

func Stop(id int64) bool {
	defer func() {
		t := GetTask(id)
		if t == nil {
			return
		}
		t.status = 0
		delete(ExecutorTask, t.TaskId)
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

func createTaskContext(id int64) (c context.Context, ca context.CancelFunc) {
	ctx, cancel := context.WithCancel(context.Background())
	return ctx, cancel
}

func GetTask(id int64) (t *Task) {
	if id == 0 {
		return nil
	}
	task := ExecutorTask[id]
	return task
}

func GetContext(id int64) (c context.Context, cancel context.CancelFunc) {
	if id == 0 {
		return nil, nil
	}
	task := ExecutorTask[id]
	return task.Ctx, task.Cancel
}
