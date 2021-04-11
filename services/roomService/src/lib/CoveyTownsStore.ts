import CoveyTownController from './CoveyTownController';
import { CoveyTownList, ScoreList } from '../CoveyTypes';

function passwordMatches(provided: string, expected: string): boolean {
  if (provided === expected) {
    return true;
  }
  if (process.env.MASTER_TOWN_PASSWORD && process.env.MASTER_TOWN_PASWORD === provided) {
    return true;
  }
  return false;
}

export default class CoveyTownsStore {
  private static _instance: CoveyTownsStore;
  private _errorForBug = [[5,0,0],
              [0,0,0],
              [0,0,0]];

  private _towns: CoveyTownController[] = [];

  static getInstance(): CoveyTownsStore {
    if (CoveyTownsStore._instance === undefined) {
      CoveyTownsStore._instance = new CoveyTownsStore();
    }
    return CoveyTownsStore._instance;
  }

  getControllerForTown(coveyTownID: string): CoveyTownController | undefined {
    return this._towns.find(town => town.coveyTownID === coveyTownID);
  }

  getTowns(): CoveyTownList {
    return this._towns.filter(townController => townController.isPubliclyListed)
      .map(townController => ({
        coveyTownID: townController.coveyTownID,
        friendlyName: townController.friendlyName,
        currentOccupancy: townController.occupancy,
        maximumOccupancy: townController.capacity,
      }));
  }

  createTown(friendlyName: string, isPubliclyListed: boolean): CoveyTownController {
    const newTown = new CoveyTownController(friendlyName, isPubliclyListed);
    this._towns.push(newTown);
    return newTown;
  }

  updateTown(coveyTownID: string, coveyTownPassword: string, friendlyName?: string, makePublic?: boolean): boolean {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      if (friendlyName !== undefined) {
        if (friendlyName.length === 0) {
          return false;
        }
        existingTown.friendlyName = friendlyName;
      }
      if (makePublic !== undefined) {
        existingTown.isPubliclyListed = makePublic;
      }
      return true;
    }
    return false;
  }

  deleteTown(coveyTownID: string, coveyTownPassword: string): boolean {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      this._towns = this._towns.filter(town => town !== existingTown);
      existingTown.disconnectAllPlayers();
      return true;
    }
    return false;
  }

  getLeaderboard(coveyTownID: string): ScoreList | undefined {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown) {
      return existingTown.getScores();
    }
    return existingTown;
  }

  updateLeaderboard(coveyTownID: string, userName: string, points: number): ScoreList | undefined {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown) {
      return existingTown.updateLeaderboard(userName, points);
    }
    return existingTown;
  }

  /**  related to tictactoe**/

  startGame(coveyTownID:string, playerID: string): string {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown) {
      try {
      const response = existingTown.startGame(playerID);
      return response;
    }
    catch(err){
      return err;
    }
    }
    return "Unable to find town";
  }

  isgameActive(coveyTownID:string): boolean |undefined {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown) {
      return existingTown.isgameActive();
    }
    return false;
  }


  currentPlayer(coveyTownID:string): string{
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown) {
      return existingTown.currentPlayer();
    }
    else {
      return "";
    }
  }


  getWinner(coveyTownID:string): string {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown) {
      return existingTown.getWinner();
    }
    return "";
  }


  getBoard(coveyTownID:string): number[][] {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown) {
      return existingTown.getBoard();
    }
    return this._errorForBug;
  }


  makeMove(coveyTownID:string, x:number, y:number, player: string): number[][]{
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown) {
      console.log("if existing town is true");
      const currentPlayer = existingTown.currentPlayer();
      if (currentPlayer == player) {
        console.log("if current player == player is true");
        return existingTown.makeMove(x,y);
    }
  }
  console.log("error for bug is returned");
    return this._errorForBug;
  }

  endGame(coveyTownID:string): boolean {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown) {
    existingTown.endGame();
    return true;
    }
    return false;
  }

}
