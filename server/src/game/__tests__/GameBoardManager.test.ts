import { describe, test, expect, beforeEach } from 'vitest';
import { GameBoardManager } from '../GameBoardManager.js';
import { CellState } from '../../types/game.js';

describe('GameBoardManager', () => {
  let gameBoardManager: GameBoardManager;

  beforeEach(() => {
    gameBoardManager = new GameBoardManager('test-game');
  });

  test('initializes game state correctly', () => {
    const state = gameBoardManager.getGameState();

    expect(state.gameId).toBe('test-game');
    expect(state.remainingShots).toBe(25);
    expect(state.isGameOver).toBe(false);
    expect(state.hasWon).toBe(false);
    expect(state.shotsFired).toHaveLength(0);
    expect(state.board).toHaveLength(10);
    state.board.forEach((row) => {
      expect(row).toHaveLength(10);
    });
  });

  test('ships are placed correctly', () => {
    const state = gameBoardManager.getGameState();
    const shipCells = countShipCells(state.board);

    // Calculate total ship cells based on requirements
    const expectedShipCells =
      5 + // Carrier
      4 + // Battleship
      3 * 2 + // Cruiser and Submarine
      2 * 3 + // Destroyers
      3; // Patrol Boats

    expect(shipCells).toBe(expectedShipCells);
  });

  test('ships maintain minimum distance', () => {
    const state = gameBoardManager.getGameState();
    validateShipSpacing(state.board);
  });

  function validateShipSpacing(board: CellState[][]) {
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        if (board[y][x] === CellState.SHIP) {
          validateSurroundingCells(board, x, y);
        }
      }
    }
  }

  function validateSurroundingCells(
    board: CellState[][],
    x: number,
    y: number
  ) {
    const deltas = getDeltaCoordinates();

    deltas.forEach(({ dx, dy }) => {
      const newCoord = {
        x: x + dx,
        y: y + dy,
      };

      if (
        isValidCoordinate(newCoord, board.length) &&
        isDiagonalDelta(dx, dy)
      ) {
        expect(board[newCoord.y][newCoord.x]).not.toBe(CellState.SHIP);
      }
    });
  }

  function getDeltaCoordinates() {
    const deltas: Array<{ dx: number; dy: number }> = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dy !== 0 || dx !== 0) {
          deltas.push({ dx, dy });
        }
      }
    }
    return deltas;
  }

  function isValidCoordinate(
    coord: { x: number; y: number },
    boardSize: number
  ): boolean {
    return (
      coord.x >= 0 && coord.x < boardSize && coord.y >= 0 && coord.y < boardSize
    );
  }

  function isDiagonalDelta(dx: number, dy: number): boolean {
    return dx !== 0 && dy !== 0;
  }

  test('processes hit correctly', () => {
    const state = gameBoardManager.getGameState();
    let shipCoordinate = findShipCoordinate(state.board);

    if (!shipCoordinate) {
      throw new Error('No ship found on board');
    }

    const result = gameBoardManager.processShot(shipCoordinate);
    expect(result.cellState).toBe(CellState.HIT);
    expect(result.remainingShots).toBe(25); // Shots don't decrease on hits
  });

  test('processes miss correctly', () => {
    const state = gameBoardManager.getGameState();
    let emptyCoordinate = findEmptyCoordinate(state.board);

    if (!emptyCoordinate) {
      throw new Error('No empty cell found on board');
    }

    const result = gameBoardManager.processShot(emptyCoordinate);
    expect(result.cellState).toBe(CellState.MISS);
    expect(result.remainingShots).toBe(24); // Shots decrease on misses
  });

  test('prevents shooting same cell twice', () => {
    const state = gameBoardManager.getGameState();
    const emptyCoordinate = findEmptyCoordinate(state.board);

    if (!emptyCoordinate) {
      throw new Error('No empty cell found on board');
    }

    gameBoardManager.processShot(emptyCoordinate);
    expect(() => {
      gameBoardManager.processShot(emptyCoordinate);
    }).toThrow('Invalid shot');
  });

  // Helper functions
  function countShipCells(board: CellState[][]): number {
    return board.reduce(
      (total, row) =>
        total + row.filter((cell) => cell === CellState.SHIP).length,
      0
    );
  }

  function findShipCoordinate(board: CellState[][]) {
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        if (board[y][x] === CellState.SHIP) {
          return { x, y };
        }
      }
    }
    return null;
  }

  function findEmptyCoordinate(board: CellState[][]) {
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        if (board[y][x] === CellState.EMPTY) {
          return { x, y };
        }
      }
    }
    return null;
  }
});
