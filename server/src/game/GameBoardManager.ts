import {
  Board,
  BOARD_SIZE,
  CellState,
  Coordinates,
  GameState,
  INITIAL_SHOTS,
  Orientation,
  SHIP_CONFIGS,
  ShipPosition,
  ShipType,
  ShotResult,
} from '../types/game.js';

/**
 * Manages the game board state and game logic for a Battleship game.
 * Key responsibilities:
 * - Board initialization and ship placement
 * - Shot processing and hit detection
 * - Game state management
 */
export class GameBoardManager {
  private readonly state: GameState;

  constructor(gameId: string) {
    this.state = this.initializeGame(gameId);
  }

  private initializeGame(gameId: string): GameState {
    const board = this.createEmptyBoard();
    const ships = this.placeAllShips(board);

    return {
      gameId,
      board,
      ships,
      remainingShots: INITIAL_SHOTS,
      shotsFired: [],
      isGameOver: false,
      hasWon: false,
    };
  }

  private createEmptyBoard(): Board {
    return Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(CellState.EMPTY));
  }

  /**
   * Places ships on the board following these rules:
   * - Ships cannot overlap
   * - Ships must maintain 1 cell distance from each other (including diagonally)
   * - Ships must be placed entirely within board boundaries
   * - Ships are placed in random valid positions
   */
  private placeAllShips(board: Board): ShipPosition[] {
    const ships: ShipPosition[] = [];

    Object.entries(SHIP_CONFIGS).forEach(([type, config]) => {
      const shipType = type as ShipType;
      // Place multiple ships of the same type
      for (let i = 0; i < config.count; i++) {
        let placed = false;
        while (!placed) {
          const position = this.generateRandomPosition(shipType);
          if (this.canPlaceShip(board, position)) {
            this.placeShip(board, position);
            ships.push({ ...position, hits: 0 });
            placed = true;
          }
        }
      }
    });

    return ships;
  }

  private generateRandomPosition(type: ShipType): ShipPosition {
    const size = SHIP_CONFIGS[type].size;
    const orientation =
      Math.random() < 0.5 ? Orientation.HORIZONTAL : Orientation.VERTICAL;
    const maxX =
      orientation === Orientation.HORIZONTAL
        ? BOARD_SIZE - size
        : BOARD_SIZE - 1;
    const maxY =
      orientation === Orientation.VERTICAL ? BOARD_SIZE - size : BOARD_SIZE - 1;

    return {
      type,
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY),
      orientation,
      hits: 0,
    };
  }

  private isWithinBoundaries(
    x: number,
    y: number,
    orientation: Orientation,
    size: number
  ): boolean {
    return !(
      x < 0 ||
      y < 0 ||
      (orientation === Orientation.HORIZONTAL && x + size > BOARD_SIZE) ||
      (orientation === Orientation.VERTICAL && y + size > BOARD_SIZE)
    );
  }

  /**
   * Checks if a ship can be placed at the given position by:
   * 1. Verifying the ship stays within board boundaries
   * 2. Ensuring no overlap with existing ships
   * 3. Maintaining minimum spacing between ships (1 cell buffer)
   */
  private canPlaceShip(board: Board, position: ShipPosition): boolean {
    const { x, y, orientation, type } = position;
    const size = SHIP_CONFIGS[type].size;

    if (!this.isWithinBoundaries(x, y, orientation, size)) {
      return false;
    }

    // Check a 3x(size+2) or (size+2)x3 area around the ship
    // This ensures ships don't touch even diagonally
    for (let i = -1; i <= size; i++) {
      for (let j = -1; j <= 1; j++) {
        const checkX = orientation === Orientation.HORIZONTAL ? x + i : x + j;
        const checkY = orientation === Orientation.VERTICAL ? y + i : y + j;

        if (
          checkX >= 0 &&
          checkX < BOARD_SIZE &&
          checkY >= 0 &&
          checkY < BOARD_SIZE &&
          board[checkY][checkX] === CellState.SHIP
        ) {
          return false;
        }
      }
    }

    return true;
  }

  private placeShip(board: Board, position: ShipPosition): void {
    const { x, y, orientation, type } = position;
    const size = SHIP_CONFIGS[type].size;

    for (let i = 0; i < size; i++) {
      if (orientation === Orientation.HORIZONTAL) {
        board[y][x + i] = CellState.SHIP;
      } else {
        board[y + i][x] = CellState.SHIP;
      }
    }
  }

  /**
   * Processes a shot at given coordinates:
   * 1. Validates the shot (within bounds, game not over, cell not previously shot)
   * 2. Updates the board state (HIT or MISS)
   * 3. Updates ship hit counts and checks for sunk ships
   * 4. Updates remaining shots and checks game over conditions
   */
  public processShot(coordinates: Coordinates): ShotResult {
    const { x, y } = coordinates;

    // Validate shot
    if (
      x < 0 ||
      x >= BOARD_SIZE ||
      y < 0 ||
      y >= BOARD_SIZE ||
      this.state.isGameOver ||
      this.state.shotsFired.some((shot) => shot.x === x && shot.y === y)
    ) {
      throw new Error('Invalid shot');
    }

    this.state.shotsFired.push(coordinates);

    let cellState: CellState;
    let shipSunk: ShipType | undefined;

    // Process hit or miss
    if (this.state.board[y][x] === CellState.SHIP) {
      cellState = CellState.HIT;
      this.state.board[y][x] = CellState.HIT;

      // Update ship hits and check if sunk
      const hitShip = this.updateShipHits(coordinates);
      if (hitShip && this.isShipSunk(hitShip)) {
        shipSunk = hitShip.type;
      }
    } else {
      cellState = CellState.MISS;
      this.state.board[y][x] = CellState.MISS;
      this.state.remainingShots--;
    }

    this.checkGameOver();

    return {
      coordinates,
      cellState,
      shipSunk,
      gameOver: this.state.isGameOver,
      remainingShots: this.state.remainingShots,
    };
  }

  private updateShipHits(coordinates: Coordinates): ShipPosition | null {
    for (const ship of this.state.ships) {
      if (this.isHitOnShip(coordinates, ship)) {
        ship.hits++;
        return ship;
      }
    }
    return null;
  }

  private isHitOnShip(coordinates: Coordinates, ship: ShipPosition): boolean {
    const { x, y } = coordinates;
    const size = SHIP_CONFIGS[ship.type].size;

    if (ship.orientation === Orientation.HORIZONTAL) {
      return y === ship.y && x >= ship.x && x < ship.x + size;
    } else {
      return x === ship.x && y >= ship.y && y < ship.y + size;
    }
  }

  private isShipSunk(ship: ShipPosition): boolean {
    return ship.hits === SHIP_CONFIGS[ship.type].size;
  }

  private checkGameOver(): void {
    const allShipsSunk = this.state.ships.every(
      (ship) => ship.hits === SHIP_CONFIGS[ship.type].size
    );

    const outOfShots = this.state.remainingShots <= 0;

    this.state.isGameOver = allShipsSunk || outOfShots;
    this.state.hasWon = allShipsSunk;
  }

  public getGameState(): GameState {
    return { ...this.state };
  }

  public getClientBoard(): Board {
    return this.state.board.map((row) =>
      row.map((cell) => (cell === CellState.SHIP ? CellState.EMPTY : cell))
    );
  }
}
