document.addEventListener("DOMContentLoaded", function() {
    const ROWS = 6;
    const COLS = 7;
    const board = document.getElementById("board");

    // Ajouter un gestionnaire d'événements pour les clics sur les cellules du plateau
    board.addEventListener("click", handleClick);

    // Appeler la fonction pour créer le plateau de jeu
    createBoard();
});

// Créer le plateau de jeu
function createBoard() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
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
        cellToPlace.classList.add("red"); // Par exemple, ajoutez une classe pour indiquer la couleur du jeton (rouge)
    } else {
        // La colonne est pleine, faites quelque chose pour gérer ce cas
        console.log("La colonne est pleine !");
    }
}

// Fonction pour obtenir la ligne la plus basse vide dans une colonne donnée
function getLowestEmptyRow(col) {
    const cellsInColumn = document.querySelectorAll(`[data-col="${col}"]`);
    for (let i = cellsInColumn.length - 1; i >= 0; i--) {
        if (!cellsInColumn[i].classList.contains("red") && !cellsInColumn[i].classList.contains("yellow")) {
            return parseInt(cellsInColumn[i].dataset.row);
        }
    }
    return -1; // Retourne -1 si la colonne est pleine
}