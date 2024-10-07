package main

import (
	"encoding/json"
	"fmt"
	"math/rand/v2"
	"time"
)

type PartyList map[string]*Party

// A 'Party' is a game party with two players at max
type Party struct {
	id        string
	players   []*Client
	partySize int
	updateMs  int
	stop      chan bool // Channel to stop the ticker
}

// Initializes a new Party
func NewParty(partyID string) *Party {
	return &Party{
		id:        partyID,
		players:   make([]*Client, 0),
		partySize: 0,
		updateMs:  15,
		stop:      make(chan bool),
	}
}

// Add a player to the party
func (p *Party) addPartyPlayer(client *Client) {
	p.players = append(p.players, client)
	p.partySize++
}

// Remove a player from the party
func (p *Party) removePartyPlayer(client *Client) {
	for i, player := range p.players {
		if player == client {
			// Remove the client from the players slice
			p.players = append(p.players[:i], p.players[i+1:]...)
			p.partySize--
			break
		}
	}

}

// Initialize the game
func (p *Party) initializeGame() {
	payload := NewGameStartPayload()
	payload.PartyID = p.id

	for i := 0; i < len(p.players); i++ {
		// Set player's id for the current party
		p.players[i].playerId = i

		// Set player position
		p.players[i].updatePosition(rand.Float64()*100, rand.Float64()*100)

		playerData := NewPlayerData(p.players[i].position.X, p.players[i].position.Y, i)
		payload.PlayersData = append(payload.PlayersData, playerData)
	}

	// Send initial spawnpoints
	for _, player := range p.players {
		payload.CurPlayerId = player.playerId

		payloadBytes, err := json.Marshal(payload)
		if err != nil {
			fmt.Println("Error marshaling payload:", err)
			return
		}

		initialState := &Event{
			Type:    EventGameStart,
			Payload: payloadBytes,
		}

		player.egress <- initialState
	}

	// Start ticker for sending updates to clients
	go p.startGameTicker()
}

// Ticker to send updates to clients every p.updateMs ms
func (p *Party) startGameTicker() {
	ticker := time.NewTicker(time.Duration(p.updateMs) * time.Millisecond) // Sets frame rate of ~66ms
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			p.updatesClients() // Send updates to all clients
		case <-p.stop:
			fmt.Printf("Stopping ticker for party with id: %s", p.id)
			return
		}
	}
}

// Function to send updates to all clients in the party
func (p *Party) updatesClients() {
	payload := NewPlayerPositionsPayload(p.players)
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		fmt.Println("Error marshaling payload:", err)
		return
	}

	updatePosition := &Event{
		Type:    EventUpdatePosition,
		Payload: payloadBytes,
	}

	for _, player := range p.players {
		player.egress <- updatePosition
	}
}

// Function to stop the ticker when the game is over
func (p *Party) stopGameTicker() {
	p.stop <- true
}
