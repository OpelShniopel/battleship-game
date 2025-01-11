import { Server, Socket } from 'socket.io';
import { GameBoardManager } from '../game/GameBoardManager';
import { Coordinates, GameEvent } from '../types/game';

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
        socket.emit(GameEvent.GAME_OVER, {
          hasWon: finalState.hasWon,
          board: game.getClientBoard(),
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
