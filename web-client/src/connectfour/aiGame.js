
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

    const GameState = {
        PLAYER_TURN: 'PLAYER_TURN',
        AI_TURN: 'AI_TURN'
    };
    
    let gameState = GameState.PLAYER_TURN; // Initialisation de l'état du jeu comme le tour du joueur
    
    // Fonction pour gérer le clic sur le plateau
    boardElement.addEventListener("click", function(event) {
        if (!gameActive) return; // Si le jeu n'est pas actif, ne rien faire
    
        const cell = event.target;
        const col = parseInt(cell.dataset.col);
        
        if (gameState === GameState.PLAYER_TURN && currentPlayer === "red") {
            // Si c'est le tour du joueur et que le joueur est rouge, effectuer un coup
            if (game.makeMove(col)) {
                handleMove(col, currentPlayer);
                gameState = GameState.AI_TURN; // Passer au tour de l'IA
                handleAITurn(); // Exécuter le tour de l'IA
            }
        }
    });
    
    function handleAITurn() {
        setTimeout(() => {
            const aiMove = getBestMove();
            if (aiMove !== -1) {
                handleMove(aiMove, "yellow");
                gameState = GameState.PLAYER_TURN; // Passer au tour du joueur
            }
        }, 500);
    }
    
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

class ConnectFour {
    constructor() {
        this.board = this.createBoard();
        this.currentPlayer = 1;
    }

    createBoard() {
        return new Array(6).fill(null).map(() => new Array(7).fill(0));
    }

    makeMove(column) {
        for (let i = this.board.length - 1; i >= 0; i--) {
            if (this.board[i][column] === 0) {
                this.board[i][column] = this.currentPlayer;
                if (this.checkWinner(this.currentPlayer)) {
                    console.log(`Player ${this.currentPlayer} wins!`);
                    return `${this.currentPlayer} wins`;
                }
                this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                return true;
            }
        }
        return false; // column is full
    }

    checkWinner(player) {
        console.log(`Checking winner for player ${player}`);
        const ROWS = this.board.length;
        const COLS = this.board[0].length;

        // Check horizontal, vertical, diagonal
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (
                    this.getCellValue(row, col) === player &&
                    this.getCellValue(row, col + 1) === player &&
                    this.getCellValue(row, col + 2) === player &&
                    this.getCellValue(row, col + 3) === player
                ) return true;
                if (
                    this.getCellValue(row, col) === player &&
                    this.getCellValue(row + 1, col) === player &&
                    this.getCellValue(row + 2, col) === player &&
                    this.getCellValue(row + 3, col) === player
                ) return true;
                if (
                    this.getCellValue(row, col) === player &&
                    this.getCellValue(row + 1, col + 1) === player &&
                    this.getCellValue(row + 2, col + 2) === player &&
                    this.getCellValue(row + 3, col + 3) === player
                ) return true;
                if (
                    this.getCellValue(row, col) === player &&
                    this.getCellValue(row + 1, col - 1) === player &&
                    this.getCellValue(row + 2, col - 2) === player &&
                    this.getCellValue(row + 3, col - 3) === player
                ) return true;
            }
        }

        return false; // No winner found
    }

    getCellValue(row, col) {
        if (row < 0 || row >= this.board.length || col < 0 || col >= this.board[0].length) {
            return -1; // Return -1 if out of bounds
        }
        return this.board[row][col];
    }

    getLowestEmptyRow(col) {
        const cellsInColumn = document.querySelectorAll(`[data-col="${col}"]`);
        for (let i = cellsInColumn.length - 1; i >= 0; i--) {
            if (cellsInColumn[i].dataset.value === "0") {
                return parseInt(cellsInColumn[i].dataset.row);
            }
        }
        return -1;
    }
}