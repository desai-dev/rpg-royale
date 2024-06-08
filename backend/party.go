package main

import (
	"encoding/json"
	"fmt"
	"log"
)

type PartyList map[string]*Party

// A 'Party' is a game party with two players at max
type Party struct {
	id              string
	players         []*Client
	playerPositions map[*Client]Position
	partySize       int
}

// A position is an (x, y) coordinate
type Position struct {
	X int
	Y int
}

// Add a player to the party
func (p *Party) addPartyPlayer(client *Client) {
	p.players = append(p.players, client)
	p.partySize++
}

// Initialize the game
func (p *Party) initializeGame() {
	for _, player := range p.players {
		// Set player postion
		p.playerPositions[player] = Position{X: 100, Y: 100}

		// JSONify position data
		positionData, err := json.Marshal(p.playerPositions[player])
		if err != nil {
			log.Fatalf("error marshalling position data: %v", err)
		}

		// Send initialstate back to client
		initialState := Event{
			Type:    "GAME_START",
			Payload: json.RawMessage(fmt.Sprintf(`{"partyID":"%s","position":%s}`, p.id, positionData)),
		}

		player.egress <- initialState
	}
}
