package task

type Group struct {
}

type callbackType = func(ch chan DataEvent)

func RunGroupTask(ids []int64, callback callbackType) {
	for _, v := range ids {
		task := GetTask(v)
		//	adapt
		task.Sub(callback)
	}
}
