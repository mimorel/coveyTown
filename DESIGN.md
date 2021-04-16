## Overview
To add TicTacToe to Covey.Town, we continued to utilize REST APIs for frontend-backend communication of both the game and the leaderboard. We also used
socket communication for keeping a player's board updated when the other player makes a move (i.e. the player doesn't send a request, but still receives an
update from the server). Since we utilized these existing methods of communication, the overarching architecture is largely unchanged. 

<img src="SE Project Arch.png" />

In the backend, we created new object representations for the TicTactoe game board and leaderboard and added them into each town. We also added to the REST API and WebSocket functionality to allow for communication of all TicTacToe related information with the frontend.

On the frontend, we have added new objects to the map as well as new components to interact with for the game board and leaderboard. 

## Backend updates 
#### Leaderboard.ts (all new)
| Class | Leaderboard |
|-|-|
| State            | allScores [an array of userIDs (string), userNames (string) and scores (number)] |
| Responsibilities | Tracks the running scores for players inside each room                           |
| Collaborators    | Player                                                                           |
<br>
#### TicTacToe.ts (all new)  
The TicTacToe class manages 
| Class | TicTacToe |
|-|-|
| State            | player1 (String), player2 (String), gameBoard (2D array of numbers), current player (number), winningPlayer (String) |
| Responsibilities | Manages and tracks the events of a TicTacToe game                                                                    |
| Collaborators    |                                                                                                                      |
#### CoveyTownController.ts
| Class | CoveyTownController |
|-|-|
| State            | players (Player[]), sessions (PlayerSession[]), videoClient (IVideoClient), listeners (CoveyRoomListener[]) |
| Responsibilities | Manages the events that occur in or involving players in the room, including adding, removing or relocating a player in a room.  |
| Collaborators    | PlayerSession, IVideoClient, TwilioVideo, CoveyRoomListener          |
#### CoveyTownStore.ts
| Class | CoveyTownsStore |
|-|-|
| State            | towns (CoveyTownController[]) |
| Responsibilities | Stores all the existing towns in a singleton class |
| Collaborators    | CoveyTownController |
#### CoveyTownRequestHandlers.ts
Added the following handlers:
leaderboardHandler
startGameHandler
isgameActiveHandler
currentPlayerHandler
getWinnerHandler
getBoardHandler
makeMoveHandler
endGameHandler
#### towns.ts
Added the following REST API calls:   
/leaderboard/:townID  
/tictactoe/:townID/:playerID  
/tictactoe/active/:townID  
/tictactoe/curplayer/:townID  
/tictactoe/:townID/:playerID/move  
/tictactoe/board/:townID  
/tictactoe/winner/:townID  
/tictactoe/:townID  
#### TownsServiceClient.ts


<br><br>
## Frontend updates 
#### Board.tsx
#### GameModal.tsx
#### LeaderboardModal.tsx
#### WorldMap.tsx
#### App.tsx
