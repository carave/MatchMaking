document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const player = urlParams.get('player');
    const opponent = urlParams.get('opponent');

    const board = document.getElementById("board");
    const messageDiv = document.getElementById("message");
    const turnDiv = document.createElement("div");
    const resetButton = document.getElementById("reset-button");
    const leaveButton = document.getElementById("leave-button");
    let currentPlayer;
    let turn = 1;

    const playerColor = "red";
    const opponentColor = "yellow";
    let currentColor;

    turnDiv.id = "turn";
    document.body.insertBefore(turnDiv, board);

    const game = new ConnectFour();
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = function(event) {
        console.log("WebSocket is open now.");
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
        if (message.type === "match_found") {
            currentPlayer = message.Player;
            currentColor = (currentPlayer === player) ? playerColor : opponentColor;
            turn = message.Turn;
            updateTurnInfo();
        }
        if (message.type === "move") {
            handleMove(message.column, message.player, message.turn);
        }
    };

    board.addEventListener("click", function(event) {
        if (currentPlayer !== player) return;

        const cell = event.target;
        const col = parseInt(cell.dataset.col);
        if (game.makeMove(col)) {
            const message = {
                type: "move",
                column: col,
                player: player,
                turn: turn
            };
            socket.send(JSON.stringify(message));
            currentPlayer = opponent;
            currentColor = opponentColor;
            turn++;
            updateTurnInfo();
        }
    });

    resetButton.addEventListener("click", function() {
        socket.send(JSON.stringify({ type: "requeue", username: player }));
        window.location.href = "lobby.html";
    });

    leaveButton.addEventListener("click", function() {
        socket.send(JSON.stringify({ type: "leave_queue", username: player }));
        window.location.href = "lobby.html";
    });

    function handleMove(column, movePlayer, moveTurn) {
        const row = getLowestEmptyRow(column);
        if (row !== -1) {
            const cellToPlace = document.querySelector(`[data-row="${row}"][data-col="${column}"]`);
            const color = (movePlayer === player) ? playerColor : opponentColor;
            cellToPlace.dataset.value = (color === playerColor) ? "1" : "2";
            cellToPlace.classList.add(color);

            if (game.checkWinner((color === playerColor) ? "1" : "2")) {
                setTimeout(() => {
                    messageDiv.textContent = `Le joueur ${color} a gagné !`;
                    console.log(`Le joueur ${color} a gagné !`);
                    showEndGamePopup(`Le joueur ${color} a gagné !`);
                }, 100);
            } else {
                currentPlayer = (movePlayer === player) ? opponent : player;
                currentColor = (movePlayer === player) ? opponentColor : playerColor;
                turn = moveTurn + 1;
                updateTurnInfo();
            }
        } else {
            alert("La colonne est pleine !");
        }
    }

    function createBoard() {
        console.log("Creating game board");
        board.innerHTML = '';
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 7; col++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.value = "0";
                board.appendChild(cell);
            }
        }
    }

    createBoard();

    function getLowestEmptyRow(col) {
        const cellsInColumn = document.querySelectorAll(`[data-col="${col}"]`);
        for (let i = cellsInColumn.length - 1; i >= 0; i--) {
            if (cellsInColumn[i].dataset.value === "0") {
                return parseInt(cellsInColumn[i].dataset.row);
            }
        }
        return -1;
    }

    function updateTurnInfo() {
        turnDiv.textContent = `Turn ${turn}: ${currentPlayer}'s turn (${currentColor})`;
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
            window.location.href = "lobby.html";
        });
        const leaveButton = document.createElement("button");
        leaveButton.textContent = "Leave Game";
        leaveButton.addEventListener("click", function() {
            socket.send(JSON.stringify({ type: "leave_queue", username: player }));
            window.location.href = "lobby.html";
        });
        popup.appendChild(popupMessage);
        popup.appendChild(requeueButton);
        popup.appendChild(leaveButton);
        document.body.appendChild(popup);
    }
});