package main

import (
	"sync"
)

// A shared queue provides thread safe access, so it can be manipulated
// by multiple goroutines
type SharedQueue[T any] struct {
	items []T
	mutex sync.Mutex
}

// Enqueue adds an item to the queue (thread-safe)
func (q *SharedQueue[T]) Enqueue(item T) {
	q.mutex.Lock()
	defer q.mutex.Unlock()
	q.items = append(q.items, item)
}

// DequeueBatch removes and returns all items in the queue (thread-safe)
func (q *SharedQueue[T]) DequeueBatch() []T {
	q.mutex.Lock()
	defer q.mutex.Unlock()

	if len(q.items) == 0 {
		return nil
	}

	items := q.items
	q.items = nil
	return items
}
