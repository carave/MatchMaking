document.addEventListener("DOMContentLoaded", function() {
    const ROWS = 6;
    const COLS = 7;
    const board = document.getElementById("board");
    let currentPlayer = "red"; // Initialise le joueur actif (rouge)

    const game = new ConnectFour();
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        handleMove(message.column, message.player);
    };

    // Ajouter un gestionnaire d'événements pour les clics sur les cellules du plateau
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

    // Fonction pour gérer le mouvement reçu via WebSocket
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

    // Fonction pour obtenir la ligne la plus basse vide dans une colonne donnée
    function getLowestEmptyRow(col) {
        const cellsInColumn = document.querySelectorAll(`[data-col="${col}"]`);
        for (let i = cellsInColumn.length - 1; i >= 0; i--) {
            if (cellsInColumn[i].dataset.value === "0") {
                return parseInt(cellsInColumn[i].dataset.row);
            }
        }
        return -1; // Retourne -1 si la colonne est pleine
    }

    // Fonction pour réinitialiser le plateau de jeu
    function resetBoard() {
        const cells = document.querySelectorAll(".cell");
        cells.forEach(cell => {
            cell.dataset.value = "0";
            cell.classList.remove("red", "yellow");
        });
        currentPlayer = "red"; // Réinitialise le joueur actif
    }
});