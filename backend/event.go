package main

import "encoding/json"

type Event struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

// EventHandler function signature
type EventHandler func(event Event, c *Client) error

const (
	// Event name for creating a party
	EventCreateParty = "CREATE_PARTY"
)
