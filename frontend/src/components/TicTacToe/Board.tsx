import React, { useState , useEffect} from "react";
import ReactDOM from "react-dom";
import {
  useToast,
  Button
} from '@chakra-ui/react';
import useCoveyAppState from "../../hooks/useCoveyAppState";

interface SquareComponentProps {
  value: number,
  onClick: () => Promise<void>,
}

function Square({value, onClick}: SquareComponentProps ): JSX.Element {

  function squareType(sq: number) {
    if (sq===1) {
      return 'X';
    } if (sq===2) {
      return 'O';
    }  
      return '';
    }
  

  return (
    <button type="button" className="square" onClick={onClick}>
      {squareType(value)}
</button>
  );
}

interface GameComponentProps {
  townID: string,
  playerID: string
}


function Game({ townID, playerID }: GameComponentProps) {
  const [ squares, setSquares ] = useState(Array(9).fill(''));
  const [ isXNext, setIsXNext ] = useState(true);
  const nextSymbol = isXNext ? "1" : "2";
  const [ gameWinner, setGameWinner ] = useState('');
  const [currPlayer, setCurrPlayer] = useState('Waiting for another player')
  const  { apiClient, players, sessionToken, socket } = useCoveyAppState();
  const toast = useToast();

  function getNameFromID(id: string) {
    const playerName = players.find((p) => p.id === id)?.userName;
    return playerName;
  }

  // socket calls here
  useEffect(() => {
    if (socket) {
    socket.on('updateBoard', (board: [][]) => {
    const merged = [].concat(...board);
    setSquares(merged);
  });

  socket.on('Game is Over', (winner: string) => {
    if (winner === "draw") {
      setGameWinner("GAME WAS A DRAW");
    } else {
    const name = getNameFromID(winner);
    const winnerString = `Winner is: ${name}`;
    setGameWinner(winnerString);
  }});

  socket.on('playersTurn', (playerId: string) => {
    const name = getNameFromID(playerId);
    const currString = `${name}'s Turn`
    setCurrPlayer(currString);
  }); 
}}, [socket]);


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


 async function getPosX(i: number) {
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

 async function getPosY(i: number) {
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

  async function makeMove(i: number) {
    const x = await getPosX(i);
    const y = await getPosY(i);
    const xString = x.toString();
    const yString = y.toString();
    try {    
      const move = await apiClient.makeMove({
        coveyTownID: townID,
        player: playerID,
        x: xString,
        y: yString
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


  async function squareClickHandler(i: number) {
     const nextSquares = squares.slice();
     nextSquares[i] = nextSymbol;
     setSquares(nextSquares);
     await makeMove(i);
        };

  return (
    <div className="container">
      <div className="game">
        <div style={{color: "blue", fontSize: "18px"}}>{currPlayer}</div>
        <div style={{color: "green", fontSize: "32px"}}>{gameWinner}</div>
        <div className="game-board">
          <div className="board-row">
            {squares.slice(0,3).map((result, index) => 
           // eslint-disable-next-line react/no-array-index-key
             <Square key={index} value={squares[index]}  onClick={()=>squareClickHandler(index)}/>
            )}
          </div>
          <div className="board-row">
          {squares.slice(3,6).map((result, index) => 
          // eslint-disable-next-line react/no-array-index-key
             <Square key={index} value={squares[index+3]} onClick={()=>squareClickHandler(index+3)}/>
            )}
          </div>
          <div className="board-row">
          {squares.slice(6,9).map((result, index) => 
          // eslint-disable-next-line react/no-array-index-key
             <Square key={index} value={squares[index+6]} onClick={()=>squareClickHandler(index+6)}/>
            )}
          </div>
        </div>
        <Button type="button" size="md" colorScheme="blue" className="start" onClick={()=> startGame()}>
          Start
    </Button>
      </div>
    </div>
  );
}

export default Game;