package task

func RunGroupTask(taskIds []int64, apiId int64, listener func(data []interface{})) {
	queue := []interface{}{}
	chs := []chan DataEvent{}

	for _, v := range taskIds {
		task, err := GetTask(v)

		if err != nil {
			continue
		}
		//	sub api接口数据
		c := task.Sub(apiId)
		chs = append(chs, c)
	}

	size := len(taskIds)

	for {
		for _, v := range chs {
			data := <-v
			queue = append(queue, data)
		}

		if size == len(queue) {
			listener(queue)
			queue = []interface{}{}
		}
	}
}
