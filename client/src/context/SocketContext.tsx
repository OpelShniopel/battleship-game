import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { GameEvent, GameState, Coordinates, ShotResult } from '../types/game';

interface SocketContextType {
  isConnected: boolean;
  startNewGame: () => void;
  makeShot: (coordinates: Coordinates) => void;
  gameState: GameState | null;
  error: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:6969', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('Disconnected from server:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't attempt to reconnect
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
      console.log('Shot result received:', result);
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
    (coordinates: Coordinates) => {
      if (socket && gameState && !gameState.isGameOver) {
        console.log('Sending shot:', coordinates);
        socket.emit(GameEvent.SHOT, coordinates);
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

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
