package task

func outputChan(ch chan DataEvent) {}

func RunGroupTask(ids []int64, id int64, f func(data []interface{})) {
	queue := []interface{}{}
	chs := []chan DataEvent{}

	for _, v := range ids {
		task := GetTask(v)
		c := task.Sub(id, outputChan)
		chs = append(chs, c)
	}

	size := len(ids)

	for {
		for _, v := range chs {
			data := <-v
			queue = append(queue, data)
		}

		if size == len(queue) {
			//	同步执行订阅任务，保证不会同时发送下单，平单等
			f(queue)
			queue = []interface{}{}
		}
	}
}
