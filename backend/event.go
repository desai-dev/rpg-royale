package main

import "encoding/json"

type Event struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

// EventHandler function signature
type EventHandler func(event Event, m *Manager, c *Client) error

const (
	// Event name for creating a party
	EventCreateParty = "CREATE_PARTY"
	EventJoinParty   = "JOIN_PARTY"
)

// Payload structure for JOIN_PARTY event
type JoinPartyPayload struct {
	PartyID string `json:"partyID"`
}
