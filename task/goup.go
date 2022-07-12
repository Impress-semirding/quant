package task

func outputChan(ch chan DataEvent) {}

func RunGroupTask(ids []int64, f func(data []interface{})) {
	queue := []interface{}{}
	chs := []chan DataEvent{}

	for _, v := range ids {
		task := GetTask(v)
		c := task.Sub(outputChan)
		chs = append(chs, c)
	}

	size := len(ids)

	for {
		for _, v := range chs {
			data := <-v
			queue = append(queue, data)
		}

		if size == len(queue) {
			go f(queue)
			queue = []interface{}{}
		}
	}
}
