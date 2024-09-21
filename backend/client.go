package main

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

// List of connected clients
type ClientList map[*Client]bool

// A Client
type Client struct {
	connection *websocket.Conn
	manager    *Manager
	party      *Party
	inParty    bool
	playerId   int
	// egress is used to avoid concurrent writes on the WebSocket
	// since gorilla only allows one concurrent writer
	egress chan Event
}

// Initializes a new client
func NewClient(conn *websocket.Conn, manager *Manager) *Client {
	return &Client{
		connection: conn,
		manager:    manager,
		party:      nil,
		inParty:    false,
		egress:     make(chan Event),
		playerId:   0, // This value is properly set when a game starts
	}
}

// Read messages from a client
func (c *Client) readMessages() {
	defer func() {
		c.manager.removeClient(c)
	}()

	for {
		_, payload, err := c.connection.ReadMessage()

		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error reading message: %v", err)
			}
			break
		}

		var request Event
		if err := json.Unmarshal(payload, &request); err != nil {
			log.Printf("err in unmarshal: %v", err)
		}

		if err := c.manager.routeEvent(request, c); err != nil {
			log.Printf("err in routing event: %v", err)
		}
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

			data, err := json.Marshal(message)
			if err != nil {
				log.Println("error in marshalling ", err)
				return
			}

			// In this case, the egress channel is still open
			if err := c.connection.WriteMessage(websocket.TextMessage, data); err != nil {
				log.Println(err)
			}
		}

	}
}
