package main

import (
	"log"
	"net/http"
	"os"

	"github.com/NNazem/poker-planning/backend/handlers"
	"github.com/NNazem/poker-planning/backend/services"
)

func main() {
	// Initialize services
	roomService := services.NewRoomService()
	
	// Initialize handlers
	wsHandler := handlers.NewWebSocketHandler(roomService)
	
	// Routes
	http.HandleFunc("/ws", wsHandler.HandleConnection)
	
	// Serve static files (frontend)
	fs := http.FileServer(http.Dir("../frontend/dist"))
	http.Handle("/", fs)
	
	// Get port from environment or default to 3000
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	
	log.Printf("🚀 Planning Poker server running on port %s", port)
	log.Printf("📡 WebSocket endpoint: ws://localhost:%s/ws", port)
	
	if err := http.ListenAndServe("0.0.0.0:"+port, nil); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
