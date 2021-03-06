import ITicTacToe from './ITicTacToe';

/**
 * An implamentation of ITicTacToe representing the leaderboard, which shows the top scores in each town.
*/
export default class TicTacToe implements ITicTacToe{

  private _player1Id = ''; // x

  private _player2Id = ''; // o

  private _gameBoard = [[0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]];

  private _curPlayer  = 1; // who's turn is it

  private _gameActive = false;

  private _winningPlayer  = '';

  isgameActive(): boolean {
    return this._gameActive;
  }

  currentPlayer(): string{
    if (!this._gameActive){
      return '';
    }
    if (this._curPlayer === 1) {
      return this._player1Id;
    }

    return this._player2Id;
  }




  private resetGameBoard(): void {
    this._gameBoard = [[0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]];
  }

  private setWinningPlayer(): void {
    this._winningPlayer = this.currentPlayer();
  }



  startGame(playerID: string): string {
    // if no one else has joined the game
    if (this._player1Id === '') {
      this._player1Id = playerID;
      return 'Waiting for player2';
    }

    if (this._player1Id === this._player2Id) {
      throw new Error('Invalid Players');
    }

    if (this._gameActive) {
      throw new Error('gameAlreadyActive');
    }
    // if two players have joined the game

    this._player2Id = playerID;
    this._gameActive = true;
    this._winningPlayer = '';
    this._curPlayer = 1;



    return `X:${this._player1Id}, Y: ${this._player2Id}`;

  }


  getWinner(): string {
    if (this._winningPlayer === '') {
      throw  Error('no winner');
    }
    return this._winningPlayer;
  }


  getBoard(): number[][] {
    return this._gameBoard;
  }


  /**
   * Is the board full, or is there room to continue playing?
  */
  private isFull(): boolean {
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        if (this._gameBoard[i][j] === 0) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Checks if the current player's last move won the game
  */
  private isWin(): boolean {
    // up and down
    for (let i = 0; i < 3; i += 1) {
      if (this._gameBoard[i][0] === this._curPlayer && this._gameBoard[i][1] === this._curPlayer && this._gameBoard[i][2] === this._curPlayer) {
        this.setWinningPlayer();
        return true;
      }
      if (this._gameBoard[0][i] === this._curPlayer && this._gameBoard[1][i] === this._curPlayer && this._gameBoard[2][i] === this._curPlayer) {
        this.setWinningPlayer();
        return true;
      }
    }
    // diagonally
    if (this._gameBoard[0][0] === this._curPlayer && this._gameBoard[1][1] === this._curPlayer && this._gameBoard[2][2] === this._curPlayer) {
      this.setWinningPlayer();
      return true;
    }
    if (this._gameBoard[2][0] === this._curPlayer && this._gameBoard[1][1] === this._curPlayer && this._gameBoard[0][2] === this._curPlayer) {
      this.setWinningPlayer();
      return true;
    }
    return false;
  }


  makeMove(x:number, y:number): void {
    // check if move is valid/ game is current
    if (!this._gameActive) {
      throw new Error('game not active');
    }
    if (x > 2 || x < 0 || y > 2 || y < 0) {
      throw new Error('invalid x/y');
    }
    if (this._gameBoard[x][y] !== 0) {
      throw new Error('choose a free space');
    }

    // make move since it is valid
    this._gameBoard[x][y] = this._curPlayer;

    // check if move won game/ if we can keep playing
    if (this.isWin()) {
      this._gameActive = false;
    }

    if (this.isFull()) {
      this._gameActive = false;

    }

    // change to next player
    this._curPlayer %= 2;
    this._curPlayer += 1;

  }


  endGame(): void{
    this.resetGameBoard();
    this._gameActive = false;
    this._player1Id = '';
    this._player2Id = '';

  }

}
