import Express from 'express';
import CORS from 'cors';
import http from 'http';
import { nanoid } from 'nanoid';
import assert from 'assert';
import { AddressInfo } from 'net';

import TownsServiceClient, { TownListResponse, TownJoinResponse } from './TownsServiceClient';
import addTownRoutes from '../router/towns';

type TestTownData = {
  friendlyName: string, coveyTownID: string,
  isPubliclyListed: boolean, townUpdatePassword: string
};

function expectTownListMatches(towns: TownListResponse, town: TestTownData) {
  const matching = towns.towns.find(townInfo => townInfo.coveyTownID === town.coveyTownID);
  if (town.isPubliclyListed) {
    expect(matching)
      .toBeDefined();
    assert(matching);
    expect(matching.friendlyName)
      .toBe(town.friendlyName);
  } else {
    expect(matching)
      .toBeUndefined();
  }
}

describe('TownsServiceAPIREST', () => {
  let server: http.Server;
  let apiClient: TownsServiceClient;

  async function createTownForTesting(friendlyNameToUse?: string, isPublic = false): Promise<TestTownData> {
    const friendlyName = friendlyNameToUse !== undefined ? friendlyNameToUse :
      `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
    const ret = await apiClient.createTown({
      friendlyName,
      isPubliclyListed: isPublic,
    });
    return {
      friendlyName,
      isPubliclyListed: isPublic,
      coveyTownID: ret.coveyTownID,
      townUpdatePassword: ret.coveyTownPassword,
    };
  }

  beforeAll(async () => {
    const app = Express();
    app.use(CORS());
    server = http.createServer(app);

    addTownRoutes(server, app);
    await server.listen();
    const address = server.address() as AddressInfo;

    apiClient = new TownsServiceClient(`http://127.0.0.1:${address.port}`);
  });
  afterAll(async () => {
    await server.close();
  });
  describe('CoveyTownCreateAPI', () => {
    it('Allows for multiple towns with the same friendlyName', async () => {
      const firstTown = await createTownForTesting();
      const secondTown = await createTownForTesting(firstTown.friendlyName);
      expect(firstTown.coveyTownID)
        .not
        .toBe(secondTown.coveyTownID);
    });
    it('Prohibits a blank friendlyName', async () => {
      try {
        await createTownForTesting('');
        fail('createTown should throw an error if friendly name is empty string');
      } catch (err) {
        // OK
      }
    });
  });

  describe('CoveyTownListAPI', () => {
    it('Lists public towns, but not private towns', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      const privTown1 = await createTownForTesting(undefined, false);
      const pubTown2 = await createTownForTesting(undefined, true);
      const privTown2 = await createTownForTesting(undefined, false);

      const towns = await apiClient.listTowns();
      expectTownListMatches(towns, pubTown1);
      expectTownListMatches(towns, pubTown2);
      expectTownListMatches(towns, privTown1);
      expectTownListMatches(towns, privTown2);

    });
    it('Allows for multiple towns with the same friendlyName', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      const privTown1 = await createTownForTesting(pubTown1.friendlyName, false);
      const pubTown2 = await createTownForTesting(pubTown1.friendlyName, true);
      const privTown2 = await createTownForTesting(pubTown1.friendlyName, false);

      const towns = await apiClient.listTowns();
      expectTownListMatches(towns, pubTown1);
      expectTownListMatches(towns, pubTown2);
      expectTownListMatches(towns, privTown1);
      expectTownListMatches(towns, privTown2);
    });
  });

  describe('CoveyTownDeleteAPI', () => {
    it('Throws an error if the password is invalid', async () => {
      const { coveyTownID } = await createTownForTesting(undefined, true);
      try {
        await apiClient.deleteTown({
          coveyTownID,
          coveyTownPassword: nanoid(),
        });
        fail('Expected deleteTown to throw an error');
      } catch (e) {
        // Expected error
      }
    });
    it('Throws an error if the townID is invalid', async () => {
      const { townUpdatePassword } = await createTownForTesting(undefined, true);
      try {
        await apiClient.deleteTown({
          coveyTownID: nanoid(),
          coveyTownPassword: townUpdatePassword,
        });
        fail('Expected deleteTown to throw an error');
      } catch (e) {
        // Expected error
      }
    });
    it('Deletes a town if given a valid password and town, no longer allowing it to be joined or listed', async () => {
      const { coveyTownID, townUpdatePassword } = await createTownForTesting(undefined, true);
      await apiClient.deleteTown({
        coveyTownID,
        coveyTownPassword: townUpdatePassword,
      });
      try {
        await apiClient.joinTown({
          userName: nanoid(),
          coveyTownID,
        });
        fail('Expected joinTown to throw an error');
      } catch (e) {
        // Expected
      }
      const listedTowns = await apiClient.listTowns();
      if (listedTowns.towns.find(r => r.coveyTownID === coveyTownID)) {
        fail('Expected the deleted town to no longer be listed');
      }
    });
  });
  describe('CoveyTownUpdateAPI', () => {
    it('Checks the password before updating any values', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      try {
        await apiClient.updateTown({
          coveyTownID: pubTown1.coveyTownID,
          coveyTownPassword: `${pubTown1.townUpdatePassword}*`,
          friendlyName: 'broken',
          isPubliclyListed: false,
        });
        fail('updateTown with an invalid password should throw an error');
      } catch (err) {
        // err expected
        // TODO this should really check to make sure it's the *right* error, but we didn't specify
        // the format of the exception :(
      }

      // Make sure name or vis didn't change
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
    });
    it('Updates the friendlyName and visbility as requested', async () => {
      const pubTown1 = await createTownForTesting(undefined, false);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      await apiClient.updateTown({
        coveyTownID: pubTown1.coveyTownID,
        coveyTownPassword: pubTown1.townUpdatePassword,
        friendlyName: 'newName',
        isPubliclyListed: true,
      });
      pubTown1.friendlyName = 'newName';
      pubTown1.isPubliclyListed = true;
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
    });
    it('Does not update the visibility if visibility is undefined', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      await apiClient.updateTown({
        coveyTownID: pubTown1.coveyTownID,
        coveyTownPassword: pubTown1.townUpdatePassword,
        friendlyName: 'newName2',
      });
      pubTown1.friendlyName = 'newName2';
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
    });
  });

  describe('CoveyMemberAPI', () => {
    it('Throws an error if the town does not exist', async () => {
      await createTownForTesting(undefined, true);
      try {
        await apiClient.joinTown({
          userName: nanoid(),
          coveyTownID: nanoid(),
        });
        fail('Expected an error to be thrown by joinTown but none thrown');
      } catch (err) {
        // OK, expected an error
        // TODO this should really check to make sure it's the *right* error, but we didn't specify
        // the format of the exception :(
      }
    });
    it('Admits a user to a valid public or private town', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      const privTown1 = await createTownForTesting(undefined, false);
      const res = await apiClient.joinTown({
        userName: nanoid(),
        coveyTownID: pubTown1.coveyTownID,
      });
      expect(res.coveySessionToken)
        .toBeDefined();
      expect(res.coveyUserID)
        .toBeDefined();

      const res2 = await apiClient.joinTown({
        userName: nanoid(),
        coveyTownID: privTown1.coveyTownID,
      });
      expect(res2.coveySessionToken)
        .toBeDefined();
      expect(res2.coveyUserID)
        .toBeDefined();

    });
  });

  /**
   * Beginning of new tests 
   */
  describe('LeaderboardAPI', () => {
    it('Throws an error if the town does not exist', async () => {
      await createTownForTesting(undefined, true);
      await expect(apiClient.leaderboard({ coveyTownID: nanoid() })).rejects.toThrow();
    });
    it('Returns just the top 10 scores in a room', async () => {
      const town = await createTownForTesting(undefined, true);
      let lb = await apiClient.leaderboard({ coveyTownID: town.coveyTownID });
      expect(lb.scores.length).toBe(0);
      await apiClient.joinTown({ userName: 'user1', coveyTownID: town.coveyTownID });
      await apiClient.joinTown({ userName: 'user2', coveyTownID: town.coveyTownID });
      await apiClient.joinTown({ userName: 'user3', coveyTownID: town.coveyTownID });
      await apiClient.joinTown({ userName: 'user4', coveyTownID: town.coveyTownID });
      await apiClient.joinTown({ userName: 'user5', coveyTownID: town.coveyTownID });
      lb = await apiClient.leaderboard({ coveyTownID: town.coveyTownID });
      expect(lb.scores.length).toBe(5);
      await apiClient.joinTown({ userName: 'user6', coveyTownID: town.coveyTownID });
      await apiClient.joinTown({ userName: 'user7', coveyTownID: town.coveyTownID });
      await apiClient.joinTown({ userName: 'user8', coveyTownID: town.coveyTownID });
      await apiClient.joinTown({ userName: 'user9', coveyTownID: town.coveyTownID });
      await apiClient.joinTown({ userName: 'user10', coveyTownID: town.coveyTownID });
      await apiClient.joinTown({ userName: 'user11', coveyTownID: town.coveyTownID });
      await apiClient.joinTown({ userName: 'user12', coveyTownID: town.coveyTownID });
      const joinTownRes = await apiClient.joinTown({ userName: 'user last', coveyTownID: town.coveyTownID });
      lb = await apiClient.leaderboard({ coveyTownID: town.coveyTownID });
      if (joinTownRes !== undefined) {
        const players = joinTownRes.currentPlayers;
        expect(players.length).toBeGreaterThan(10);
      }
      expect(lb.scores.length).toBe(10);
    });
  });  

  describe('startGameAPI', () => {
    // Should it throw? 
    it('Returns message unable to find town if invalid town ID', async () => {
      const town = await createTownForTesting(undefined, true);
      const p1 = await apiClient.joinTown({ userName: 'user', coveyTownID: town.coveyTownID });
      const res = await apiClient.startGame({ coveyTownID: nanoid(), playerID: p1.coveyUserID });
      expect(res.gameStatus).toBe('Unable to find town');
    });
    it('Waits for player 2 if player 1 is joining', async () => {
      const town = await createTownForTesting(undefined, true);
      const p1 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p1' });
      const start = await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p1.coveyUserID });
      expect(start.gameStatus).toBe('Waiting for player2');
    });
    it('Starts game if player 2 is joining', async () => {
      const town = await createTownForTesting(undefined, true);
      const p1 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p1' });
      const p2 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p2' });
      const start = await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p1.coveyUserID });
      expect(start.gameStatus).toBe('Waiting for player2');
      const start2 = await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p2.coveyUserID });
      expect(start2.gameStatus).toBe(`X:${p1.coveyUserID}, Y: ${p2.coveyUserID}`);
    });
  }); 

  describe('isgameActiveAPI', () => {
    // should inactive throw?
    it('Game is inactive (throws) if game has not started or if only one player has joined', async () => {
      const town = await createTownForTesting(undefined, true);
      await expect(apiClient.isgameActive({ coveyTownID: town.coveyTownID })).rejects.toThrow(); 
      const p1 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p1' });
      await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p1.coveyUserID });
      await expect(apiClient.isgameActive({ coveyTownID: town.coveyTownID })).rejects.toThrow(); 
    });
    it('Game is active if both players have joined', async () => {
      const town = await createTownForTesting(undefined, true);
      const p1 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p1' });
      const p2 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p2' });
      await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p1.coveyUserID });
      await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p2.coveyUserID });
      await apiClient.isgameActive({ coveyTownID: town.coveyTownID });
    });
    it('Game becomes inactive (throws) right after a game has ended', async () => {      
      const town = await createTownForTesting(undefined, true);
      const p1 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p1' });
      const p2 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p2' });
      await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p1.coveyUserID });
      await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p2.coveyUserID });

      // should resolve when game is active
      await apiClient.isgameActive({ coveyTownID: town.coveyTownID });

      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: p1.coveyUserID, x: '0', y: '0' });
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: p2.coveyUserID, x: '1', y: '0' });
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: p1.coveyUserID, x: '2', y: '2' });
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: p2.coveyUserID, x: '1', y: '2' });

      // should resolve when game is active
      await apiClient.isgameActive({ coveyTownID: town.coveyTownID });

      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: p1.coveyUserID, x: '1', y: '1' });

      // game should now be inactive - so this should throw
      await expect(apiClient.isgameActive({ coveyTownID: town.coveyTownID })).rejects.toThrow(); 
    });
  }); 

  describe('currentPlayerAPI', () => {
    let town: TestTownData;
    let p1: TownJoinResponse;
    let p2: TownJoinResponse;

    beforeEach(async ( ) => {
      town = await createTownForTesting(undefined, true);
      p1 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p1' });
      p2 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p2' });
      await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p1.coveyUserID });
      await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p2.coveyUserID });
    });
    it('Gets the current player', async () => {
      let curplayer = await apiClient.currentPlayer({ coveyTownID: town.coveyTownID });
      expect(curplayer.player).toBe(p1.coveyUserID);
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: curplayer.player, x: '0', y: '0' });
      curplayer = await apiClient.currentPlayer({ coveyTownID: town.coveyTownID });
      expect(curplayer.player).toBe(p2.coveyUserID);
    });
    it('Throws if there are no players yet', async () => {
      // players are in the room but haven't joined the game
      town = await createTownForTesting(undefined, true);
      p1 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p1' });
      p2 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p2' });

      // should throw since there are no users playing the game
      await expect(apiClient.currentPlayer({ coveyTownID: town.coveyTownID })).rejects.toThrow();
    });
  }); 

  describe('getWinnerAPI', () => {
    let town: TestTownData;
    let p1: TownJoinResponse;
    let p2: TownJoinResponse;

    beforeEach(async ( ) => {
      town = await createTownForTesting(undefined, true);
      p1 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p1' });
      p2 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p2' });
      await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p1.coveyUserID });
      await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p2.coveyUserID });
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: p1.coveyUserID, x: '0', y: '0' });
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: p2.coveyUserID, x: '1', y: '0' });
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: p1.coveyUserID, x: '2', y: '2' });
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: p2.coveyUserID, x: '1', y: '2' });
    });
    it('Throws an error if the town does not exist', async () => {
      await expect(apiClient.getWinner({ coveyTownID: nanoid() })).rejects.toThrow();
    });
    it('Throws an error if there is no winner yet', async () => {
      await expect(apiClient.getWinner({ coveyTownID: town.coveyTownID })).rejects.toThrow();
    });
    it('Returns the winner of a game', async () => {
      await expect(apiClient.getWinner({ coveyTownID: town.coveyTownID })).rejects.toThrow();
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: p1.coveyUserID, x: '1', y: '1' });

      const winner = await apiClient.getWinner({ coveyTownID: town.coveyTownID });
      expect(winner.player).toBe(p1.coveyUserID);
    });
  }); 

  describe('getBoardAPI', () => {
    let town: TestTownData;
    let p1: TownJoinResponse;
    let p2: TownJoinResponse;

    beforeEach(async ( ) => {
      town = await createTownForTesting(undefined, true);
      p1 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p1' });
      p2 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p2' });
      await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p1.coveyUserID });
      await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p2.coveyUserID });
    });
    it('Shows the updated board', async () => {
      const initBoard = await apiClient.getBoard({ coveyTownID: town.coveyTownID });
      for (let i = 0; i < 3; i += 1) {
        for (let j = 0; j < 3; j += 1) {
          expect(initBoard.board[i][j]).toBe(0);
        }
      }
      let currPlayer = await apiClient.currentPlayer({ coveyTownID: town.coveyTownID });
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: currPlayer.player, x: '1', y: '1' });
      let board = await apiClient.getBoard({ coveyTownID: town.coveyTownID });
      expect(board.board[1][1]).toBe(1);

      currPlayer = await apiClient.currentPlayer({ coveyTownID: town.coveyTownID });
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: currPlayer.player, x: '1', y: '2' });
      board = await apiClient.getBoard({ coveyTownID: town.coveyTownID });
      expect(board.board[1][2]).toBe(2);
    });
    it('Throws if the room is not found (invalid ID)', async () => {
      await expect(apiClient.getBoard({ coveyTownID: nanoid() })).rejects.toThrow();
    });
  }); 

  describe('makeMoveAPI', () => {
    let town: TestTownData;
    let p1: TownJoinResponse;
    let p2: TownJoinResponse;

    beforeEach(async ( ) => {
      town = await createTownForTesting(undefined, true);
      p1 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p1' });
      p2 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p2' });
      await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p1.coveyUserID });
      await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p2.coveyUserID });
    });
    it('Makes a move for a player', async () => {
      let curplayer = await apiClient.currentPlayer({ coveyTownID: town.coveyTownID });
      let board = await apiClient.getBoard({ coveyTownID: town.coveyTownID });
      let x = 0;
      let y = 0;
      expect(board.board[x][y]).toBe(0);
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: curplayer.player, x: String(x), y: String(y) });

      board = await apiClient.getBoard({ coveyTownID: town.coveyTownID });
      expect(board.board[x][y]).toBe(1);

      curplayer = await apiClient.currentPlayer({ coveyTownID: town.coveyTownID });
      x = 2;
      y = 1;
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: curplayer.player, x: String(x), y: String(y) });

      board = await apiClient.getBoard({ coveyTownID: town.coveyTownID });
      expect(board.board[x][y]).toBe(2);
    });
    it('Throws error if the selected spot is already filled', async () => {
      const curplayer = await apiClient.currentPlayer({ coveyTownID: town.coveyTownID });
      let board = await apiClient.getBoard({ coveyTownID: town.coveyTownID });
      const x = 0;
      const y = 0;
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: curplayer.player, x: String(x), y: String(y) });

      board = await apiClient.getBoard({ coveyTownID: town.coveyTownID });
      expect(board.board[0][0]).toBe(1);
      await expect(apiClient.makeMove({ coveyTownID: town.coveyTownID, player: curplayer.player, x: String(x), y: String(y) })).rejects.toThrow();
    });
  }); 

  describe('endGameAPI', () => {
    let town: TestTownData;
    let p1: TownJoinResponse;
    let p2: TownJoinResponse;

    beforeEach(async () => {
      town = await createTownForTesting(undefined, true);
      p1 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p1' });
      p2 = await apiClient.joinTown({ coveyTownID: town.coveyTownID, userName: 'p2' });
      await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p1.coveyUserID });
      await apiClient.startGame({ coveyTownID: town.coveyTownID, playerID: p2.coveyUserID });
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: p1.coveyUserID, x: '0', y: '0' });
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: p2.coveyUserID, x: '1', y: '0' });
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: p1.coveyUserID, x: '2', y: '2' });
      await apiClient.makeMove({ coveyTownID: town.coveyTownID, player: p2.coveyUserID, x: '1', y: '2' });
    });
    it('Sets the game as inactive', async () => {
      // should resolve
      await apiClient.isgameActive({ coveyTownID: town.coveyTownID });

      await apiClient.endGame({ coveyTownID: town.coveyTownID });
      await expect(apiClient.isgameActive({ coveyTownID: town.coveyTownID })).rejects.toThrow();
    });
    it('Refreshes current player (there should now be none)', async () => {
      // should resolve
      await apiClient.currentPlayer({ coveyTownID: town.coveyTownID });

      await apiClient.endGame({ coveyTownID: town.coveyTownID });
      await expect(apiClient.currentPlayer({ coveyTownID: town.coveyTownID })).rejects.toThrow();
    });
    it('Throws if the room is not found', async () => {
      await expect(apiClient.endGame({ coveyTownID: nanoid() })).rejects.toThrow();
    });
  }); 
});
