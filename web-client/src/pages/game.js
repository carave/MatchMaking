document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const player = urlParams.get('player');
    const opponent = urlParams.get('opponent');

    const board = document.getElementById("board");
    const messageDiv = document.getElementById("message");
    const turnDiv = document.getElementById("turn");
    const resetButton = document.getElementById("reset-button");
    const leaveButton = document.getElementById("leave-button");

    let currentPlayer;
    let playerColor;
    let opponentColor;
    let turn = 1;
    let isMyTurn = false;
    const myPlayerId = player === 'a' ? 1 : 2;

    const game = new ConnectFour();
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = function(event) {
        console.log("WebSocket is open now.");
        socket.send(JSON.stringify({ type: "join_queue", username: player }));
    };

    socket.onclose = function(event) {
        console.log("WebSocket is closed now.");
        if (currentPlayer === player) {
            alert("Your opponent has left the game. You win!");
            showEndGamePopup("You win!");
        }
    };

    socket.onerror = function(event) {
        console.error("WebSocket error observed:", event);
    };

    socket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        console.log("Message from server:", message);

        switch (message.type) {
            case "queue_size":
                console.log("Queue size:", message.count);
                break;
            case "match_found":
                console.log("Match found:", message);
                playerColor = (message.player === player) ? "red" : "yellow";
                opponentColor = (message.player === player) ? "yellow" : "red";
                currentPlayer = message.currentPlayer;
                isMyTurn = currentPlayer === player;
                turn = message.turn;
                game.board = message.board || game.createBoard();  // Initialize the board with the server's board or create a new one
                updateTurnInfo();
                createBoard();
                break;
            case "move":
                console.log("Move received:", message);
                if (message.player !== player) {
                    handleMove(message.column, opponentColor, message.row);
                }
                currentPlayer = message.currentPlayer;
                isMyTurn = currentPlayer === player;
                turn = message.turn;
                game.board = message.board || game.createBoard();  // Update the board with the server's board or create a new one
                updateTurnInfo();
                break;
            default:
                console.log("Unhandled message type:", message.type);
        }
    };

    board.addEventListener("click", function(event) {
        if (!isMyTurn) return;

        const cell = event.target;
        const col = parseInt(cell.dataset.col);
        const move = game.makeMove(col, myPlayerId);

        if (move) {
            const { row } = move;
            const cellToPlace = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            console.log(`Placing ${player} piece at row ${row}, col ${col}`);
            cellToPlace.dataset.value = myPlayerId.toString();
            cellToPlace.classList.add(playerColor);

            const moveToSend = JSON.stringify({
                type: "move",
                column: col,
                row: row,
                player: player,
                turn: turn + 1,
                currentPlayer: opponent,
                board: game.board  // Send the current state of the board
            });

            socket.send(moveToSend);

            if (game.checkWinner(myPlayerId)) {
                messageDiv.textContent = "You win!";
                showEndGamePopup("You win!");
            } else if (turn === 42) {
                messageDiv.textContent = "It's a tie!";
                showEndGamePopup("It's a tie!");
            }

            currentPlayer = opponent;
            isMyTurn = false;
            turn++;
            updateTurnInfo();
        } else {
            alert("Column is full!");
        }
    });

    resetButton.addEventListener("click", function() {
        window.location.href = "index.html";
    });

    leaveButton.addEventListener("click", function() {
        socket.close();
        window.location.href = "index.html";
    });

    function updateTurnInfo() {
        turnDiv.textContent = `Turn ${turn}: ${currentPlayer}'s turn`;
    }

    function showEndGamePopup(message) {
        const popup = document.createElement("div");
        popup.classList.add("popup");
        const popupMessage = document.createElement("p");
        popupMessage.textContent = message;
        const requeueButton = document.createElement("button");
        requeueButton.textContent = "Requeue";
        requeueButton.addEventListener("click", function() {
            socket.send(JSON.stringify({ type: "requeue", username: player }));
            window.location.href = "index.html";
        });
        const leaveButton = document.createElement("button");
        leaveButton.textContent = "Leave Game";
        leaveButton.addEventListener("click", function() {
            socket.send(JSON.stringify({ type: "leave_queue", username: player }));
            window.location.href = "index.html";
        });
        popup.appendChild(popupMessage);
        popup.appendChild(requeueButton);
        popup.appendChild(leaveButton);
        document.body.appendChild(popup);
    }

    function createBoard() {
        board.innerHTML = '';
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col <= 6; col++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.value = "0";
                board.appendChild(cell);
            }
        }
    }

    function handleMove(col, color, row) {
        if (col === undefined){
            col = 0
        }
        if (row === undefined) {
            const move = game.makeMove(col, myPlayerId === 1 ? 2 : 1);
            row = move ? move.row : undefined;
        }
        if (row !== undefined) {
            const cellToPlace = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (!cellToPlace) {
                console.error(`Cannot find cell at row ${row}, col ${col}`);
                return;
            }
            console.log(`Placing piece at row ${row}, col ${col}`);
            cellToPlace.dataset.value = myPlayerId === 1 ? "2" : "1";
            cellToPlace.classList.add(color);
        }
        else{
            console.log("row undefined", row);
        }
    }

    createBoard();
});

class ConnectFour {
    constructor() {
        this.board = this.createBoard();
    }

    createBoard() {
        const rows = 6;
        const cols = 7;
        const board = [];
        for (let row = 0; row < rows; row++) {
            const rowArr = [];
            for (let col = 0; col < cols; col++) {
                rowArr.push(0);
            }
            board.push(rowArr);
        }
        return board;
    }

    makeMove(col, player) {
        const row = this.getLowestEmptyRow(col);
        console.log(`Lowest empty row for col ${col} is ${row}`);
        if (row !== -1) {
            this.board[row][col] = player;
            console.log(`Move made: player ${player} at row ${row}, col ${col}`);
            return { row, col };
        }
        return null;
    }

    getLowestEmptyRow(col) {
        for (let row = this.board.length - 1; row >= 0; row--) {
            if (this.board[row][col] === 0) {
                console.log("Found Lowest empty row : ", row)
                return row;
            }
        }
        return -1;
    }

    checkWinner(player) {
        // Check horizontal win
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col <= 7 - 4; col++) {
                if (this.board[row][col] === player &&
                    this.board[row][col + 1] === player &&
                    this.board[row][col + 2] === player &&
                    this.board[row][col + 3] === player) {
                    return true;
                }
            }
        }

        // Check vertical win
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= 6 - 4; row++) {
                if (this.board[row][col] === player &&
                    this.board[row + 1][col] === player &&
                    this.board[row + 2][col] === player &&
                    this.board[row + 3][col] === player) {
                    return true;
                }
            }
        }

        // Check diagonal (left to right) win
        for (let row = 0; row <= 6 - 4; row++) {
            for (let col = 0; col <= 7 - 4; col++) {
                if (this.board[row][col] === player &&
                    this.board[row + 1][col + 1] === player &&
                    this.board[row + 2][col + 2] === player &&
                    this.board[row + 3][col + 3] === player) {
                    return true;
                }
            }
        }

        // Check diagonal (right to left) win
        for (let row = 0; row <= 6 - 4; row++) {
            for (let col = 3; col < 7; col++) {
                if (this.board[row][col] === player &&
                    this.board[row + 1][col - 1] === player &&
                    this.board[row + 2][col - 2] === player &&
                    this.board[row + 3][col - 3] === player) {
                    return true;
                }
            }
        }

        return false;
    }
}