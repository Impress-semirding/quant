package task

import (
	"context"
	"fmt"

	"github.com/Impress-semirding/quant/model"
	cmap "github.com/orcaman/concurrent-map/v2"
)

type ServiceTask = func(ctx context.Context, t Task)

var (
	executorTask = cmap.New[Task]()
)

type Task struct {
	TaskId int64
	Topic  string
	status int64
	model.ApiConfig
	Ctx    context.Context
	Cancel context.CancelFunc
}

func NewTask(id int64, topic string, taskConfig model.ApiConfig) Task {
	ctx, cancel := context.WithCancel(context.Background())
	return Task{
		//	TaskId,Topic,ApiConfig3个字段后续需要对外影藏
		TaskId:    taskConfig.ID,
		Topic:     topic,
		ApiConfig: taskConfig,
		Ctx:       ctx,
		Cancel:    cancel,
	}
}

func (t *Task) Run(serviceTask ServiceTask) {
	_, ok := executorTask.Get(fmt.Sprint(t.TaskId))
	if ok {
		fmt.Println("任务正在执行中...请勿连续执行")
		return
	}

	t.status = 1
	executorTask.Set(fmt.Sprint(t.TaskId), *t)

	serviceTask(t.Ctx, *t)
}

func Stop(id int64) (bool, error) {
	task, err := GetTask(id)
	if err != nil {
		return false, err
	}
	task.Cancel()
	task.status = 0
	executorTask.Remove(fmt.Sprint(task.TaskId))

	return true, nil
}

func GetTask(id int64) (Task, error) {
	if task, ok := executorTask.Get(fmt.Sprint(id)); ok {
		return task, nil
	}

	return Task{}, fmt.Errorf("任务不存在")
}

func GetTaskStatus(id int64) (status int64) {
	task, err := GetTask(id)

	if err != nil {
		return 0
	}

	return task.status
}

//	没有被消费的k线数据在下次数据到来时被丢弃，保证消费端数据相对较新,这里数据处理模型需要更新机制==
func (t *Task) Pub(data interface{}) {
	eb.FlushTopicChan(t.Topic)
	eb.Publish(t.Topic, data)
}

func (t *Task) Sub(id int64) (c chan DataEvent) {
	ch := make(chan DataEvent, 1)
	idCh := DataChannel{
		ch: ch,
		id: id,
	}
	eb.Subscribe(t.Topic, idCh)

	return ch
}

func (t *Task) RemoveListener(id int64) {
	eb.removeListener(t.Topic, id)
}
