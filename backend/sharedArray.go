package main

import (
	"sync"
)

// A SharedArray provides thread safe access to a collection of items,
// so it can be manipulated by multiple goroutines
type SharedArray[T any] struct {
	items []T
	mutex sync.Mutex
}

// NewSharedArray initializes a new SharedArray
func NewSharedArray[T any]() *SharedArray[T] {
	return &SharedArray[T]{}
}

// Add adds an item to the array (thread-safe)
func (a *SharedArray[T]) Add(item T) {
	a.mutex.Lock()
	defer a.mutex.Unlock()

	a.items = append(a.items, item)
}

// RemoveAll removes and returns all items in the array (thread-safe)
func (a *SharedArray[T]) RemoveAll() []T {
	a.mutex.Lock()
	defer a.mutex.Unlock()

	if len(a.items) == 0 {
		return nil
	}

	items := a.items
	a.items = nil
	return items
}

// GetAll retrieves all items from the array (thread-safe). Use for iteration
func (a *SharedArray[T]) GetAll() []T {
	a.mutex.Lock()
	defer a.mutex.Unlock()
	return append([]T(nil), a.items...)
}

// SetItems sets the items of the SharedArray from an external array
func (a *SharedArray[T]) SetItems(items []T) {
	a.mutex.Lock()
	defer a.mutex.Unlock()
	a.items = items
}

// Length returns the length of the SharedArray (thread-safe)
func (a *SharedArray[T]) Length() int {
	a.mutex.Lock()
	defer a.mutex.Unlock()
	return len(a.items)
}
