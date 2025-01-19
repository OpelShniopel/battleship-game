import { Socket } from 'socket.io';
import { GameBoardManager } from '../game/GameBoardManager.js';
import {
  Coordinates,
  GameEvent,
  CellState,
  Orientation,
  SHIP_CONFIGS,
} from '../types/game.js';

/**
 * Handles game-related socket events:
 * 1. NEW_GAME: Creates new game instance and sends initial state
 * 2. SHOT: Processes player shots and sends results
 * 3. Game Over: Reveals full board and cleans up game instance
 *
 * Key features:
 * - Automatic cleanup of abandoned games
 * - Error handling for invalid shots and game states
 * - Final board reveal showing all ship positions
 */
export function setupGameHandlers(
  socket: Socket,
  activeGames: Map<string, GameBoardManager>
) {
  const cleanupGame = (socketId: string) => {
    const game = activeGames.get(socketId);
    if (game) {
      activeGames.delete(socketId);
      console.log(`Cleaned up game for client: ${socketId}`);
    }
  };

  socket.on(GameEvent.NEW_GAME, () => {
    try {
      cleanupGame(socket.id);

      const game = new GameBoardManager(socket.id);
      activeGames.set(socket.id, game);

      socket.emit(GameEvent.GAME_STATE, {
        board: game.getClientBoard(),
        remainingShots: game.getGameState().remainingShots,
        isGameOver: false,
        hasWon: false,
      });

      console.log(`New game started for client: ${socket.id}`);
    } catch (error) {
      console.error(`Error starting new game: ${error}`);
      socket.emit('error', 'Failed to start new game');
      cleanupGame(socket.id);
    }
  });

  socket.on(GameEvent.SHOT, (coordinates: Coordinates) => {
    try {
      const game = activeGames.get(socket.id);
      if (!game) {
        socket.emit('error', 'No active game found. Please start a new game.');
        return;
      }

      const gameState = game.getGameState();
      if (gameState.isGameOver) {
        socket.emit('error', 'Game is already over. Please start a new game.');
        return;
      }

      const result = game.processShot(coordinates);

      socket.emit(GameEvent.SHOT, result);

      if (result.gameOver) {
        const finalState = game.getGameState();
        // Show all ships on game over
        const completeBoard = finalState.board.map((row) => [...row]);

        // Reveal ships that weren't hit
        finalState.ships.forEach((ship) => {
          const size = SHIP_CONFIGS[ship.type].size;
          for (let i = 0; i < size; i++) {
            const x =
              ship.orientation === Orientation.HORIZONTAL ? ship.x + i : ship.x;
            const y =
              ship.orientation === Orientation.VERTICAL ? ship.y + i : ship.y;
            if (completeBoard[y][x] === CellState.EMPTY) {
              completeBoard[y][x] = CellState.SHIP;
            }
          }
        });

        socket.emit(GameEvent.GAME_OVER, {
          hasWon: finalState.hasWon,
          board: completeBoard,
        });
        cleanupGame(socket.id);
      }
    } catch (error) {
      console.error(`Error processing shot: ${error}`);
      socket.emit('error', 'Invalid shot');
    }
  });
}
