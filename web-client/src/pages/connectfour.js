class ConnectFour {
    constructor() {
        this.board = this.createBoard();
    }

    createBoard() {
        const rows = 6;
        const cols = 7;
        const board = [];
        for (let row = 0; row < rows; row++) {
            const rowArr = [];
            for (let col = 0; col < cols; col++) {
                rowArr.push(0);
            }
            board.push(rowArr);
        }
        return board;
    }

    makeMove(col) {
        const row = this.getLowestEmptyRow(col);
        if (row !== -1) {
            this.board[row][col] = (currentColor === playerColor) ? 1 : 2;
            return true;
        }
        return false;
    }

    getLowestEmptyRow(col) {
        for (let row = this.board.length - 1; row >= 0; row--) {
            if (this.board[row][col] === 0) {
                return row;
            }
        }
        return -1;
    }

    checkWinner(player) {
        // Vérifier les lignes
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col <= 7 - 4; col++) {
                if (this.board[row][col] === player &&
                    this.board[row][col + 1] === player &&
                    this.board[row][col + 2] === player &&
                    this.board[row][col + 3] === player) {
                    return true;
                }
            }
        }

        // Vérifier les colonnes
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= 6 - 4; row++) {
                if (this.board[row][col] === player &&
                    this.board[row + 1][col] === player &&
                    this.board[row + 2][col] === player &&
                    this.board[row + 3][col] === player) {
                    return true;
                }
            }
        }

        // Vérifier les diagonales (de gauche à droite)
        for (let row = 0; row <= 6 - 4; row++) {
            for (let col = 0; col <= 7 - 4; col++) {
                if (this.board[row][col] === player &&
                    this.board[row + 1][col + 1] === player &&
                    this.board[row + 2][col + 2] === player &&
                    this.board[row + 3][col + 3] === player) {
                    return true;
                }
            }
        }

        // Vérifier les diagonales (de droite à gauche)
        for (let row = 0; row <= 6 - 4; row++) {
            for (let col = 3; col < 7; col++) {
                if (this.board[row][col] === player &&
                    this.board[row + 1][col - 1] === player &&
                    this.board[row + 2][col - 2] === player &&
                    this.board[row + 3][col - 3] === player) {
                    return true;
                }
            }
        }

        return false;
    }
}