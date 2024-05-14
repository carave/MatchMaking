package main

import (
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Permettre les requêtes de toutes les origines
	},
}

var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan Message)
var queue = []Player{}

type Message struct {
	Type     string `json:"type"`
	Username string `json:"username,omitempty"`
	Column   int    `json:"column,omitempty"` // Utilisé pour les messages de jeu
	Count    int    `json:"count,omitempty"`  // Utilisé pour le nombre de joueurs dans la file d'attente
	Player   string `json:"player,omitempty"`
	Opponent string `json:"opponent,omitempty"`
}

type Player struct {
	Conn     *websocket.Conn
	Username string
}

func main() {
	http.HandleFunc("/ws", handleConnections)
	go handleMessages()

	log.Println("Serveur démarré sur :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	clients[ws] = true

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			delete(clients, ws)
			break
		}
		handleClientMessage(ws, msg)
	}
}

func handleClientMessage(ws *websocket.Conn, msg Message) {
	switch msg.Type {
	case "join_queue":
		// Vérifier si le joueur est déjà dans la file d'attente
		for _, player := range queue {
			if player.Conn == ws {
				return
			}
		}
		queue = append(queue, Player{Conn: ws, Username: msg.Username})
		notifyQueueSize()

		if len(queue) >= 2 {
			player1 := queue[0]
			player2 := queue[1]
			queue = queue[2:]

			// Choisir aléatoirement quel joueur commence
			rand.Seed(time.Now().UnixNano())
			startingPlayer := player1.Username
			if rand.Intn(2) == 0 {
				startingPlayer = player2.Username
			}

			player1.Conn.WriteJSON(Message{Type: "match_found", Opponent: player2.Username, Player: startingPlayer})
			player2.Conn.WriteJSON(Message{Type: "match_found", Opponent: player1.Username, Player: startingPlayer})
		}
	case "leave_queue":
		for i, player := range queue {
			if player.Conn == ws {
				queue = append(queue[:i], queue[i+1:]...)
				break
			}
		}
		notifyQueueSize()
	case "move":
		broadcast <- msg
	default:
		log.Printf("Unhandled message type: %s", msg.Type)
	}
}

// Nouvelle fonction pour notifier la taille de la file d'attente
func notifyQueueSize() {
	queueSizeMessage := Message{Type: "queue_size", Count: len(queue)}
	for _, player := range queue {
		player.Conn.WriteJSON(queueSizeMessage)
	}
}

func handleMessages() {
	for {
		msg := <-broadcast
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("error: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}
