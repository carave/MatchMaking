package main

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan Message)
var queue = struct {
	sync.Mutex
	players []Player
}{players: []Player{}}

type Message struct {
	Type          string  `json:"type"`
	Username      string  `json:"username,omitempty"`
	Column        int     `json:"column,omitempty"`
	Row           int     `json:"row,omitempty"`
	Player        string  `json:"player,omitempty"`
	Opponent      string  `json:"opponent,omitempty"`
	Turn          int     `json:"turn,omitempty"`
	CurrentPlayer string  `json:"currentPlayer,omitempty"`
	Count         int     `json:"count,omitempty"`
	Board         [][]int `json:"board,omitempty"`
}

type Player struct {
	Conn     *websocket.Conn
	Username string
}

func main() {
	http.HandleFunc("/ws", handleConnections)
	go handleMessages()

	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	log.Printf("New client connected: %s", ws.RemoteAddr().String())
	clients[ws] = true

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			delete(clients, ws)
			break
		}
		log.Printf("Received message: %+v", msg)
		handleClientMessage(ws, msg)
	}
}

func handleClientMessage(ws *websocket.Conn, msg Message) {
	switch msg.Type {
	case "join_queue":
		log.Printf("Player %s joining queue", msg.Username)
		queue.Lock()
		queue.players = append(queue.players, Player{Conn: ws, Username: msg.Username})
		queue.Unlock()
		notifyQueueSize()

		if len(queue.players) >= 2 {
			log.Println("Two players in queue, starting match")
			queue.Lock()
			player1 := queue.players[0]
			player2 := queue.players[1]
			queue.players = queue.players[2:]
			queue.Unlock()

			initialBoard := createEmptyBoard()

			player1.Conn.WriteJSON(Message{Type: "match_found", Opponent: player2.Username, Player: player1.Username, Turn: 1, CurrentPlayer: player1.Username, Board: initialBoard})
			player2.Conn.WriteJSON(Message{Type: "match_found", Opponent: player1.Username, Player: player2.Username, Turn: 1, CurrentPlayer: player1.Username, Board: initialBoard})
		}
	case "leave_queue":
		log.Printf("Player %s leaving queue", msg.Username)
		queue.Lock()
		for i, player := range queue.players {
			if player.Conn == ws {
				queue.players = append(queue.players[:i], queue.players[i+1:]...)
				break
			}
		}
		queue.Unlock()
		notifyQueueSize()
	case "move":
		log.Printf("Player %s made a move in column %d on row %d", msg.Player, msg.Column, msg.Row)
		broadcast <- msg
	default:
		log.Printf("Unhandled message type: %s", msg.Type)
	}
}

func notifyQueueSize() {
	queue.Lock()
	queueSizeMessage := Message{Type: "queue_size", Count: len(queue.players)}
	queue.Unlock()
	for _, player := range queue.players {
		player.Conn.WriteJSON(queueSizeMessage)
	}
}

func handleMessages() {
	for {
		msg := <-broadcast
		log.Printf("Broadcasting message: %+v", msg)
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

func createEmptyBoard() [][]int {
	rows := 6
	cols := 7
	board := make([][]int, rows)
	for i := range board {
		board[i] = make([]int, cols)
	}
	return board
}
