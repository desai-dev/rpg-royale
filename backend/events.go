package main

import "encoding/json"

type Event struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

// EventHandler function signature
type EventHandler func(event Event, m *Manager, c *Client) error

// Event names
const (
	// Events that are the same for both the server and client
	EventBulletFired = "BULLET_FIRED"

	// Events that come from client side
	EventCreateParty = "CREATE_PARTY"
	EventJoinParty   = "JOIN_PARTY"
	EventPlayerMoved = "PLAYER_MOVED"
	EventGunRotation = "GUN_ROTATION"

	// Events that come from server side
	EventPartyCreated  = "PARTY_CREATED"
	EventGameStart     = "GAME_START"
	EventUpdatePlayers = "PLAYERS_UPDATE"
)

// ************* PAYLOADS FOR RECIEVING/SENDING DATA FROM/TO CLIENT ************* //

// Payload structure for BULLET_FIRED event
type BulletFiredPayload struct {
	PlayerId           int      `json:"playerId"` // When recieving this event from the client,
	Position           Position `json:"position"` // only the PlayerId and TimeSinceLastEvent are used
	VelocityX          float64  `json:"velocityX"`
	VelocityY          float64  `json:"velocityY"`
	Width              float64  `json:"width"`
	Height             float64  `json:"height"`
	Damage             float64  `json:"damage"`
	TimeSinceLastEvent float64  `json:"timeSinceLastEvent"`
}

// ************* PAYLOADS FOR RECIEVING DATA FROM CLIENT ************* //

// Payload structure for JOIN_PARTY event
type JoinPartyPayload struct {
	PartyID string `json:"partyID"`
}

// Payload structure for PLAYER_MOVED event
type PlayerMovedPayload struct {
	PlayerId           int      `json:"playerId"`
	PressedKeys        []string `json:"pressedKeys"`
	TimeSinceLastEvent float64  `json:"timeSinceLastEvent"`
	InputNumber        int      `json:"inputNumber"`
}

// Payload structure for GUN_ROTATION event
type GunRotationPayload struct {
	PlayerId   int    `json:"playerId"`
	KeyPressed string `json:"keyPressed"`
}

// ************* PAYLOADS FOR SENDING DATA TO CLIENT ************* //

// Payload structure for player data
type PlayerData struct {
	Position        Position `json:"position"`
	PlayerId        int      `json:"playerId"`
	Health          float64  `json:"health"`
	GunRotation     float64  `json:"gunRotation"`
	GunDirection    int      `json:"gunDirection"`
	CurrentGunindex int      `json:"curGunIdx"`
	InputNumber     int      `json:"inputNumber"`
}

// Function to create PlayerData type
func NewPlayerData(x float64, y float64, health float64, gunRotation float64, gunDirection int, curGunIdx int, id int, inputNumber int) PlayerData {
	return PlayerData{
		Position:        Position{x, y},
		Health:          health,
		GunRotation:     gunRotation,
		GunDirection:    gunDirection,
		CurrentGunindex: curGunIdx,
		PlayerId:        id,
		InputNumber:     inputNumber,
	}
}

// Payload structure for GAME_START event
type GameStartPayload struct {
	PartyID        string       `json:"partyID"`
	PlayersData    []PlayerData `json:"players"`
	CurPlayerId    int          `json:"id"`
	MapCoordinates [][2]int     `json:"map"`
}

// Function to create GameStartPayload type
func NewGameStartPayload(gameMap [][2]int) GameStartPayload {
	return GameStartPayload{
		PartyID:        "",
		PlayersData:    []PlayerData{},
		CurPlayerId:    0,
		MapCoordinates: gameMap,
	}
}

// Payload structure for PLAYERS_UPDATE event
type PlayersUpdatePayload struct {
	PlayersData []PlayerData `json:"players"`
}

// Function to create PlayersUpdatePayload type
func NewPlayersUpdatePayload(players []*Client) PlayersUpdatePayload {
	data := []PlayerData{}

	for _, player := range players {
		playerData := NewPlayerData(player.position.X, player.position.Y, player.health, player.gunRotation, player.direction, player.curGunIdx, player.playerId, player.inputNumber)
		data = append(data, playerData)
	}
	return PlayersUpdatePayload{
		PlayersData: data,
	}
}

// Payload structure for PARTY_CREATED event
type PartyCreatedPayload struct {
	PartyID string `json:"partyID"`
}

// Function to create PartyCreatedPayload type
func NewPartyCreatedPayload(partyId string) PartyCreatedPayload {
	return PartyCreatedPayload{
		PartyID: partyId,
	}
}
