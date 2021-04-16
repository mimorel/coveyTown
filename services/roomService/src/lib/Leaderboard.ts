import { ScoreList } from '../CoveyTypes';
import Player from '../types/Player';

/**
 * An object representing the leaderboard, which shows the top scores in each town.
 */
export default class Leaderboard {

  private _allScores: { userID: string, userName: string, score: number }[];

  get allScores(): { userID: string, userName: string, score: number }[] {
    return this._allScores;
  }

  set allScores(scores: { userID: string, userName: string, score: number }[]) {
    this._allScores = scores;
  }

  constructor() {
    this._allScores = [];
  }

  addPlayerToLeaderboard(player: Player): void {
    const players = this._allScores.filter((userinfo) => userinfo.userID === player.id);

    if (players.length > 0) {
      return;
    }

    this._allScores.push({ userID: player.id, userName: player.userName, score: 0 });
  }

  updateScore(userID: string, points: number): void {

    let user: {userID: string, userName: string, score: number };
    const potentialUser = this._allScores.filter((userInfo) => userID === userInfo.userID );

    if (potentialUser.length > 0) {
      [ user ] = potentialUser;
    } else {
      user = { userID, userName: userID, score: points };
    }
    
    const lb = this._allScores.filter((userInfo) =>  userID !== userInfo.userID );
    const updatedUser = { userID: user.userID, userName: user.userName, score: user.score + points };
    lb.push(updatedUser);

    this.allScores = lb;
    
  }

  /**
   * Gets just the top 10 scores in the room
   * 
   */
  getTopScores(): ScoreList {
    let allScoreValues: { userID: string, userName: string, score: number }[] = [];

    allScoreValues = this._allScores;

    // sort values
    allScoreValues.sort((score1, score2) => score2.score - score1.score);

    const topScores: { userName: string, score: number }[] = allScoreValues.slice(0, 10);

    return topScores;
  }

  /**
   * Removes the given player from the scoreboard (i.e. when they leave the room)
   * 
   * @param playerid 
   */
  removePlayer(playerid: string): void {
    this.allScores = this._allScores.filter((player) => player.userID !== playerid);
  }
}