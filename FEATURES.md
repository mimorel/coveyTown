# TicTacToe game
TicTacToe is a feature of covey.town in which users in the same town can compete against each other in a game of tic-tac-toe. 

## Playing the game (user stories 1 and 2)
<p align=center><img src="https://user-images.githubusercontent.com/35878459/115083143-abd9cb80-9ea2-11eb-8f43-78c1d10eed22.gif" height="700"/></p>

### How to play
1. Navigate to the 'TicTacToe Board' section of the map
2. Press the `space bar` to open the game board. If you are the first player to join the game, you will see the text 'Press start to join game!'. If you are the second player to join the game, you will see the text 'Waiting for another player'
3. Click 'Start game'
4. Wait for a second player to join the game, if needed (see note in **Notes** about playing as a single user) 
5. Click on a square to make a move. You will not be able to make a move (it will not register) if you go out of turn or choose an already-selected square
6. Play TicTacToe against your opponent
7. If you want to leave the game at any point, click the 'Quit' button. This will end the game and call it a draw
8. If you play until the end of the game and there is a winner, the winner will be awarded points and the loser will get 0 points. If it is a draw, neither player gets any points. These points will be reflected in the leaderboard (see next section)
9. If you want to play again, you and a second player will need to press 'Start game' again to start a new game

#### Notes
- This is a two player game. This means:
  - Any users that try to join the game after two players are already in the game will not be able to join the game until after the current game finishes. They can however watch the current game (see [viewing the game](#viewing-the-game))
  - A single user could play by themselves by starting the game as both users, but to simulate two players in the game, simply join the town/game from two separate browser windows 

## Viewing the leaderboard (user story 3)
![leaderboard](https://user-images.githubusercontent.com/35878459/115081670-65836d00-9ea0-11eb-922b-2a1420547fbe.gif)

### How to view
1. Move your avatar to the 'Leaderboard' section of the map
2. Press the `space bar`to view the leaderboard
3. Look for your username on the board to see your points and where you fall in comparison to others in the room (higher up = more points)

#### Notes
- All users that enter the town begin with a score of 0

## Viewing the game as a non-participant in it
### Notes
This feature is not listed in the user stories of our earlier project plan because we decided to add it during implementation. 
- Please do not click 'Quit' if you are just a game viewer who is not participating in the actual gameplay. Click outside of the modal to close it instead. 

### How to 
1. If two people are already playing a game of TicTacToe, navigate to the 'TicTacToe Board' section of the map where they are playing
2. Press the `space bar` to open the game board. If you try to join the game via 'Start game', nothing will happen because you cannot join the game until the current game finishes (see note in **Notes** about ending viewing)
3. Wait for a player to make their next move, then you should be able to watch the board game and see whose turn it is. You will only see the current game once a player makes a move.
