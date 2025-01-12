export enum CellState {
  EMPTY = 'EMPTY',
  SHIP = 'SHIP',
  HIT = 'HIT',
  MISS = 'MISS',
}

export type ShipType =
  | 'CARRIER'
  | 'BATTLESHIP'
  | 'CRUISER'
  | 'SUBMARINE'
  | 'DESTROYER'
  | 'PATROL';

export interface Coordinates {
  x: number;
  y: number;
}

export interface GameState {
  board: CellState[][];
  remainingShots: number;
  isGameOver: boolean;
  hasWon: boolean;
}

export const BOARD_SIZE = 10;

export enum GameEvent {
  SHOT = 'SHOT',
  GAME_OVER = 'GAME_OVER',
  NEW_GAME = 'NEW_GAME',
  GAME_STATE = 'GAME_STATE',
}

export interface ShotResult {
  coordinates: Coordinates;
  cellState: CellState;
  shipSunk?: ShipType;
  gameOver?: boolean;
  remainingShots: number;
}
