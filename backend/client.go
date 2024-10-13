package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/gorilla/websocket"
)

// List of connected clients
type ClientList map[*Client]bool

// A Client
type Client struct {
	connection  *websocket.Conn
	manager     *Manager
	party       *Party
	inParty     bool
	playerId    int
	position    Position
	velocityX   float64
	speedX      float64
	velocityY   float64
	jumpPower   float64
	isGrounded  bool
	height      float64
	width       float64
	inputNumber int // Tracks how many inputs the server has processed
	// egress is used to avoid concurrent writes on the WebSocket
	// since gorilla only allows one concurrent writer
	egress chan *Event
}

// Initializes a new client
func NewClient(conn *websocket.Conn, manager *Manager) *Client {
	return &Client{
		connection:  conn,
		manager:     manager,
		party:       nil,
		inParty:     false,
		position:    Position{X: 0, Y: 0}, // This value is properly set when a game starts
		speedX:      500,
		velocityX:   0,
		velocityY:   0,
		jumpPower:   -800,
		isGrounded:  true,
		height:      150,
		width:       60,
		egress:      make(chan *Event),
		playerId:    0, // This value is properly set when a game starts
		inputNumber: 0,
	}
}

// Updates a Clients position to given x and y coordinates
func (c *Client) updatePosition(x float64, y float64) {
	c.position.X = x
	c.position.Y = y
}

// Read messages from a client
func (c *Client) readMessages() {
	defer func() {
		c.cleanupWsConnection()
	}()

	for {
		_, payload, err := c.connection.ReadMessage()

		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error reading message: %v", err)
			}
			return
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
		c.cleanupWsConnection()
	}()

	// Continuously listen for messages from the egress channel
	for message := range c.egress {
		// If the channel is closed, break out of the loop and clean up
		if message == nil {
			if err := c.connection.WriteMessage(websocket.CloseMessage, nil); err != nil {
				log.Println("connection closed: ", err)
				return
			}
		}

		// Marshal the message to JSON
		data, err := json.Marshal(message)
		if err != nil {
			log.Println("error in marshalling: ", err)
			return
		}

		// Write the message to the websocket connection
		if err := c.connection.WriteMessage(websocket.TextMessage, data); err != nil {
			log.Println("error writing message: ", err)
		}
	}
}

// Function to clean up after websocket connection closed by either client or server
func (c *Client) cleanupWsConnection() {
	// Remove client from list of clients
	c.manager.removeClient(c)

	// Remove client from party
	if c.party != nil {
		c.party.removePartyPlayer(c)
		if c.party.partySize == 0 {
			delete(c.manager.parties, c.party.id) // Delete party, and stop the parties game thread
			c.party.stopGameTicker()              // if no players are in the party
		}
	}

	fmt.Println("Here is an update of all the parties: ")
	for id, party := range c.manager.parties {
		fmt.Printf("Party ID: %s, Number of Players: %d\n", id, len(party.players))
	}
}

//////// ******** Functions for Collider interface implementation ******** ////////

func (c *Client) Position() Position {
	return c.position
}

func (c *Client) Width() float64 {
	return c.width
}

func (c *Client) Height() float64 {
	return c.height
}

//////// ******** End of Functions for Collider interface implementation ******** ////////
