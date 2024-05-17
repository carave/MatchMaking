document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const playerName = urlParams.get('player');
    console.log(`Player Name: ${playerName}`);

    const ROWS = 6;
    const COLS = 7;
    const boardElement = document.getElementById("board");
    let currentPlayer = "red"; // Initialise le joueur actif (rouge)
    const game = new ConnectFour();
    let gameActive = true;

    function createBoard() {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.value = "0"; // Initialiser la valeur à 0 pour représenter une case vide
                boardElement.appendChild(cell);
            }
        }
    }

    createBoard();

    boardElement.addEventListener("click", function(event) {
        if (!gameActive) return;

        const cell = event.target;
        const col = parseInt(cell.dataset.col);
        if (game.makeMove(col)) {
            handleMove(col, currentPlayer);

            // Si le jeu est contre l'IA et c'est le tour de l'IA
            if (currentPlayer === "yellow") {
                setTimeout(() => {
                    const aiMove = getBestMove();
                    if (aiMove !== -1) {
                        handleMove(aiMove, "yellow");
                    }
                    currentPlayer = "red";
                }, 500);
            } else {
                currentPlayer = "yellow";
            }
        }
    });

    function handleMove(column, player) {
        const row = game.getLowestEmptyRow(column);
        if (row !== -1) {
            const cellToPlace = document.querySelector(`[data-row="${row}"][data-col="${column}"]`);
            cellToPlace.dataset.value = (player === "red") ? "1" : "2";
            cellToPlace.classList.add(player);

            if (game.checkWinner((player === "red") ? 1 : 2)) {
                setTimeout(() => {
                    alert("Le joueur " + player + " a gagné !");
                    gameActive = false;
                    resetBoard();
                }, 100);
            }
        } else {
            alert("La colonne est pleine !");
        }
    }

    function resetBoard() {
        const cells = document.querySelectorAll(".cell");
        cells.forEach(cell => {
            cell.dataset.value = "0";
            cell.classList.remove("red", "yellow");
        });
        currentPlayer = "red"; // Réinitialise le joueur actif
        gameActive = true;
    }

    function getBestMove() {
        let bestScore = -Infinity;
        let bestCol = -1;

        for (let col = 0; col < COLS; col++) {
            if (game.getLowestEmptyRow(col) === -1) continue;

            let row = game.getLowestEmptyRow(col);
            game.board[row][col] = 2; // Simule le coup de l'IA

            let score = evaluateMove();
            game.board[row][col] = 0; // Annule la simulation

            if (score > bestScore) {
                bestScore = score;
                bestCol = col;
            }
        }

        return bestCol;
    }

    function evaluateMove() {
        // Ajoutez une logique simple pour évaluer les coups ici
        // Par exemple, retourner un score aléatoire pour l'instant
        return Math.random();
    }
});