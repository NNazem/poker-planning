package models

import (
	"sync"

	"github.com/gorilla/websocket"
)

// Player represents a connected player
type Player struct {
	ID   string          `json:"id"`
	Name string          `json:"name"`
	Conn *websocket.Conn `json:"-"`
}

// Room represents a planning poker room
type Room struct {
	ID       string            `json:"id"`
	Players  []*Player         `json:"players"`
	Votes    map[string]string `json:"votes"`
	Revealed bool              `json:"revealed"`
	mu       sync.RWMutex
}

// NewRoom creates a new room
func NewRoom(id string) *Room {
	return &Room{
		ID:       id,
		Players:  make([]*Player, 0),
		Votes:    make(map[string]string),
		Revealed: false,
	}
}

// AddPlayer adds a player to the room
func (r *Room) AddPlayer(player *Player) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.Players = append(r.Players, player)
}

// RemovePlayer removes a player from the room
func (r *Room) RemovePlayer(playerID string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	
	for i, p := range r.Players {
		if p.ID == playerID {
			r.Players = append(r.Players[:i], r.Players[i+1:]...)
			delete(r.Votes, playerID)
			break
		}
	}
}

// SetVote sets a player's vote
func (r *Room) SetVote(playerID string, vote string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.Votes[playerID] = vote
	
	// Auto-reveal when all players have voted
	if len(r.Votes) == len(r.Players) {
		r.Revealed = true
	}
}

// ResetVotes clears all votes for a new round
func (r *Room) ResetVotes() {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.Votes = make(map[string]string)
	r.Revealed = false
}

// GetState returns a thread-safe copy of the room state
func (r *Room) GetState() RoomState {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	players := make([]PlayerInfo, len(r.Players))
	for i, p := range r.Players {
		players[i] = PlayerInfo{ID: p.ID, Name: p.Name}
	}
	
	votes := make(map[string]string)
	for k, v := range r.Votes {
		votes[k] = v
	}
	
	return RoomState{
		Players:  players,
		Votes:    votes,
		Revealed: r.Revealed,
	}
}

// PlayerInfo is a JSON-safe player representation
type PlayerInfo struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// RoomState is the serializable room state sent to clients
type RoomState struct {
	Players  []PlayerInfo      `json:"players"`
	Votes    map[string]string `json:"votes"`
	Revealed bool              `json:"revealed"`
}

// IsEmpty returns true if the room has no players
func (r *Room) IsEmpty() bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return len(r.Players) == 0
}
