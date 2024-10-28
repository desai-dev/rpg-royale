package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand/v2"

	"github.com/gorilla/websocket"
)

// List of connected clients
type ClientList map[*Client]bool

// A Client
type Client struct {
	connection    *websocket.Conn
	manager       *Manager
	party         *Party
	guns          []*Gun
	curGunIdx     int
	inParty       bool
	playerId      int
	position      Position
	velocityX     float64
	speedX        float64
	velocityY     float64
	lastXMovement string
	jumpPower     float64
	isGrounded    bool
	health        float64
	height        float64
	width         float64
	inputNumber   int // Tracks how many inputs the server has processed
	// egress is used to avoid concurrent writes on the WebSocket
	// since gorilla only allows one concurrent writer
	egress chan *Event
}

// Initializes a new client
func NewClient(conn *websocket.Conn, manager *Manager) *Client {
	sniper := NewGun("Sniper")
	wallbreaker := NewGun("Wallbreaker")

	return &Client{
		connection:    conn,
		manager:       manager,
		party:         nil,
		guns:          []*Gun{sniper, wallbreaker},
		curGunIdx:     0,
		inParty:       false,
		position:      Position{X: 0, Y: 0},
		speedX:        playerSpeedX,
		velocityX:     0,
		velocityY:     0,
		lastXMovement: "",
		jumpPower:     playerJumpPower,
		isGrounded:    false,
		health:        playerHealth,
		height:        playerHeight,
		width:         playerWidth,
		egress:        make(chan *Event),
		playerId:      0,
		inputNumber:   0,
	}
}

// Updates a Clients position to given x and y coordinates
func (c *Client) updatePosition(x float64, y float64) {
	c.position.X = x
	c.position.Y = y
}

// Respawns a player
func (c *Client) respawnPlayer() {
	c.updatePosition(rand.Float64()*playerSpawnMaxX, 0)
	c.health = playerHealth
	c.isGrounded = false
	c.velocityX = 0
	c.velocityY = 0
	c.lastXMovement = ""
}

// Switches the clients gun to the next gun in the gun array
func (c *Client) switchGun() {
	c.curGunIdx = (c.curGunIdx + 1) % len(c.guns)
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
