document.addEventListener("DOMContentLoaded", function() {
    const ROWS = 6;
    const COLS = 7;
    const board = document.getElementById("board");
    let currentPlayer = "red"; // Initialise le joueur actif (rouge)

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
            // Ajoutez ici la logique pour placer le jeton dans la cellule
            const currentPlayerToken = (currentPlayer === "red") ? "1" : "2";
            cellToPlace.dataset.value = currentPlayerToken;
            cellToPlace.classList.add(currentPlayer); // Ajoute la classe correspondant à la couleur du joueur
            // Change le joueur actif pour le prochain tour
            currentPlayer = (currentPlayer === "red") ? "yellow" : "red";
            // Vérifie si le joueur actif a gagné
            if (checkWin(currentPlayerToken)) {
                alert("Le joueur " + currentPlayer + " a gagné !");
                // Réinitialise le plateau de jeu après la victoire
                resetBoard();
            }
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

    // Fonction pour vérifier si un joueur a une rangée de 4 jetons alignés
    function checkWin(player) {
        // Vérifier les lignes
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col <= COLS - 4; col++) {
                if (
                    getCellValue(row, col) === player &&
                    getCellValue(row, col + 1) === player &&
                    getCellValue(row, col + 2) === player &&
                    getCellValue(row, col + 3) === player
                ) {
                    return true;
                }
            }
        }

        // Vérifier les colonnes
        for (let col = 0; col < COLS; col++) {
            for (let row = 0; row <= ROWS - 4; row++) {
                if (
                    getCellValue(row, col) === player &&
                    getCellValue(row + 1, col) === player &&
                    getCellValue(row + 2, col) === player &&
                    getCellValue(row + 3, col) === player
                ) {
                    return true;
                }
            }
        }

        // Vérifier les diagonales (de gauche à droite)
        for (let row = 0; row <= ROWS - 4; row++) {
            for (let col = 0; col <= COLS - 4; col++) {
                if (
                    getCellValue(row, col) === player &&
                    getCellValue(row + 1, col + 1) === player &&
                    getCellValue(row + 2, col + 2) === player &&
                    getCellValue(row + 3, col + 3) === player
                ) {
                    return true;
                }
            }
        }

        // Vérifier les diagonales (de droite à gauche)
        for (let row = 0; row <= ROWS - 4; row++) {
            for (let col = COLS - 1; col >= 3; col--) {
                if (
                    getCellValue(row, col) === player &&
                    getCellValue(row + 1, col - 1) === player &&
                    getCellValue(row + 2, col - 2) === player &&
                    getCellValue(row + 3, col - 3) === player
                ) {
                    return true;
                }
            }
        }

        return false; // Aucune rangée de 4 jetons alignés n'a été trouvée
    }

    // Fonction pour obtenir la valeur d'une cellule dans le plateau de jeu
    function getCellValue(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        return cell ? parseInt(cell.dataset.value) : -1; // Retourne -1 si la cellule est hors limites
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