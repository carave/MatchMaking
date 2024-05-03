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
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    // Implementez ici la logique pour placer un jeton dans la colonne cliquée
}