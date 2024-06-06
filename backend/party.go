package main

type PartyList map[string]*Party

// A 'Party' is a game party with two clients at max
type Party struct {
	id        string
	clients   []*Client
	partySize int
}

// Add a client to the party
func (p *Party) addPartyClient(client *Client) {
	p.clients = append(p.clients, client)
	p.partySize++
}
