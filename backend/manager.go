package main

import (
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

	// We need this to lock the state of the manager before adding clients to avoid
	// hash collisions during concurrent connections
	sync.RWMutex

	handlers map[string]EventHandler
}

// Initializes a manager
func NewManager() *Manager {
	m := &Manager{
		clients:  make(ClientList),
		handlers: make(map[string]EventHandler),
	}

	m.setupEventHandlers()
	return m
}

func (m *Manager) setupEventHandlers() {
	m.handlers[EventCreateParty] = CreateParty
}

func CreateParty(event Event, c *Client) error {
	fmt.Println(event.Type)
	return nil
}

func (m *Manager) routeEvent(event Event, c *Client) error {
	if handler, ok := m.handlers[event.Type]; ok {
		if err := handler(event, c); err != nil {
			return err
		}
		return nil
	} else {
		return errors.New("there is no such event")
	}
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
