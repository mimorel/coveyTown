import React, { useCallback } from 'react';
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
        if (townID !== undefined) {
          await apiClient.endGame({ coveyTownID: townID });
        }
      } catch (err) {
        toast({
          title: 'Unable to quit game',
          description: err.toString(),
          status: 'error'
        })
      }
    }


  const closeGame = useCallback(()=>{
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);


  return <>
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
      <ModalHeader style={{alignSelf: "center"}}>TIC TAC TOE</ModalHeader>
    <div className="game">
              <div className="board">
              { townID && playerID ?  <Game townID={townID} playerID={playerID}/>  : <></> }
                  </div>
                  </div>
        <Button colorScheme="red" style={{width: "20%", alignSelf: "center", marginTop: "10px"}} onClick={()=> {closeGame(); quitGame();}}>QUIT</Button>
          <ModalBody pb={6}/>
      </ModalContent>
    </Modal>
  </>
}


