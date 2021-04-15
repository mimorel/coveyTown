import React, { useState , useEffect} from "react";
import ReactDOM from "react-dom";
import {
  useToast,
  Button
} from '@chakra-ui/react';
import { io, Socket } from 'socket.io-client';
import useCoveyAppState from "../../hooks/useCoveyAppState";

interface SquareComponentProps {
  value: number,
  onClick: () => Promise<void>,
  // key: number
}

function Square({value, onClick}: SquareComponentProps ): JSX.Element {
  console.log(`square render index ${value}`)

  return (
    <button type="button" className="square" onClick={onClick}>
    {value}    
</button>
  );
}

// function Restart({onClick: any}) {

//   return (
//     <Button size="sm" colorScheme="teal" type="button" className="restart" onClick={onClick}>
//       Play again
//     </Button>
//   );
// }

// Restart.propTypes = {
//   onClick: null
// }

// Restart.defaultProps = {
//   onClick: () => {}
// }

interface GameComponentProps {
  townID: string,
  playerID: string
}


function Game({ townID, playerID }: GameComponentProps) {
  const [ squares, setSquares ] = useState(Array(9).fill(''));
  const [ isXNext, setIsXNext ] = useState(true);
  const nextSymbol = isXNext ? "X" : "O";
  const winner = null;
  const  { apiClient, players, sessionToken, socket } = useCoveyAppState();
  const toast = useToast();
  const url = process.env.REACT_APP_TOWNS_SERVICE_URL;
  // const socket = io(url!, { auth: { token: sessionToken, coveyTownID: townID } });

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

  useEffect(() => {
    socket!.on('updateBoard', (board: [][]) => {
    console.log(`sessiontoken is ${sessionToken}`);
    console.log(board);
    const merged = [].concat(...board);
    console.log(merged);
    setSquares(merged);
    // call getWhoseTurn here
   
  })
}, [socket]);



 async function getPosX(i: number) {
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

 async function getPosY(i: number) {
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

  async function makeMove(i: number) {
    const x = await getPosX(i);
    const y = await getPosY(i);
    const xString = x.toString();
    const yString = y.toString();
    try {    
      console.log(`x pos: ${x} y pos: ${y}`);
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


  // function renderSquare(i) {
  //   return (
  //     <Square
  //       value={squares[i]}
  //       onClick={() => {
  //         if (squares[i] != null || winner != null) {
  //           return;
  //         }
  //         // send makeMove request here
  //         makeMove(i);
  //         const nextSquares = squares.slice();
  //         switch (nextSquares[i]) {
  //           case 0:
  //             nextSquares[i] = null;
  //             break;
  //             case 1: 
  //             nextSquares[i] = X;
  //             break;
  //             case 2: 
  //             nextSquares[i] = O;
  //             break;
  //         }
  //         // nextSquares[i] = nextSymbol;
  //         setSquares(nextSquares);
  //         // setIsXNext(!isXNext); // toggle turns
  //       }}
  //     />
  //   );
  // }

  async function squareClickHandler(i: number) {
    // if (squares[i] != null || winner != null) {
    //         return;
    //       }
      await makeMove(i);
      const nextSquares = squares.slice();
      console.log(`nextSquares: ${nextSquares}`);
          switch (squares[i]) {
            case 0:
            case '':
              nextSquares[i] = '';
              break;
            case 1: 
              nextSquares[i] = 'X';
              break;
            case 2: 
              nextSquares[i] = 'O';
              break;
            default: 
            console.log(`value is: ${nextSquares[i]}`);
          }
          // nextSquares[i] = nextSymbol;
          // setSquares(nextSquares);
          console.log(`after: ${nextSquares}`);
          // setIsXNext(!isXNext); // toggle turns
        };

  // function renderRestartButton() {
  //   return (
  //     <Restart
  //       onClick={() => {
  //         setSquares(Array(9).fill(null));
  //         setIsXNext(true);
  //       }}
  //     />
  //   );
  // }

  return (
    <div className="container">
      <div className="game">
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
             <Square key={index} value={squares[index+3]} onClick={()=>squareClickHandler(index +3)}/>
            )}
          </div>
          <div className="board-row">
          {squares.slice(6,9).map((result, index) => 
                     // eslint-disable-next-line react/no-array-index-key
             <Square key={index} value={squares[index+6]} onClick={()=>squareClickHandler(index +6)}/>
            )}
          </div>
        </div>
        <Button type="button" size="md" colorScheme="blue" className="start" onClick={()=> startGame()}>
          Start
    </Button>
        {/* <div className="restart-button">{renderRestartButton()}</div> */}
      </div>
    </div>
  );
}

export default Game;