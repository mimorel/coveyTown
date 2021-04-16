# TicTacToe game
TicTacToe is a feature of covey.town in which users in the same town can compete against each other in a game of tic-tac-toe. 

## Playing the game (user stories 1 and 2)

### How to play
#### Notes
- This is a two player game. This means:
  - Any users that try to join the game after two players are already in the game will not be able to join the game until after the current game finishes. They can however watch the current game (see [viewing the game](#Viewing the game))
  - A single user could play by themselves by starting the game as both users, but to simulate two players in the game, simply join the town/game from two separate browser windows 
  
1. Navigate to the 'TicTacToe Board' section of the map
2. Press the `space bar` to open the game board. If you are the first player to join the game, you will see the text 'Press start to join game!'. If you are the second player to join the game, you will see the text 'Waiting for another player'
3. Click 'Start game'
4. Wait for a second player to join the game, if needed (see note in **Notes** about playing as a single user) 
5. Click on a square to make a move. You will not be able to make a move (it will not register) if you go out of turn or choose an already-selected square
6. Play TicTacToe against your opponent
7. If you want to leave the game at any point, click the 'Quit' button. This will end the game and call it a draw
8. If you play until the end of the game and there is a winner, the winner will be awarded points and the loser will get 0 points. If it is a draw, neither player gets any points. These points will be reflected in the leaderboard (see next section)
9. If you want to play again, you and a second player will need to press 'Start game' again to start a new game

<img align=center width="462" alt="Screen Shot 2021-04-15 at 9 13 43 PM" src="https://user-images.githubusercontent.com/35878459/114986272-8364b980-9e2f-11eb-96c4-c5cd64931637.png"> <img align=center width="456" alt="Screen Shot 2021-04-15 at 9 14 58 PM" src="https://user-images.githubusercontent.com/35878459/114986397-a68f6900-9e2f-11eb-87b2-4b56af7dd4e7.png">


## Viewing the leaderboard (user story 3)
### Notes
- All users that enter the town begin with a score of 0

### How to view
1. Move your avatar to the 'Leaderboard' section of the map
2. Press the `space bar`to view the leaderboard
3. Look for your username on the board to see your points and where you fall in comparison to others in the room (higher up = more points)

## Viewing the game 
### Notes
This feature is not listed in the user stories of our earlier project plan. We decided to add it during implementation. 

1. If two people are already playing a game of TicTacToe, navigate to the 'TicTacToe Board' section of the map where they are playing
2. Press the `space bar` to open the game board
