// import TicTacToe from './TicTacToe';
// import { customAlphabet, nanoid } from 'nanoid';

import CoveyTownController from './CoveyTownController';


const ctc = new CoveyTownController('Rgc2awmn7oAPnJZNPyjOoyBghgEdLu7Kz', true);

ctc.startGame('Yo');
ctc.startGame('Jam');

console.log(ctc.isgameActive);

console.log(ctc.getBoard());

ctc.makeMove(0, 0);
console.log(ctc.getBoard());

ctc.makeMove(0, 1);
console.log(ctc.getBoard());

ctc.makeMove(1, 0);
console.log(ctc.getBoard());

ctc.makeMove(1, 1);
console.log(ctc.getBoard());

ctc.makeMove(2, 0);
console.log(ctc.getBoard());





/**
const game  = new TicTacToe();

console.log(game.isgameActive);

const g1 = game.startGame("france");
console.log(g1);
const g2 = game.startGame("london");
console.log(g2);


console.log(game.getBoard());

game.makeMove(0,0);
console.log(game.getBoard());

game.makeMove(0,1);
console.log(game.getBoard());

game.makeMove(1,0);
console.log(game.getBoard());

game.makeMove(1,1);
console.log(game.getBoard());

game.makeMove(2,0);
console.log(game.getBoard());




console.log(game.isgameActive);

console.log(game.currentPlayer);
game.makeMove(0,0);
console.log(game.getBoard());


console.log(game.currentPlayer);
game.makeMove(0,1);
console.log(game.getBoard());

game.makeMove(1,1);
console.log(game.getBoard());

game.makeMove(0,2);
console.log(game.getBoard());

game.makeMove(2,2);


console.log(game.getBoard());
console.log(game.isgameActive);


console.log(game.getWinner());

x o o
- x -
- - x

*/
