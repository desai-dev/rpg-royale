package main

import (
	"log"
	"net/http"
)

func setupRoutes() {
	// Manager to handle websocket connections
	manager := NewManager()

	// Serve frontend and websocket connection api
	http.Handle("/", http.FileServer(http.Dir("../frontend")))
	http.HandleFunc("/ws", manager.serveWS)
}

func main() {
	setupRoutes()
	log.Fatal(http.ListenAndServe(":8080", nil))
}
