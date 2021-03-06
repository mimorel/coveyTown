import { customAlphabet, nanoid } from 'nanoid';
import { ScoreList, UserLocation } from '../CoveyTypes';
import CoveyTownListener from '../types/CoveyTownListener';

import Player from '../types/Player';
import PlayerSession from '../types/PlayerSession';
import TwilioVideo from './TwilioVideo';
import IVideoClient from './IVideoClient';
import Leaderboard from './Leaderboard';
import TicTacToe from './TicTacToe';
import ITicTacToe from './ITicTacToe';

const friendlyNanoID = customAlphabet('1234567890ABCDEF', 8);

/**
 * The CoveyTownController implements the logic for each town: managing the various events that
 * can occur (e.g. joining a town, moving, leaving a town)
 */
export default class CoveyTownController {
  get capacity(): number {
    return this._capacity;
  }

  set isPubliclyListed(value: boolean) {
    this._isPubliclyListed = value;
  }

  get isPubliclyListed(): boolean {
    return this._isPubliclyListed;
  }

  get townUpdatePassword(): string {
    return this._townUpdatePassword;
  }

  get players(): Player[] {
    return this._players;
  }

  get occupancy(): number {
    return this._listeners.length;
  }

  get friendlyName(): string {
    return this._friendlyName;
  }

  set friendlyName(value: string) {
    this._friendlyName = value;
  }

  get coveyTownID(): string {
    return this._coveyTownID;
  }

  get leaderboard(): Leaderboard {
    return this._leaderboard;
  }

  /** The list of players currently in the town * */
  private _players: Player[] = [];

  /** The list of valid sessions for this town * */
  private _sessions: PlayerSession[] = [];

  /** The videoClient that this CoveyTown will use to provision video resources * */
  private _videoClient: IVideoClient = TwilioVideo.getInstance();

  /** The list of CoveyTownListeners that are subscribed to events in this town * */
  private _listeners: CoveyTownListener[] = [];

  private readonly _coveyTownID: string;

  private _friendlyName: string;

  private readonly _townUpdatePassword: string;

  private _isPubliclyListed: boolean;

  private _capacity: number;

  private _leaderboard: Leaderboard = new Leaderboard();

  private _tictactoe: ITicTacToe = new TicTacToe();


  constructor(friendlyName: string, isPubliclyListed: boolean) {
    this._coveyTownID = (process.env.DEMO_TOWN_ID === friendlyName ? friendlyName : friendlyNanoID());
    this._capacity = 50;
    this._townUpdatePassword = nanoid(24);
    this._isPubliclyListed = isPubliclyListed;
    this._friendlyName = friendlyName;
  }

  /**
   * Adds a player to this Covey Town, provisioning the necessary credentials for the
   * player, and returning them
   *
   * @param newPlayer The new player to add to the town
   */
  async addPlayer(newPlayer: Player): Promise<PlayerSession> {
    const theSession = new PlayerSession(newPlayer);

    this._sessions.push(theSession);
    this._players.push(newPlayer);

    // add player to the leaderboard
    this._leaderboard.addPlayerToLeaderboard(newPlayer);

    // Create a video token for this user to join this town
    theSession.videoToken = await this._videoClient.getTokenForTown(this._coveyTownID, newPlayer.id);

    // Notify other players that this player has joined
    this._listeners.forEach((listener) => listener.onPlayerJoined(newPlayer));

    return theSession;
  }

  /**
   * Destroys all data related to a player in this town.
   *
   * @param session PlayerSession to destroy
   */
  destroySession(session: PlayerSession): void {
    this._players = this._players.filter((p) => p.id !== session.player.id);
    this._sessions = this._sessions.filter((s) => s.sessionToken !== session.sessionToken);
    this._listeners.forEach((listener) => listener.onPlayerDisconnected(session.player));

    this._leaderboard.removePlayer(session.player.id);
  }

  /**
   * Updates the location of a player within the town
   * @param player Player to update location for
   * @param location New location for this player
   */
  updatePlayerLocation(player: Player, location: UserLocation): void {
    player.updateLocation(location);
    this._listeners.forEach((listener) => listener.onPlayerMoved(player));
  }



  /**
   * Subscribe to events from this town. Callers should make sure to
   * unsubscribe when they no longer want those events by calling removeTownListener
   *
   * @param listener New listener
   */
  addTownListener(listener: CoveyTownListener): void {
    this._listeners.push(listener);
  }



  /**
   * Unsubscribe from events in this town.
   *
   * @param listener The listener to unsubscribe, must be a listener that was registered
   * with addTownListener, or otherwise will be a no-op
   */
  removeTownListener(listener: CoveyTownListener): void {
    this._listeners = this._listeners.filter((v) => v !== listener);
  }



  /**
   * Fetch a player's session based on the provided session token. Returns undefined if the
   * session token is not valid.
   *
   * @param token
   */
  getSessionByToken(token: string): PlayerSession | undefined {
    return this._sessions.find((p) => p.sessionToken === token);
  }

  disconnectAllPlayers(): void {
    this._listeners.forEach((listener) => listener.onTownDestroyed());

  }

  getScores(): ScoreList {
    return this._leaderboard.getTopScores();
  }

  updateLeaderboard(userName: string, points: number): ScoreList {
    this._leaderboard.updateScore(userName, points);
    return this._leaderboard.getTopScores();
  }

  /** TicTacToe calls */
  startGame(playerID: string): string {
    if (this._players.some(e => e.id === playerID)) {
      try {
        const gameResponse = this._tictactoe.startGame(playerID);
        this._listeners.forEach((listener) => listener.onUpdateBoard(this.getBoard()));
        this._listeners.forEach((listener) => listener.onTurn(this.currentPlayer()));


        return gameResponse;

      } catch (e) {
        throw new Error('unable to startGame');
      }
    } else {
      throw new Error('Players are not part of the room');
    }
  }


  isgameActive(): boolean {
    return this._tictactoe.isgameActive();
  }


  currentPlayer(): string{
    return this._tictactoe.currentPlayer();
  }


  getWinner(): string {

    return this._tictactoe.getWinner();

  }


  getBoard(): number[][] {
    return this._tictactoe.getBoard();
  }


  makeMove(x:number, y:number): number[][] {
    try {

      this._tictactoe.makeMove(x, y);
      this._listeners.forEach((listener) => listener.onUpdateBoard(this.getBoard()));
      // is game over
      if (this.isgameActive() === false) {
        const finalBoard =  this._tictactoe.getBoard();

        // SEND WINNER
        try {
          const winner =  this.getWinner();
          this.updateLeaderboard(winner, 1);
        } catch (err) {
          /// do nothing if no winnter
        }

        this.endGame();
        return finalBoard;
      } 

      // update current player
      this._listeners.forEach((listener) => listener.onTurn(this.currentPlayer()));
      
      return this._tictactoe.getBoard();
    } catch (err) {
      return err;
    }
  }

  endGame(): void {
    try {
      const winner =  this.getWinner();
      this._listeners.forEach((listener) => listener.onGameEnd(winner));

    } catch (err) {
      this._listeners.forEach((listener) => listener.onGameEnd('draw'));

    }

    this._tictactoe.endGame();

  }

}
