import Player from '../types/Player';
import TicTacToe from './TicTacToe';

describe('TicTacToe Tests', () => {
  let game = new TicTacToe();
  const p1 = new Player('Player 1');
  const p2 = new Player('Player 2');
  let x: number;
  let y: number;

  beforeEach(() => {
    game = new TicTacToe();
  });

  describe('startGame', () => {
    it('Should return waiting msg if entered player is first to join', () => {
      const p1join = game.startGame(p1.id);
      expect(p1join).toBe('Waiting for player2');
    });
    it('Should return player1 and player2 if player1 already joined', () => {
      game.startGame(p1.id);
      const p2join = game.startGame(p2.id);
      expect(p2join).toBe(`X:${p1.id}, Y: ${p2.id}`);
    });
  });

  describe('makeMove', () => {
    beforeEach(() => {
      game.startGame(p1.id);
      game.startGame(p2.id);
    });
    it('Should put a marker at the specified location', () => {
      x = 0;
      y = 0;
      // player 1 moves
      game.makeMove(x, y);
      expect(game.getBoard()[x][y]).toBe(1);
      for (let i = 1; i < 3; i += 1) {
        for (let j = 1; j < 3; j += 1) {
          expect(game.getBoard()[i][j]).toBe(0);
        }
      }

      x = 1;
      y = 2;
      // player 2 moves
      game.makeMove(x, y);
      expect(game.getBoard()[x][y]).toBe(2);

      x = 1;
      y = 1;
      // player 1 moves
      game.makeMove(x, y);
      expect(game.getBoard()[x][y]).toBe(1);

      x = 2;
      y = 0;
      // player 2 moves
      game.makeMove(x, y);
      expect(game.getBoard()[x][y]).toBe(2);
    });
    it('Should throw if player tries to select a filled spot', async () => {
      // player 1 moves
      x = 0;
      y = 0;
      game.makeMove(x, y);
      expect(game.getBoard()[x][y]).toBe(1);

      // player 2 attempts move
      expect(game.makeMove).toThrow(Error);
      try {
        game.makeMove(x, y);
      } catch (err) {
        expect(err.message).toBe('choose a free space');
      }
    });
    it('Should end the game if someone won', async () => {
      const gameEnded = jest.spyOn(game, 'endGame');
      game.makeMove(0, 0); // [1 0 0] [0 0 0] [0 0 0]
      game.makeMove(1, 0); // [1 0 0] [2 0 0] [0 0 0]
      game.makeMove(2, 2); // [1 0 0] [2 0 0] [0 0 1]
      game.makeMove(1, 2); // [1 0 0] [2 0 2] [0 0 1]
      expect(game.isgameActive()).toBe(true);
      expect(gameEnded).not.toBeCalled();
      game.makeMove(1, 1); // [1 0 0] [2 1 0] [0 0 1]
      expect(game.isgameActive()).toBe(false);
      //expect(gameEnded).toBeCalled();
    });
    it('Should end the game if the board is full', async () => {
      const gameEnded = jest.spyOn(game, 'endGame');

      game.makeMove(0, 0); // [1 0 0] [0 0 0] [0 0 0]
      game.makeMove(0, 1); // [1 2 0] [0 0 0] [0 0 0]
      game.makeMove(0, 2); // [1 2 1] [0 0 0] [0 0 0]
      game.makeMove(1, 0); // [1 2 1] [2 0 0] [0 0 0]
      game.makeMove(1, 1); // [1 2 1] [2 1 0] [0 0 0]
      game.makeMove(1, 2); // [1 2 1] [2 1 2] [0 0 0]
      game.makeMove(2, 1); // [1 2 1] [2 1 2] [0 1 0]
      game.makeMove(2, 0); // [1 2 1] [2 1 2] [2 1 0]
      expect(game.isgameActive()).toBe(true);
      expect(gameEnded).not.toBeCalled();
      // fill in the last empty space
      game.makeMove(2, 2); // [1 2 1] [2 1 2] [2 1 1]
      expect(game.isgameActive()).toBe(false);
      //expect(gameEnded).toBeCalled();
    });
  });

  describe('getWinner', () => {
    it('Should return the appropriate winner', () => {
      game.startGame(p1.id);
      game.startGame(p2.id);
      game.makeMove(0, 0);
      game.makeMove(1, 1);
      game.makeMove(0, 1);
      game.makeMove(1, 0);
      game.makeMove(0, 2);
      const winner = game.getWinner();
      expect(winner).toBe(p1.id);
    });
    it('Should throw if there is no current winner', async () => {
      game.startGame(p1.id);
      game.startGame(p2.id);
      game.makeMove(0, 0);
      game.makeMove(1, 0);
      expect(game.getWinner).toThrow(Error);
      try {
        game.getWinner();
      } catch (err) {
        expect(err.message).toBe('no winner');
      }
    });
  });

  describe('getBoard', () => {
    it('Should return the gameboard as a 2D array', () => {
      game.startGame(p1.id);
      game.startGame(p2.id);
      game.makeMove(0, 0); // [1 0 0] [0 0 0] [0 0 0]
      game.makeMove(1, 0); // [1 0 0] [2 0 0] [0 0 0]
      game.makeMove(2, 2); // [1 0 0] [2 0 0] [0 0 1]
      game.makeMove(1, 2); // [1 0 0] [2 0 2] [0 0 1]

      const board = [[1, 0, 0], [2, 0, 2], [0, 0, 1]];

      expect(game.getBoard()).toStrictEqual(board);
    });
  });

  describe('endGame', () => {
    beforeEach(() => {
      game.startGame(p1.id);
      game.startGame(p2.id);
      game.makeMove(0, 0); // [1 0 0] [0 0 0] [0 0 0]
      game.makeMove(1, 0); // [1 0 0] [2 0 0] [0 0 0]
      game.makeMove(2, 2); // [1 0 0] [2 0 0] [0 0 1]
      game.makeMove(1, 2); // [1 0 0] [2 0 2] [0 0 1]
    });

    it('Should end the game', () => {
      game.endGame();
      expect(game.isgameActive()).toBe(false);
    });
    it('Should refresh the board', async () => {
      // check that board has spots filled out

      game.endGame();
      /**
      for (let i = 1; i < 3; i += 1) {
        for (let j = 1; j < 3; j += 1) {
          expect(game.getBoard()[i][j]).toBe(0);
        }
      } */
    });
    it('Should refresh the active players', async () => {
      game.endGame();
      expect(game.currentPlayer()).toBe('');
    });
    it('Should refresh the winner (throw an error because there should be none)', async () => {
      game.makeMove(1, 1); // [1 0 0] [2 1 0] [0 0 1]
      expect(game.getWinner()).toBe(p1.id);

      game.endGame();
      expect(game.getWinner).toThrow(Error);
      try {
        game.getWinner();
      } catch (err) {
        expect(err.message).toBe('no winner');
      }
    });
  });
});
