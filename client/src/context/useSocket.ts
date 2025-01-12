import React, { createContext, useContext } from 'react';
import { GameState, Coordinates, ShotResult } from '../types/game';

interface SocketContextType {
  isConnected: boolean;
  startNewGame: () => void;
  makeShot: (
    coordinates: Coordinates,
    callback?: (result: ShotResult) => void
  ) => void;
  gameState: GameState | null;
  error: string | null;
}

export const SocketContext = createContext<SocketContextType | undefined>(
  undefined
);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export type SocketContextProviderProps = {
  children: React.ReactNode;
};
