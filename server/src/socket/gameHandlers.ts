import { Server, Socket } from 'socket.io';
import { GameBoardManager } from '../game/GameBoardManager';
import {
  Coordinates,
  GameEvent,
  CellState,
  Orientation,
  SHIP_CONFIGS,
} from '../types/game';

export function setupGameHandlers(
  io: Server, // For the future if I think for something interesting
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
        // When game is over, send the complete board with all ships revealed
        const completeBoard = finalState.board.map((row) => [...row]);

        // Reveal all remaining ships
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

  socket.on('disconnect', () => {
    cleanupGame(socket.id);
  });
}
