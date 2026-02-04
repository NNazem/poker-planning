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
	
	// Determine static files directory
	staticDir := os.Getenv("STATIC_DIR")
	if staticDir == "" {
		// Default: check for ./static (Docker) or ../frontend/dist (dev)
		if _, err := os.Stat("./static"); err == nil {
			staticDir = "./static"
		} else {
			staticDir = "../frontend/dist"
		}
	}
	
	// Serve static files (frontend)
	fs := http.FileServer(http.Dir(staticDir))
	http.Handle("/", fs)
	
	// Get port from environment or default to 3000
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	
	log.Printf("🚀 Planning Poker server running on port %s", port)
	log.Printf("📂 Serving static files from: %s", staticDir)
	log.Printf("📡 WebSocket endpoint: ws://localhost:%s/ws", port)
	
	if err := http.ListenAndServe("0.0.0.0:"+port, nil); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
