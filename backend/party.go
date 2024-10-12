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
	id              string
	players         []*Client
	collisionBlocks []*CollisionBlock
	partySize       int
	gravity         float64
	maxFallSpeed    float64
	updateMs        int
	stop            chan bool // Channel to stop the ticker
}

// Initializes a new Party
func NewParty(partyID string) *Party {
	return &Party{
		id:              partyID,
		players:         make([]*Client, 0),
		collisionBlocks: make([]*CollisionBlock, 0),
		partySize:       0,
		gravity:         0.5,
		maxFallSpeed:    30,
		updateMs:        15,
		stop:            make(chan bool),
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
	initializeDefaultMap()
	blockWidth := 30
	blockHeight := 30
	for _, collisionBlockCoords := range defaultMap {
		p.collisionBlocks = append(p.collisionBlocks, NewCollisionBlock(float64(blockWidth), float64(blockHeight), float64(collisionBlockCoords[0]*blockWidth), float64(collisionBlockCoords[1]*blockHeight)))
	}
	payload := NewGameStartPayload(defaultMap)
	payload.PartyID = p.id

	for i := 0; i < len(p.players); i++ {
		// Set player's id for the current party
		p.players[i].playerId = i

		// Set player position
		p.players[i].updatePosition(rand.Float64()*1000, 0)

		playerData := NewPlayerData(p.players[i].position.X, p.players[i].position.Y, i, -1)
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
	// Update client positions
	p.updateClientPositions()

	// Check horizontal collisions
	p.checkHorizontalCollisions()

	// Apply gravity
	p.applyGravity()

	// Check vertical collisions
	p.checkVerticalCollisions()

	// Send player positions to client
	payload := NewPlayersUpdatePayload(p.players)
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		fmt.Println("Error marshaling payload:", err)
		return
	}

	updatePosition := &Event{
		Type:    EventUpdatePlayers,
		Payload: payloadBytes,
	}

	for _, player := range p.players {
		player.egress <- updatePosition
	}
}

// Updates clients positions based on velocity
func (p *Party) updateClientPositions() {
	for _, player := range p.players {
		player.updatePosition(player.position.X+player.velocityX, player.position.Y)
	}
}

// Applies gravity to players
func (p *Party) applyGravity() {
	for _, player := range p.players {
		player.velocityY += p.gravity
		if player.velocityY > p.maxFallSpeed {
			player.velocityY = p.maxFallSpeed
		}
		player.position.Y += player.velocityY
	}
}

// Checks for vertical collisions
func (p *Party) checkVerticalCollisions() {
	for _, player := range p.players {
		for _, block := range p.collisionBlocks {
			if CheckCollision(player, block) {
				if player.velocityY > 0 {
					player.velocityY = 0
					player.updatePosition(player.position.X, block.position.Y-player.height-0.01)
				}
				if player.velocityY < 0 {
					player.velocityY = 0
					player.updatePosition(player.position.X, block.position.Y+player.height+0.01)
				}
			}
		}
	}
}

// Checks for horizontal collisions
func (p *Party) checkHorizontalCollisions() {
	for _, player := range p.players {
		for _, block := range p.collisionBlocks {
			if CheckCollision(player, block) {
				if player.velocityX > 0 {
					player.velocityX = 0
					player.updatePosition(block.position.X-player.width-0.01, player.position.Y)
				}
				if player.velocityX < 0 {
					player.velocityX = 0
					player.updatePosition(block.position.X+block.width+0.01, player.position.Y)
				}
			}
		}
	}
}

// Function to stop the ticker when the game is over
func (p *Party) stopGameTicker() {
	p.stop <- true
}
