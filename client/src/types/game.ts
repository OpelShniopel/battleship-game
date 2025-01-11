export enum CellState {
  EMPTY = 'EMPTY',
  HIT = 'HIT',
  MISS = 'MISS',
}

export enum ShipType {
  CARRIER = 'CARRIER',
  BATTLESHIP = 'BATTLESHIP',
  CRUISER = 'CRUISER',
  SUBMARINE = 'SUBMARINE',
  DESTROYER = 'DESTROYER',
  PATROL = 'PATROL',
}

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
