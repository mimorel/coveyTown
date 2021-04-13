import React, { useCallback, useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { ScoreList } from '../../classes/TownsServiceClient';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useMaybeVideo from '../../hooks/useMaybeVideo';


const LeaderboardModal: React.FunctionComponent = () => {
  const {isOpen, onOpen, onClose} = useDisclosure()
  const video = useMaybeVideo()
  const [currentLeaderboard, setCurrentLeaderboard] = useState<ScoreList[]>();;
  const { apiClient } = useCoveyAppState();
  const { currentTownID } =  useCoveyAppState();


  const openLeaderboard = useCallback(()=>{
    onOpen();
    video?.pauseGame();
  }, [onOpen, video]);

  if (video) {
    video.openLeaderboardModal = openLeaderboard;
  }

  const closeLeaderboard = useCallback(()=>{
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);

  // get scores
  const updateLeaderboard: () => void = useCallback(async ()=>{
    const scoreList = await apiClient.leaderboard({
        coveyTownID: currentTownID
    }    
  );
setCurrentLeaderboard(scoreList.scores);
}, [setCurrentLeaderboard, apiClient, currentTownID]);

  useEffect(() => {
    updateLeaderboard();
    const timer = setInterval(updateLeaderboard, 5000);
    return () => {
      clearInterval(timer)
    };
  }, [updateLeaderboard]);


  return <>
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
          {}
        <ModalHeader style={{alignSelf: "center"}}>Tic-Tac-Toe Leaderboard</ModalHeader>
        <table>
          <tr>
            <th>USERNAME</th>
            <th>SCORE</th>
            </tr>
        {currentLeaderboard?.map((result) => 
                  <tr key={result.userName} className="row">
                  <td>{result.userName}</td>
                  <td>{result.score}</td>
              </tr>)}
              </table>
              <Button colorScheme="red" style={{width: "20%", alignSelf: "center", marginTop: "10px"}} onClick={closeLeaderboard}>Close</Button>
          <ModalBody pb={6}/>
      </ModalContent>
    </Modal>
  </>
}


export default LeaderboardModal;
