package main

import (
	"log"

	"github.com/gorilla/websocket"
)

// List of connected clients
type ClientList map[*Client]bool

// A Client
type Client struct {
	connection *websocket.Conn
	manager    *Manager
	// egress is used to avoid concurrent writes on the WebSocket
	// since gorilla only allows one concurrent writer
	egress chan []byte
}

// Initializes a new client
func NewClient(conn *websocket.Conn, manager *Manager) *Client {
	return &Client{
		connection: conn,
		manager:    manager,
		egress:     make(chan []byte),
	}
}

// Read messages from a client
func (c *Client) readMessages() {
	defer func() {
		c.manager.removeClient(c)
	}()

	for {
		messageType, payload, err := c.connection.ReadMessage()

		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error reading message: %v", err)
			}
			break
		}
		log.Println("MessageType: ", messageType)
		log.Println("Payload: ", string(payload))
	}
}

// writeMessages is a process that listens for new messages to output to the Client
func (c *Client) writeMessages() {
	defer func() {
		c.manager.removeClient(c)
	}()

	for {
		select {
		case message, ok := <-c.egress:
			// Ok will be false if egress channel is closed
			if !ok {
				if err := c.connection.WriteMessage(websocket.CloseMessage, nil); err != nil {
					log.Println("connection closed: ", err)
				}
				// Return to close the goroutine
				return
			}

			// In this case, the egress channel is still oppen
			if err := c.connection.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Println(err)
			}
		}

	}
}
