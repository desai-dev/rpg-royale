package main

import (
	"math/rand"
	"time"
)

// Generates a random string of given length
func GenerateRandomString(n int) string {
	rand.New(rand.NewSource(time.Now().UnixNano()))
	const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letterBytes[rand.Intn(len(letterBytes))]
	}
	return string(b)
}
