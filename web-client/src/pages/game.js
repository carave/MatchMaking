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
            case "match_found":
                console.log("Match found:", message);
                playerColor = (message.player === player) ? "red" : "yellow";
                opponentColor = (message.player === player) ? "yellow" : "red";
                currentPlayer = message.currentPlayer;
                isMyTurn = currentPlayer === player;
                turn = message.turn;
                updateTurnInfo();
                createBoard();
                break;
            case "move":
                console.log("Move received:", message);
                if (message.player !== player) {
                    handleMove(message.column, opponentColor);
                }
                currentPlayer = message.currentPlayer;
                isMyTurn = currentPlayer === player;
                turn = message.turn;
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
        const move = game.makeMove(col, 1);

        if (move) {
            const { row } = move;
            const cellToPlace = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            console.log(`Placing ${player} piece at row ${row}, col ${col}`);
            cellToPlace.dataset.value = "1";
            cellToPlace.classList.add(playerColor);

            socket.send(JSON.stringify({
                type: "move",
                column: col,
                player: player,
                turn: turn + 1,
                currentPlayer: opponent
            }));

            if (game.checkWinner(1)) {
                messageDiv.textContent = "You win!";
                showEndGamePopup("You win!");
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

    function handleMove(col, color) {
        const move = game.makeMove(col, 1);
        if (move) {
            const { row } = move;
            const cellToPlace = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            console.log(`Placing piece at row ${row}, col ${col}`);
            cellToPlace.dataset.value = "1";
            cellToPlace.classList.add(color);
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
        if (row !== -1) {
            this.board[row][col] = player;
            return { row, col };
        }
        return null;
    }

    getLowestEmptyRow(col) {
        for (let row = this.board.length - 1; row >= 0; row--) {
            if (this.board[row][col] === 0) {
                return row;
            }
        }
        return -1;
    }

    checkWinner(player) {
        // Check rows
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col <= 7 - 4; col++) {
                if (
                    this.board[row][col] === player &&
                    this.board[row][col + 1] === player &&
                    this.board[row][col + 2] === player &&
                    this.board[row][col + 3] === player
                ) {
                    return true;
                }
            }
        }

        // Check columns
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= 6 - 4; row++) {
                if (
                    this.board[row][col] === player &&
                    this.board[row + 1][col] === player &&
                    this.board[row + 2][col] === player &&
                    this.board[row + 3][col] === player
                ) {
                    return true;
                }
            }
        }

        // Check diagonals (left to right)
        for (let row = 0; row <= 6 - 4; row++) {
            for (let col = 0; col <= 7 - 4; col++) {
                if (
                    this.board[row][col] === player &&
                    this.board[row + 1][col + 1] === player &&
                    this.board[row + 2][col + 2] === player &&
                    this.board[row + 3][col + 3] === player
                ) {
                    return true;
                }
            }
        }

        // Check diagonals (right to left)
        for (let row = 0; row <= 6 - 4; row++) {
            for (let col = 3; col < 7; col++) {
                if (
                    this.board[row][col] === player &&
                    this.board[row + 1][col - 1] === player &&
                    this.board[row + 2][col - 2] === player &&
                    this.board[row + 3][col - 3] === player
                ) {
                    return true;
                }
            }
        }

        return false;
    }
}
