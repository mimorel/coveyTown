## Overview
To add TicTacToe to Covey.Town, we decided the existing architecture was sufficient to complete the task (see diagram below). We continued to utilize REST APIs for frontend-backend communication of both the game and the leaderboard. We also used socket communication for keeping a player's board updated when the other player makes a move (i.e. the player doesn't send a request, but still receives an update from the server). 

<img src="SE Project Arch.png" />

In the backend, we created new object representations for the TicTactoe game board and leaderboard and added them into each town. We also added to the REST API and WebSocket functionality to allow for communication of all TicTacToe related information with the frontend.

On the frontend, we have added new objects to the map as well as new components to interact with for the game board and leaderboard. 

## Backend updates 
CRC cards provided for _classes_ that are new or have modifications. Updates are in **bold**.  
#### Leaderboard.ts (all new)
| Class | Leaderboard |
|-|-|
| State            | **allScores [an array of userIDs (string), userNames (string) and scores (number)]** |
| Responsibilities | **Tracks the running scores for players inside each room**                           |
| Collaborators    | **Player**                                                                           |

#### TicTacToe.ts (all new)  
| Class | TicTacToe |
|-|-|
| State            | **player1 (String), player2 (String), gameBoard (2D array of numbers), current player (number), winningPlayer (String)** |
| Responsibilities | **Manages and tracks the events of a TicTacToe game**                                                                    |
| Collaborators    |                                                                                                                      |

#### CoveyTownController.ts, CoveyTownsStore.ts
Added the functionality to play a game of TicTacToe in the room and view and update the leaderboard. In controller, also added functionality to notify appropriate listeners when certain events occur (`makeMove` and `endGame`). 
| Class | CoveyTownController |
|-|-|
| State            | players (Player[]), sessions (PlayerSession[]), videoClient (IVideoClient), listeners (CoveyRoomListener[]), friendlyName (string), townUpdatePassword (string), publicly listed (boolean), capacity (number), **tictactoe game (TicTacToe)**, **leaderboard (Leaderboard)** |
| Responsibilities | Manages the events that occur in or involving players in the room, including adding, removing or relocating a player in a room.  |
| Collaborators    | PlayerSession, IVideoClient, TwilioVideo, CoveyTownListener, **TicTacToe**, **Leaderboard**          |

#### CoveyTownListener.ts
Added functionality to call on listeners when a move is made (`onUpdateBoard()` and `onTurn()`) and when the game ends (`onGameEnd()`). 

#### CoveyTownRequestHandlers.ts, towns.ts, TownsServiceClient.ts
Added handlers for the below API calls. Also added to the `townSocketAdapter` to emit on player game moves and game end, and to the `townSubsriptionHandler` to inform the controller when a game ends (in CoveyTownRequestHandlers.ts).

Added the following REST API calls (call for client defined TownsServiceClient.ts is in parenthesis):   
`/leaderboard/:townID` - gets the leaderboard (just the top 10 scores) for a town (`leaderboard`)   
`/tictactoe/:townID/:playerID` - starts a game of TicTacToe with the given user as one of the players, refreshes leftover game data (`startGame`)   
`/tictactoe/active/:townID` - returns whether or not the TicTacToe game is active in a room (`isgameActive`)  
`/tictactoe/curplayer/:townID` - returns the player whose turn it currently is to make a move (`currentPlayer`)  
`/tictactoe/:townID/:playerID/move` - makes a move in the TicTacToe game; values that represent the move itself passed in json body (`getWinner`)  
`/tictactoe/board/:townID` - returns the current game board (`getBoard`)   
`/tictactoe/winner/:townID` - gets the winner of the last played TicTacToe game (`makeMove`)  
`/tictactoe/:townID` - ends a TicTacToe game, refreshes most game data (`endGame`)  

<br><br>
## Frontend updates 
#### Board.tsx
#### GameModal.tsx
#### LeaderboardModal.tsx
#### WorldMap.tsx
#### App.tsx
