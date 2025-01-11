export enum CellState {
  EMPTY = 'EMPTY',
  SHIP = 'SHIP',
  HIT = 'HIT',
  MISS = 'MISS',
}

export enum ShipType {
  CARRIER = 'CARRIER', // 5 cells
  BATTLESHIP = 'BATTLESHIP', // 4 cells
  CRUISER = 'CRUISER', // 3 cells
  SUBMARINE = 'SUBMARINE', // 3 cells
  DESTROYER = 'DESTROYER', // 2 cells
  PATROL = 'PATROL', // 1 cell
}

export enum Orientation {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
}

export const SHIP_CONFIGS = {
  [ShipType.CARRIER]: { size: 5, count: 1 },
  [ShipType.BATTLESHIP]: { size: 4, count: 1 },
  [ShipType.CRUISER]: { size: 3, count: 1 },
  [ShipType.SUBMARINE]: { size: 3, count: 1 },
  [ShipType.DESTROYER]: { size: 2, count: 3 },
  [ShipType.PATROL]: { size: 1, count: 3 },
};

export interface ShipPosition {
  type: ShipType;
  x: number;
  y: number;
  orientation: Orientation;
  hits: number;
}

export interface Coordinates {
  x: number;
  y: number;
}

export type Board = CellState[][];

export interface GameState {
  board: Board;
  ships: ShipPosition[];
  remainingShots: number;
  shotsFired: Coordinates[];
  isGameOver: boolean;
  hasWon: boolean;
  gameId: string; // For tracking multiple games
}

export const BOARD_SIZE = 10;
export const INITIAL_SHOTS = 25;

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
