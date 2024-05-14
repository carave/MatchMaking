document.addEventListener("DOMContentLoaded", function() {
    const ROWS = 6;
    const COLS = 7;
    const board = document.getElementById("board");
    let currentPlayer = "red"; // Initialise le joueur actif (rouge)

    const game = new ConnectFour();

    // Ajouter un gestionnaire d'événements pour les clics sur les cellules du plateau
    board.addEventListener("click", handleClick);

    // Appeler la fonction pour créer le plateau de jeu
    createBoard();

    // Fonction pour créer le plateau de jeu
    function createBoard() {
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

    // Fonction pour détecter les clics sur les cellules du plateau
    function handleClick(event) {
        const cell = event.target;
        const col = parseInt(cell.dataset.col);
        const row = getLowestEmptyRow(col); // Obtient la ligne la plus basse vide dans la colonne

        if (row !== -1) {
            // Place le jeton dans la cellule correspondante
            const cellToPlace = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            const currentPlayerToken = (currentPlayer === "red") ? "1" : "2";
            cellToPlace.dataset.value = currentPlayerToken;
            cellToPlace.classList.add(currentPlayer); // Ajoute la classe correspondant à la couleur du joueur

            // Vérifie si le joueur actif a gagné
            if (game.checkWinner(currentPlayerToken)) {
                setTimeout(() => {
                    alert("Le joueur " + (currentPlayer === "red" ? "Rouge" : "Jaune") + " a gagné !");
                    // Réinitialise le plateau de jeu après la victoire
                    resetBoard();
                }, 100);
                return;
            }

            // Change le joueur actif pour le prochain tour
            currentPlayer = (currentPlayer === "red") ? "yellow" : "red";
        } else {
            // La colonne est pleine, affichez un message d'avertissement
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