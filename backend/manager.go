package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// Upgrader from gorilla to upgrade http connection to websocket connection
var (
	websocketUpgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
)

// Manager manages clients
type Manager struct {
	clients ClientList
	parties PartyList
	// We need this to lock the state of the manager before adding clients to avoid
	// hash collisions during concurrent connections
	sync.RWMutex

	handlers map[string]EventHandler
}

// Initializes a manager
func NewManager() *Manager {
	m := &Manager{
		clients:  make(ClientList),
		parties:  make(PartyList),
		handlers: make(map[string]EventHandler),
	}

	m.setupEventHandlers()
	return m
}

// Setups up event handlers
func (m *Manager) setupEventHandlers() {
	m.handlers[EventCreateParty] = CreateParty
	m.handlers[EventJoinParty] = JoinParty
	m.handlers[EventPlayerMoved] = PlayerMoved
	m.handlers[EventBulletFired] = BulletFired
	m.handlers[EventBlockPlaced] = BlockPlaced
	m.handlers[EventGunRotation] = GunRotated
}

// Routes an event to the correct handler, if possible
func (m *Manager) routeEvent(event Event, c *Client) error {
	if handler, ok := m.handlers[event.Type]; ok {
		if err := handler(event, m, c); err != nil {
			return err
		}
		return nil
	} else {
		return errors.New("there is no such event")
	}
}

// Create party event handler
func CreateParty(event Event, m *Manager, c *Client) error {
	m.createParty(c)
	return nil
}

// Creates a new party
func (m *Manager) createParty(client *Client) {
	m.Lock()
	defer m.Unlock()

	// Client already in party
	if client.inParty {
		fmt.Println("You are already in a party!")
		return
	}

	partyID := GenerateRandomString(partyStringLength)
	party := NewParty(partyID)
	party.addPartyPlayer(client)
	client.party = party
	client.inParty = true
	m.parties[partyID] = party

	fmt.Println("Here is an update of all the parties: ")
	for id, party := range m.parties {
		fmt.Printf("Party ID: %s, Number of Players: %d\n", id, len(party.players))
	}

	payload := NewPartyCreatedPayload(partyID)
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		fmt.Println("Error marshaling payload:", err)
		return
	}

	responseEvent := &Event{
		Type:    EventPartyCreated,
		Payload: payloadBytes,
	}

	client.egress <- responseEvent
}

// Join party event handler
func JoinParty(event Event, m *Manager, c *Client) error {
	var payload JoinPartyPayload
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return err
	}

	m.joinParty(c, payload.PartyID)
	return nil
}

// Adds client to the given party, if possible
func (m *Manager) joinParty(c *Client, partyID string) {
	m.Lock()
	defer m.Unlock()

	// Client already in party
	if c.inParty {
		fmt.Println("You are already in a party!")
		return
	}

	if party, exists := m.parties[partyID]; exists && party != nil {
		if party.partySize < maxPartySize {
			party.addPartyPlayer(c)
			c.party = party
			party.initializeGame() // start the game once theres two players in a party
		} else {
			// Party is full
			fmt.Println("Party is full!")
			return
		}
	} else {
		// Party does not exist
		fmt.Println("Party does not exist!")
		return
	}

	fmt.Println("Here is an update of all the parties: ")
	for id, party := range m.parties {
		fmt.Printf("Party ID: %s, Number of Players: %d\n", id, len(party.players))
	}

}

// Player moved event handler
func PlayerMoved(event Event, m *Manager, c *Client) error {
	var payload PlayerMovedPayload
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return err
	}

	m.playerMoved(c, payload)
	return nil
}

// Updates client positions AND clients' current gun
func (m *Manager) playerMoved(client *Client, payload PlayerMovedPayload) {
	client.inputNumber = payload.InputNumber
	client.velocityX = 0

	for _, key := range payload.PressedKeys {
		if key == "ArrowLeft" {
			client.lastXMovement = key
			client.velocityX = -client.speedX * payload.TimeSinceLastEvent
			client.direction = -1
		} else if key == "ArrowRight" {
			client.lastXMovement = key
			client.velocityX = client.speedX * payload.TimeSinceLastEvent
			client.direction = 1
		} else if key == "ArrowUp" && client.isGrounded {
			client.isGrounded = false
			client.velocityY = client.jumpPower * payload.TimeSinceLastEvent
		} else if key == "r" {
			client.switchGun() // TODO: Take this out of this function
		} else if key == "b" {
			client.buildingMode = !client.buildingMode
		} else if key == "c" {
			client.placeBuild = !client.placeBuild
		}
	}
}

// Bullet fired event handler
func BulletFired(event Event, m *Manager, c *Client) error {
	var payload BulletFiredPayload
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return err
	}

	m.bulletFired(c, payload)
	return nil
}

// Fires a bullet
func (m *Manager) bulletFired(client *Client, payload BulletFiredPayload) {
	client.party.fireBullet(payload.PlayerId, payload.TimeSinceLastEvent)
}

// Gun rotated event handler
func GunRotated(event Event, m *Manager, c *Client) error {
	var payload GunRotationPayload
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return err
	}

	m.gunRotated(c, payload)
	return nil
}

// Rotates the clients gun up or down
func (m *Manager) gunRotated(client *Client, payload GunRotationPayload) {
	if payload.KeyPressed == "w" && client.gunRotation > minGunAngle {
		client.updateGunRotation(-client.guns[client.curGunIdx].rotationAmount)
	} else if payload.KeyPressed == "s" && client.gunRotation < maxGunAngle {
		client.updateGunRotation(client.guns[client.curGunIdx].rotationAmount)
	}
}

// Block placed event handler
func BlockPlaced(event Event, m *Manager, c *Client) error {
	var payload BlockPlacedPayload
	if err := json.Unmarshal(event.Payload, &payload); err != nil {
		return err
	}

	m.blockPlaced(c, payload)

	return nil
}

// Places block if it is valid to place
func (m *Manager) blockPlaced(client *Client, payload BlockPlacedPayload) {
	client.party.placeBlock(payload.PlayerId, payload.Block)
}

// Connects a client
func (m *Manager) serveWS(w http.ResponseWriter, r *http.Request) {
	// Upgrade http request
	conn, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	// Create New Client
	client := NewClient(conn, m)
	m.addClient(client)

	// Start goroutines for read and write processes
	go client.readMessages()
	go client.writeMessages()
}

// Add clients to our clientlist
func (m *Manager) addClient(client *Client) {
	// Lock to avoid concurrent hash collisions
	m.Lock()
	defer m.Unlock()

	m.clients[client] = true
}

// Remove client from clientlist
func (m *Manager) removeClient(client *Client) {
	// Lock to avoid concurrent hash collisions
	m.Lock()
	defer m.Unlock()

	if _, ok := m.clients[client]; ok {
		client.connection.Close()
		delete(m.clients, client)
	}
}
