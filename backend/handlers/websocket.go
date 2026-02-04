package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/NNazem/poker-planning/backend/models"
	"github.com/NNazem/poker-planning/backend/services"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

// WebSocketHandler handles WebSocket connections
type WebSocketHandler struct {
	roomService *services.RoomService
}

// NewWebSocketHandler creates a new WebSocket handler
func NewWebSocketHandler(rs *services.RoomService) *WebSocketHandler {
	return &WebSocketHandler{roomService: rs}
}

// Message types
type Message struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

type JoinRoomData struct {
	RoomID     string `json:"roomId"`
	PlayerName string `json:"playerName"`
}

type VoteData struct {
	RoomID string `json:"roomId"`
	Vote   string `json:"vote"`
}

type RoomIDData struct {
	RoomID string `json:"roomId"`
}

// HandleConnection handles a new WebSocket connection
func (h *WebSocketHandler) HandleConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	
	playerID := uuid.New().String()
	var currentRoom *models.Room
	var currentPlayer *models.Player
	
	log.Printf("User connected: %s", playerID)
	
	defer func() {
		if currentRoom != nil && currentPlayer != nil {
			currentRoom.RemovePlayer(playerID)
			log.Printf("%s left room %s", currentPlayer.Name, currentRoom.ID)
			h.broadcastRoomUpdate(currentRoom)
			
			if currentRoom.IsEmpty() {
				h.roomService.RemoveRoom(currentRoom.ID)
			}
		}
		conn.Close()
	}()
	
	for {
		_, rawMessage, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}
		
		var msg Message
		if err := json.Unmarshal(rawMessage, &msg); err != nil {
			log.Printf("JSON parse error: %v", err)
			continue
		}
		
		switch msg.Type {
		case "join-room":
			var data JoinRoomData
			if err := json.Unmarshal(msg.Data, &data); err != nil {
				continue
			}
			
			currentRoom = h.roomService.GetOrCreateRoom(data.RoomID)
			currentPlayer = &models.Player{
				ID:   playerID,
				Name: data.PlayerName,
				Conn: conn,
			}
			currentRoom.AddPlayer(currentPlayer)
			
			log.Printf("%s joined room %s", data.PlayerName, data.RoomID)
			h.broadcastRoomUpdate(currentRoom)
			
		case "vote":
			var data VoteData
			if err := json.Unmarshal(msg.Data, &data); err != nil {
				continue
			}
			
			if room, exists := h.roomService.GetRoom(data.RoomID); exists {
				room.SetVote(playerID, data.Vote)
				h.broadcastRoomUpdate(room)
			}
			
		case "new-round":
			var data RoomIDData
			if err := json.Unmarshal(msg.Data, &data); err != nil {
				continue
			}
			
			if room, exists := h.roomService.GetRoom(data.RoomID); exists {
				room.ResetVotes()
				h.broadcastRoomUpdate(room)
			}
			
		case "get-room-state":
			var data RoomIDData
			if err := json.Unmarshal(msg.Data, &data); err != nil {
				continue
			}
			
			if room, exists := h.roomService.GetRoom(data.RoomID); exists {
				h.sendRoomUpdate(conn, room)
			}
		}
	}
}

// broadcastRoomUpdate sends room state to all players in the room
func (h *WebSocketHandler) broadcastRoomUpdate(room *models.Room) {
	state := room.GetState()
	msg := map[string]interface{}{
		"type": "room-update",
		"data": state,
	}
	
	jsonMsg, err := json.Marshal(msg)
	if err != nil {
		log.Printf("JSON marshal error: %v", err)
		return
	}
	
	// Get thread-safe copy of players
	players := room.GetPlayers()
	
	for _, player := range players {
		if player.Conn != nil {
			// Ignore write errors - player will be cleaned up on disconnect
			player.Conn.WriteMessage(websocket.TextMessage, jsonMsg)
		}
	}
}

// sendRoomUpdate sends room state to a single connection
func (h *WebSocketHandler) sendRoomUpdate(conn *websocket.Conn, room *models.Room) {
	state := room.GetState()
	msg := map[string]interface{}{
		"type": "room-update",
		"data": state,
	}
	
	jsonMsg, err := json.Marshal(msg)
	if err != nil {
		return
	}
	
	conn.WriteMessage(websocket.TextMessage, jsonMsg)
}
