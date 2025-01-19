import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameEvent, GameState, Coordinates, ShotResult } from '../types/game';
import { SocketContext, SocketContextProviderProps } from './useSocket';

// Get the server URL based on the current environment
const getServerUrl = () => {
  // If we're connecting from localhost, use localhost
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:6969';
  }

  // Otherwise, connect to the server using the same IP as the client
  return `http://${window.location.hostname}:6969`;
};

/**
 * Socket.IO context provider that manages:
 * 1. Server connection and reconnection logic
 * 2. Game state management
 * 3. Real-time communication for game events
 *
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Dynamic server URL based on environment
 * - Comprehensive error handling
 * - Game state synchronization
 */
export const SocketProvider: React.FC<SocketContextProviderProps> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize socket with reconnection settings
    const newSocket = io(getServerUrl(), {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // Socket event handlers for connection management
    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log('Connected to server');
    });

    // Handle various error scenarios
    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('Disconnected from server:', reason);
      if (reason === 'io server disconnect') {
        newSocket.close();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Failed to connect to server. Please try again later.');
    });

    newSocket.on('error', (message: string) => {
      console.error('Socket error:', message);
      setError(message);
    });

    newSocket.on(GameEvent.GAME_STATE, (state: GameState) => {
      setGameState(state);
      setError(null);
    });

    /**
     * Updates game state after each shot
     * - Creates new board state
     * - Updates shot count
     * - Handles game over conditions
     */
    const updateGameStateAfterShot = (
      prevState: GameState | null,
      result: ShotResult
    ) => {
      if (!prevState) return null;

      const newBoard = prevState.board.map((row) => [...row]);
      const { x, y } = result.coordinates;
      newBoard[y][x] = result.cellState;

      return {
        ...prevState,
        board: newBoard,
        remainingShots: result.remainingShots,
        isGameOver: result.gameOver || false,
        hasWon: result.gameOver ? prevState.hasWon : false,
      };
    };

    newSocket.on(GameEvent.SHOT, (result: ShotResult) => {
      setGameState((prevState) => updateGameStateAfterShot(prevState, result));
    });

    newSocket.on(
      GameEvent.GAME_OVER,
      (finalState: { hasWon: boolean; board: GameState['board'] }) => {
        setGameState((prevState) => {
          if (!prevState) return null;
          return {
            ...prevState,
            board: finalState.board,
            isGameOver: true,
            hasWon: finalState.hasWon,
          };
        });
      }
    );

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.removeAllListeners();
        newSocket.close();
      }
    };
  }, []);

  const startNewGame = useCallback(() => {
    if (socket) {
      socket.emit(GameEvent.NEW_GAME);
    }
  }, [socket]);

  const makeShot = useCallback(
    (coordinates: Coordinates, callback?: (result: ShotResult) => void) => {
      if (socket && gameState && !gameState.isGameOver) {
        socket.emit(GameEvent.SHOT, coordinates);

        if (callback) {
          const handleShotResult = (result: ShotResult) => {
            callback(result);
            socket.off(GameEvent.SHOT, handleShotResult);
          };
          socket.on(GameEvent.SHOT, handleShotResult);
        }
      } else {
        console.log('Shot not sent:', {
          socket: !!socket,
          gameState: !!gameState,
        });
      }
    },
    [socket, gameState]
  );

  const value = useMemo(
    () => ({
      isConnected,
      startNewGame,
      makeShot,
      gameState,
      error,
    }),
    [isConnected, startNewGame, makeShot, gameState, error]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
