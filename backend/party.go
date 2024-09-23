package main

import (
	"encoding/json"
	"fmt"
	"math/rand/v2"
)

type PartyList map[string]*Party

// A 'Party' is a game party with two players at max
type Party struct {
	id              string
	players         []*Client
	playerPositions map[int]Position
	partySize       int
}

// Initializes a new Party
func NewParty(partyID string) *Party {
	return &Party{
		id:              partyID,
		players:         make([]*Client, 0),
		playerPositions: make(map[int]Position),
		partySize:       0,
	}
}

// Add a player to the party
func (p *Party) addPartyPlayer(client *Client) {
	p.players = append(p.players, client)
	p.partySize++
}

// Initialize the game
func (p *Party) initializeGame() {
	payload := NewGameStartPayload()
	payload.PartyID = p.id

	for i := 0; i < len(p.players); i++ {
		// Set player's id for the current party
		p.players[i].playerId = i

		// Set player position
		p.playerPositions[i] = Position{X: rand.Float64() * 100, Y: rand.Float64() * 100}

		playerData := NewPlayerData(p.playerPositions[i].X, p.playerPositions[i].Y, i)
		payload.PlayersData = append(payload.PlayersData, playerData)
	}

	for _, player := range p.players {
		payload.CurPlayerId = player.playerId

		payloadBytes, err := json.Marshal(payload)
		if err != nil {
			fmt.Println("Error marshaling payload:", err)
			return
		}

		initialState := Event{
			Type:    EventGameStart,
			Payload: payloadBytes,
		}

		player.egress <- initialState
	}
}
