package main

import (
	"encoding/json"
	"fmt"
	"math/rand/v2"
	"sync"
	"time"
)

type PartyList map[string]*Party

// A 'Party' is a game party with two players at max
type Party struct {
	id              string
	players         []*Client
	collisionBlocks []*CollisionBlock
	bullets         []*Bullet
	unsentBullets   []*Bullet // Any array of bullet updates that need to be sent to clients
	partySize       int
	gravity         float64
	maxFallSpeed    float64
	updateMs        int
	stop            chan bool // Channel to stop the ticker
	mutex           sync.Mutex
}

// Initializes a new Party
func NewParty(partyID string) *Party {
	return &Party{
		id:              partyID,
		players:         make([]*Client, 0),
		collisionBlocks: make([]*CollisionBlock, 0),
		bullets:         make([]*Bullet, 0),
		unsentBullets:   make([]*Bullet, 0),
		partySize:       0,
		gravity:         gravityConstant,
		maxFallSpeed:    playerMaxFallSpeed,
		updateMs:        frameRate,
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
	for _, collisionBlockCoords := range defaultMap {
		p.collisionBlocks = append(p.collisionBlocks, NewCollisionBlock(float64(collisionBlockWidth), float64(collisionBlockHeight), float64(collisionBlockCoords[0]*collisionBlockHeight), float64(collisionBlockCoords[1]*collisionBlockHeight)))
	}
	payload := NewGameStartPayload(defaultMap)
	payload.PartyID = p.id

	for i := 0; i < len(p.players); i++ {
		// Set player's id for the current party
		p.players[i].playerId = i

		// Set player position
		p.players[i].updatePosition(rand.Float64()*playerSpawnMaxX, 0)

		playerData := NewPlayerData(p.players[i].position.X, p.players[i].position.Y, playerHealth, 0, 1, 0, i, -1) // Change gun rotation to be a setting
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
			p.updateClients() // Send updates to all clients
		case <-p.stop:
			fmt.Printf("Stopping ticker for party with id: %s", p.id)
			return
		}
	}
}

// Function to send updates to all clients in the party
func (p *Party) updateClients() {
	// Update client positions
	p.updateClientPositions()

	// Update bullet positions
	p.updateBulletPositions()

	// Check horizontal collisions
	p.checkHorizontalCollisions()

	// Apply gravity
	p.applyGravity()

	// Check vertical collisions
	p.checkVerticalCollisions()

	// Send player positions to client
	p.sendPlayerData()

	// Send bullet updates to clients TODO: Make this its own function
	p.sendBulletData()
}

// Updates clients positions based on velocity
func (p *Party) updateClientPositions() {
	for _, player := range p.players {
		player.updatePosition(player.position.X+player.velocityX, player.position.Y)
	}
}

// Updates bullet positions based on velocity
func (p *Party) updateBulletPositions() {
	var remainingBullets []*Bullet

	for _, bullet := range p.bullets {
		if bullet.updatePosition(bullet.position.X+bullet.velocityX, bullet.position.Y+bullet.velocityY) {
			remainingBullets = append(remainingBullets, bullet)
		}
	}

	p.bullets = remainingBullets
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

// Checks for horizontal collisions
func (p *Party) checkHorizontalCollisions() {
	var remainingBullets []*Bullet

	for _, player := range p.players {
		// Collision block collisions with player
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

		// Bullet collisions with player
		for _, bullet := range p.bullets {
			if CheckCollision(player, bullet) {
				player.health -= bullet.damage
				if player.health <= 0 {
					player.respawnPlayer()
				}
			} else {
				remainingBullets = append(remainingBullets, bullet)
			}
		}
		p.bullets = remainingBullets
		remainingBullets = remainingBullets[:0]
	}

	// Bullet collisions with platforms
	for _, bullet := range p.bullets {
		addBullet := true
		for _, block := range p.collisionBlocks {
			if CheckCollision(bullet, block) {
				addBullet = false
				break
			}
		}
		if addBullet {
			remainingBullets = append(remainingBullets, bullet)
		}
	}

	p.bullets = remainingBullets
}

// Checks for vertical collisions
func (p *Party) checkVerticalCollisions() {
	for _, player := range p.players {
		for _, block := range p.collisionBlocks {
			if CheckCollision(player, block) {
				if player.velocityY > 0 {
					player.velocityY = 0
					player.updatePosition(player.position.X, block.position.Y-player.height-0.01)
					player.isGrounded = true
				}
				if player.velocityY < 0 {
					player.velocityY = 0
					player.updatePosition(player.position.X, block.position.Y+block.height+0.01)
				}
			}
		}
	}
}

// Sends updated player data to clients
func (p *Party) sendPlayerData() {
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

// Sends updated bullet data to clients
func (p *Party) sendBulletData() {
	p.mutex.Lock()

	if len(p.unsentBullets) > 0 {
		for _, bullet := range p.unsentBullets {
			bulletUpdate := BulletFiredPayload{
				PlayerId:  bullet.playerId,
				Position:  Position{X: bullet.position.X, Y: bullet.position.Y},
				VelocityX: bullet.velocityX,
				VelocityY: bullet.velocityY,
				Width:     bullet.width,
				Height:    bullet.height,
				Name:      bullet.name,
			}

			payloadBytes, err := json.Marshal(bulletUpdate)
			if err != nil {
				fmt.Println("Error marshaling bullet update:", err)
				return
			}

			bulletFiredEvent := &Event{
				Type:    EventBulletFired,
				Payload: payloadBytes,
			}

			// Send to players who did not fire the bullet
			for _, player := range p.players {
				if player.playerId != bullet.playerId {
					player.egress <- bulletFiredEvent
				}
			}
		}
		p.unsentBullets = []*Bullet{}
	}

	p.mutex.Unlock()
}

// Fires a bullet from the given clients position
func (p *Party) fireBullet(playerId int, deltaTime float64) {
	// Lock mutex because we are modifying p.unsentBullets which might
	// be accessed by another go routine
	p.mutex.Lock()
	defer p.mutex.Unlock()

	playerGun := p.players[playerId].guns[p.players[playerId].curGunIdx]
	bullet := playerGun.shootBullet(p.players[playerId], deltaTime)

	p.bullets = append(p.bullets, bullet)

	p.unsentBullets = append(p.unsentBullets, bullet)
}

// Function to stop the ticker when the game is over
func (p *Party) stopGameTicker() {
	p.stop <- true
}
