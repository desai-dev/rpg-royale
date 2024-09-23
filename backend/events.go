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
	EventPlayerMoved = "PLAYER_MOVED"

	// Events that come from client side
	EventCreateParty = "CREATE_PARTY"
	EventJoinParty   = "JOIN_PARTY"

	// Events that come from server side
	EventPartyCreated = "PARTY_CREATED"
	EventGameStart    = "GAME_START"
)

// ************* PAYLOADS FOR RECIEVING/SENDING DATA FROM/TO CLIENT ************* //
type PlayerMovedPayload struct {
	PlayerId int     `json:"playerId"`
	NewX     float64 `json:"x"`
	NewY     float64 `json:"y"`
}

// ************* PAYLOADS FOR RECIEVING DATA FROM CLIENT ************* //

// Payload structure for JOIN_PARTY event
type JoinPartyPayload struct {
	PartyID string `json:"partyID"`
}

// ************* PAYLOADS FOR SENDING DATA TO CLIENT ************* //

// Payload structure for player data
type PlayerData struct {
	Position Position `json:"position"`
	PlayerId int      `json:"playerId"`
}

// Function to create PlayerData type
func NewPlayerData(x float64, y float64, id int) PlayerData {
	return PlayerData{
		Position: Position{x, y},
		PlayerId: id,
	}
}

// Payload structure for GAME_START event
type GameStartPayload struct {
	PartyID     string       `json:"partyID"`
	PlayersData []PlayerData `json:"players"`
	CurPlayerId int          `json:"id"`
}

// Function to create GameStartPayload type
func NewGameStartPayload() GameStartPayload {
	return GameStartPayload{
		PartyID:     "",
		PlayersData: []PlayerData{},
		CurPlayerId: 0,
	}
}

// Payload structure for PARTY_CREATED event
type PartyCreatedPayload struct {
	PartyID string `json:"partyID"`
}

func NewPartyCreatedPayload(partyId string) PartyCreatedPayload {
	return PartyCreatedPayload{
		PartyID: partyId,
	}
}
