package services

import (
	"sync"

	"github.com/NNazem/poker-planning/backend/models"
)

// RoomService manages all poker rooms
type RoomService struct {
	rooms map[string]*models.Room
	mu    sync.RWMutex
}

// NewRoomService creates a new room service
func NewRoomService() *RoomService {
	return &RoomService{
		rooms: make(map[string]*models.Room),
	}
}

// GetOrCreateRoom gets an existing room or creates a new one
func (s *RoomService) GetOrCreateRoom(roomID string) *models.Room {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	if room, exists := s.rooms[roomID]; exists {
		return room
	}
	
	room := models.NewRoom(roomID)
	s.rooms[roomID] = room
	return room
}

// GetRoom gets a room by ID
func (s *RoomService) GetRoom(roomID string) (*models.Room, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	room, exists := s.rooms[roomID]
	return room, exists
}

// RemoveRoom removes a room
func (s *RoomService) RemoveRoom(roomID string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.rooms, roomID)
}

// CleanupEmptyRooms removes all empty rooms
func (s *RoomService) CleanupEmptyRooms() {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	for id, room := range s.rooms {
		if room.IsEmpty() {
			delete(s.rooms, id)
		}
	}
}

// GetRoomCount returns the number of active rooms
func (s *RoomService) GetRoomCount() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.rooms)
}
