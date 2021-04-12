import React, { useState } from "react";
import ReactDOM from "react-dom";
import {
  Toast,
  useToast
} from '@chakra-ui/react';
import useCoveyAppState from "../../hooks/useCoveyAppState";

function Square({ value, onClick }) {

  return (
    <button type="button" className="square" onClick={onClick}>
      {value}
    </button>
  );
}

Square.propTypes = {
  value: String,
  onClick: null
}

Square.defaultProps = {
  value: null, 
  onClick: () => {}
}

function Restart({onClick}) {

  return (
    <button type="button" className="restart" onClick={onClick}>
      Play again
    </button>
  );
}

Restart.propTypes = {
  onClick: null
}

Restart.defaultProps = {
  onClick: () => {}
}

function Game(props) {
  const [ squares, setSquares ] = useState(Array(9).fill(null));
  const [ isXNext, setIsXNext ] = useState(true);
  const nextSymbol = isXNext ? "X" : "O";
  const winner = null;
  const { townID } = props;
  const { playerID } = props;
  const  { apiClient, players } = useCoveyAppState();
  const toast = useToast();
  const { playerUsername } = props;



  function getStatus() {
    return "return status here"
    // change this
    // if (nextSymbol) {
    //   return "Winner: " + "add winner here";
    // } else if (isBoardFull(squares)) {
    //   return "Draw!";
    // } else { 
    //   return `Next player: ${nextSymbol}`;
    // }
  }

  // start game call here
  async function startGame() {
    console.log(`playerid for start game: ${playerID}`);
    try {
      const start = await apiClient.startGame({
        coveyTownID: townID,
        playerID,
      });
      console.log(`startgame resp: ${start.gameStatus}`);
    } catch (err) {
      toast({
        title: 'Unable to startgame',
        description: err.toString(),
        status: 'error'
      })
    }
  }

 async function getPosX(i) {
    switch (i) {
      case 0:
      case 3:
      case 6:
        return 0;
      case 1:
      case 4:
      case 7:
        return 1;
      case 2: 
      case 5:
      case 8: 
        return 2;
      default:
      console.log("default case");
    }
    return 99;
  }

 async function getPosY(i) {
    switch (i) {
      case 0:
      case 1:
      case 2:
        return 0;
      case 3:
      case 4:
      case 5:
        return 1;
      case 6: 
      case 7:
      case 8: 
        return 2;
      default:
      console.log("default case");
    }
    return 99;
  }

  async function makeMove(i) {
    const x = await getPosX(i);
    const y = await getPosY(i);
    try {    
      console.log(`x pos: ${x} y pos: ${y}`);
      const move = await apiClient.makeMove({
        coveyTownID: townID,
        player: playerID,
        x,
        y
      });
      console.log(`makeMove response ${move.board}`);
    } catch (err) {
      toast({
        title: 'Unable to make move',
        description: err.toString(),
        status: 'error'
      })
    }
  }


  function renderSquare(i) {
    return (
      <Square
        value={squares[i]}
        onClick={() => {
          if (squares[i] != null || winner != null) {
            return;
          }
          // send makeMove request here
          makeMove(i);
          const nextSquares = squares.slice();
          nextSquares[i] = nextSymbol;
          setSquares(nextSquares);
          setIsXNext(!isXNext); // toggle turns
        }}
      />
    );
  }

  function renderRestartButton() {
    return (
      <Restart
        onClick={() => {
          setSquares(Array(9).fill(null));
          setIsXNext(true);
        }}
      />
    );
  }

  return (
    <div className="container">
      <div className="game">
        <div className="game-board">
          <div className="board-row">
            {renderSquare(0)}
            {renderSquare(1)}
            {renderSquare(2)}
          </div>
          <div className="board-row">
            {renderSquare(3)}
            {renderSquare(4)}
            {renderSquare(5)}
          </div>
          <div className="board-row">
            {renderSquare(6)}
            {renderSquare(7)}
            {renderSquare(8)}
          </div>
        </div>
        <div className="game-info">{getStatus()}</div>
        <button type="button" className="start" onClick={()=> startGame()}>
          Start
    </button>
        <div className="restart-button">{renderRestartButton()}</div>
      </div>
    </div>
  );
}

Game.propTypes = {
  townID: String,
  playerID: String,
  playerUsername: String
}

Game.defaultProps = {
  townID: null,
  playerID: null, 
  playerUsername: null
}

export default Game;