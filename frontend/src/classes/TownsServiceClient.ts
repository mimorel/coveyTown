import axios, { AxiosInstance, AxiosResponse } from 'axios';
import assert from 'assert';
import { ServerPlayer } from './Player';

/**
 * The format of a request to join a Town in Covey.Town, as dispatched by the server middleware
 */
export interface TownJoinRequest {
  /** userName of the player that would like to join * */
  userName: string;
  /** ID of the town that the player would like to join * */
  coveyTownID: string;
}

/**
 * The format of a response to join a Town in Covey.Town, as returned by the handler to the server
 * middleware
 */
export interface TownJoinResponse {
  /** Unique ID that represents this player * */
  coveyUserID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  coveySessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: ServerPlayer[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
}

/**
 * Payload sent by client to create a Town in Covey.Town
 */
export interface TownCreateRequest {
  friendlyName: string;
  isPubliclyListed: boolean;
}

/**
 * Response from the server for a Town create request
 */
export interface TownCreateResponse {
  coveyTownID: string;
  coveyTownPassword: string;
}

/**
 * Response from the server for a Town list request
 */
export interface TownListResponse {
  towns: CoveyTownInfo[];
}

/**
 * Payload sent by the client to delete a Town
 */
export interface TownDeleteRequest {
  coveyTownID: string;
  coveyTownPassword: string;
}

export interface StartGameRequest{
  coveyTownID: string;
  playerID: string;
}

export interface StartGameResponse {
  gameStatus: string;
}

export interface InfoRequest{
  coveyTownID: string;
}

export interface PlayerResponse {
  player: string;
}


export interface InfoResponse{
  message: "deleted game";
}

/**
 * Payload sent by the client to update a Town.
 * N.B., JavaScript is terrible, so:
 * if(!isPubliclyListed) -> evaluates to true if the value is false OR undefined, use ===
 */
export interface TownUpdateRequest {
  coveyTownID: string;
  coveyTownPassword: string;
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

export interface LeaderboardRequest {
  coveyTownID: string;
}

export type ScoreList = { userName: string, score: number };

export interface LeaderboardResponse {
  scores: ScoreList[];
}

export interface GetBoardResponse {
  board: number[][];
}

export interface MakeMoveRequest {
  coveyTownID: string;
  player: string;
  x: string;
  y: string;
}

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

export type CoveyTownInfo = {
  friendlyName: string;
  coveyTownID: string;
  currentOccupancy: number;
  maximumOccupancy: number
};

export default class TownsServiceClient {
  private _axios: AxiosInstance;

  /**
   * Construct a new Towns Service API client. Specify a serviceURL for testing, or otherwise
   * defaults to the URL at the environmental variable REACT_APP_ROOMS_SERVICE_URL
   * @param serviceURL
   */
  constructor(serviceURL?: string) {
    const baseURL = serviceURL || process.env.REACT_APP_TOWNS_SERVICE_URL;
    assert(baseURL);
    this._axios = axios.create({ baseURL });
  }

  static unwrapOrThrowError<T>(response: AxiosResponse<ResponseEnvelope<T>>, ignoreResponse = false): T {
    if (response.data.isOK) {
      if (ignoreResponse) {
        return {} as T;
      }
      assert(response.data.response);
      return response.data.response;
    }
    throw new Error(`Error processing request: ${response.data.message}`);
  }

  async createTown(requestData: TownCreateRequest): Promise<TownCreateResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<TownCreateResponse>>('/towns', requestData);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async updateTown(requestData: TownUpdateRequest): Promise<void> {
    const responseWrapper = await this._axios.patch<ResponseEnvelope<void>>(`/towns/${requestData.coveyTownID}`, requestData);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper, true);
  }

  async deleteTown(requestData: TownDeleteRequest): Promise<void> {
    const responseWrapper = await this._axios.delete<ResponseEnvelope<void>>(`/towns/${requestData.coveyTownID}/${requestData.coveyTownPassword}`);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper, true);
  }

  async listTowns(): Promise<TownListResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<TownListResponse>>('/towns');
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async joinTown(requestData: TownJoinRequest): Promise<TownJoinResponse> {
    const responseWrapper = await this._axios.post('/sessions', requestData);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async leaderboard(requestData: LeaderboardRequest): Promise<LeaderboardResponse> {
    const responseWrapper = await this._axios.get(`/leaderboard/${requestData.coveyTownID}`);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async startGame(requestData: StartGameRequest): Promise<StartGameResponse> {
    const responseWrapper = await this._axios.post(`/tictactoe/${requestData.coveyTownID}/${requestData.playerID}`);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async makeMove(requestData: MakeMoveRequest): Promise<GetBoardResponse> {
    const responseWrapper = await this._axios.post(`/tictactoe/${requestData.coveyTownID}/${requestData.player}/move`, requestData);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async endGame(requestData: InfoRequest): Promise<InfoResponse> {
    const responseWrapper = await this._axios.delete(`/tictactoe/${requestData.coveyTownID}`);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async currentPlayer(requestData: InfoRequest): Promise<PlayerResponse> {
    const responseWrapper = await this._axios.get(`/tictactoe/curplayer/${requestData.coveyTownID}`);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }
  
}
