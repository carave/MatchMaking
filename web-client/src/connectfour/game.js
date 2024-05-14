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
                    return `${this.currentPlayer} wins`;
                }
                this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                return true;
            }
        }
        return false; // column is full
    }

    checkWinner(player) {
        // Implement winning logic
        // Vérifier les lignes, les colonnes et les diagonales
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

        return false; // Aucune rangée de 4 jetons alignés n'a été trouvée
    }

    getCellValue(row, col) {
        if (row < 0 || row >= this.board.length || col < 0 || col >= this.board[0].length) {
            return -1; // Retourne -1 si la cellule est hors limites
        }
        return this.board[row][col];
    }
}

module.exports = { ConnectFour };