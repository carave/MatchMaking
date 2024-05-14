document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed");

    const ROWS = 6;
    const COLS = 7;
    const board = document.getElementById("board");
    let currentPlayer = "red"; // Initialise le joueur actif (rouge)

    const game = new ConnectFour();
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = function(event) {
        console.log("WebSocket is open now.");
    };

    socket.onclose = function(event) {
        console.log("WebSocket is closed now.");
    };

    socket.onerror = function(event) {
        console.error("WebSocket error observed:", event);
    };

    socket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        console.log("Message from server:", message);
        handleMove(message.column, message.player);
    };

    board.addEventListener("click", function(event) {
        const cell = event.target;
        const col = parseInt(cell.dataset.col);
        if (game.makeMove(col)) {
            const message = {
                column: col,
                player: currentPlayer
            };
            socket.send(JSON.stringify(message));
            currentPlayer = (currentPlayer === "red") ? "yellow" : "red";
        }
    });

    function handleMove(column, player) {
        const row = getLowestEmptyRow(column); // Obtient la ligne la plus basse vide dans la colonne
        if (row !== -1) {
            const cellToPlace = document.querySelector(`[data-row="${row}"][data-col="${column}"]`);
            cellToPlace.dataset.value = (player === "red") ? "1" : "2";
            cellToPlace.classList.add(player);

            if (game.checkWinner((player === "red") ? "1" : "2")) {
                setTimeout(() => {
                    alert("Le joueur " + player + " a gagné !");
                    resetBoard();
                }, 100);
            }
        } else {
            alert("La colonne est pleine !");
        }
    }

    function createBoard() {
        console.log("Creating game board");
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.value = "0"; // Initialiser la valeur à 0 pour représenter une case vide
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
        return -1; // Retourne -1 si la colonne est pleine
    }

    function resetBoard() {
        const cells = document.querySelectorAll(".cell");
        cells.forEach(cell => {
            cell.dataset.value = "0";
            cell.classList.remove("red", "yellow");
        });
        currentPlayer = "red"; // Réinitialise le joueur actif
    }
});