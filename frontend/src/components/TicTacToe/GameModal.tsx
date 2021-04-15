import React, { useCallback, useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import Player from '../../classes/Player'
import useMaybeVideo from '../../hooks/useMaybeVideo';
import Game from './Board'
import useCoveyAppState from "../../hooks/useCoveyAppState";

interface ChildComponentProps {
  players: Array<Player>;
}

export default function GameModal({ players }: ChildComponentProps): JSX.Element {
  const {isOpen, onOpen, onClose} = useDisclosure()
  const video = useMaybeVideo()
  const playerUsername = video?.userName;
  const townID = video?.coveyTownID;
  const  { apiClient } = useCoveyAppState();
  const toast = useToast();
  const [ currentTurn, setCurrentTurn ] = useState("Waiting for player");


  const playerID = players.find((p) => p.userName === playerUsername)?.id;

  const openGame = useCallback(()=>{
    onOpen();
    video?.pauseGame();
  }, [onOpen, video]);

  if (video) {
    video.openGameModal = openGame;
  }

    // quit game call here
    async function quitGame() {
      try {
        let quit = { message: 'TownID is undefined'}
        if (townID !== undefined) {
          quit = await apiClient.endGame({ coveyTownID: townID });
        }
        console.log(`quitgame resp: ${quit.message}`);
      } catch (err) {
        toast({
          title: 'Unable to quit game',
          description: err.toString(),
          status: 'error'
        })
      }
    }

    async function getWhoseTurn() {
      // console.log(`playerid for start game: ${playerID}`);
      try {
        let curr = { player: 'TownID was undefined'}
        if (townID !== undefined) {
          curr = await apiClient.currentPlayer({
            coveyTownID: townID,
          });
        }
        console.log(`currplayer resp: ${curr.player}`);
        setCurrentTurn(`${curr.player}'s Turn`);
      } catch (err) {
        // console.log("couldnt get current player");
        }
      }

      useEffect(() =>  {
        // getWhoseTurn();
      });
    

  const closeGame = useCallback(()=>{
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);


  return <>
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
      <ModalHeader>TIC TAC TOE</ModalHeader>
      <div className="game-info">{currentTurn}</div>
    <div className="game">
              <div className="board">
                <Game townID={townID} playerID={playerID} playerUsername={playerUsername}
                  />  
                  </div>
                  </div>
        <Button colorScheme="red" style={{width: "20%", alignSelf: "center", marginTop: "10px"}} onClick={()=> {closeGame(); quitGame();}}>QUIT</Button>
          <ModalBody pb={6}/>
      </ModalContent>
    </Modal>
  </>
}


