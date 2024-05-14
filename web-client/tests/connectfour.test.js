const { ConnectFour } = require('../src/connectfour/game');

test('Create a new game', () => {
    const game = new ConnectFour();
    expect(game.board.length).toBe(6);
    expect(game.board[0].length).toBe(7);
});

test('Make a move', () => {
    const game = new ConnectFour();
    expect(game.makeMove(0)).toBe(true);
    expect(game.board[5][0]).toBe(1); // Assuming player 1 goes first and places a token in column 0
});

test('Check for a win', () => {
    const game = new ConnectFour();
    game.board[5][0] = 1;
    game.board[5][1] = 1;
    game.board[5][2] = 1;
    game.board[5][3] = 1;
    expect(game.checkWinner(1)).toBe(true);
});
