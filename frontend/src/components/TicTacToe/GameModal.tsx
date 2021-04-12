import React, { useCallback, useState } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import Player from '../../classes/Player'
import useMaybeVideo from '../../hooks/useMaybeVideo';
import Game from './Board'
// import Game from './Game'

interface ChildComponentProps {
  players: Array<Player>;
}

export default function GameModal({ players }: ChildComponentProps) {
  const {isOpen, onOpen, onClose} = useDisclosure()
  const video = useMaybeVideo()
  const playerUsername = video?.userName;
  const townID = video?.coveyTownID;

  const playerID = players.find((p) => p.userName === playerUsername)?.id;

  const openGame = useCallback(()=>{
    onOpen();
    video?.pauseGame();
  }, [onOpen, video]);

  if (video) {
    video.openGameModal = openGame;
  }

  const closeGame = useCallback(()=>{
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);


  return <>
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
      <ModalHeader>TIC TAC TOE</ModalHeader>
    <div className="game">
              <div className="board">
                <Game townID={townID} playerID={playerID} playerUsername={playerUsername}
                  />  
                  </div>
                  </div>
        <Button onClick={closeGame}>Close</Button>
          <ModalBody pb={6}/>
      </ModalContent>
    </Modal>
  </>
}


