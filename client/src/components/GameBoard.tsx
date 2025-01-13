import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/useSocket';
import { BOARD_SIZE, CellState, ShipType, ShotResult } from '../types/game';
import {
  Waves,
  Ship,
  Target,
  AlertTriangle,
  Award,
  Crosshair,
} from 'lucide-react';
import SinkNotification from './SinkNotification';
import {
  GameStatusBannerProps,
  LastShot,
  ShotStatsProps,
} from '../types/gameboard';

// Shot statistics component
const ShotStats: React.FC<ShotStatsProps> = ({ remainingShots }) => (
  <div className="mb-6 flex items-center justify-between rounded-lg bg-gray-800 p-4">
    <div className="flex items-center space-x-3">
      <Crosshair className="h-6 w-6 text-blue-400" />
      <div>
        <p className="text-sm font-medium text-gray-400">Shots Remaining</p>
        <p className="text-2xl font-bold text-white">{remainingShots}</p>
      </div>
    </div>
  </div>
);

// Game status banner component
const GameStatusBanner: React.FC<GameStatusBannerProps> = ({
  isGameOver,
  hasWon,
}) => {
  if (!isGameOver) return null;

  return (
    <div
      className={`mb-6 flex items-center justify-between rounded-lg p-4 ${
        hasWon ? 'bg-green-900/50' : 'bg-red-900/50'
      }`}
    >
      <div className="flex items-center space-x-3">
        {hasWon ? (
          <Award className="h-6 w-6 text-green-400" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-red-400" />
        )}
        <p className="text-lg font-bold text-white">
          {hasWon ? 'Victory!' : 'Game Over'}
        </p>
      </div>
    </div>
  );
};

// Game board component
const GameBoard: React.FC = () => {
  const { isConnected, startNewGame, makeShot, gameState, error } = useSocket();
  const [sunkShip, setSunkShip] = useState<ShipType | null>(null);
  const [lastShot, setLastShot] = useState<LastShot | null>(null);

  useEffect(() => {
    if (isConnected) {
      startNewGame();
    }
  }, [isConnected, startNewGame]);

  const handleCellClick = (x: number, y: number) => {
    if (!gameState || gameState.isGameOver) return;

    const cellState = gameState.board[y][x];
    if (cellState === CellState.HIT || cellState === CellState.MISS) return;

    setLastShot({ x, y, timestamp: Date.now() });
    makeShot({ x, y }, (result: ShotResult) => {
      if (result.shipSunk) {
        setSunkShip(result.shipSunk);
        setTimeout(() => setSunkShip(null), 3000);
      }
    });
  };

  const getCellClassName = (state: CellState, x: number, y: number): string => {
    const baseClass =
      'relative w-full aspect-square border border-gray-700 transition-all duration-200 group';
    const isLastShot = lastShot?.x === x && lastShot?.y === y;

    switch (state) {
      case CellState.HIT:
        return `${baseClass} bg-red-900 hover:bg-red-800`;
      case CellState.MISS:
        return `${baseClass} bg-gray-700 hover:bg-gray-600`;
      case CellState.SHIP:
        return `${baseClass} bg-blue-900 hover:bg-blue-800`;
      default:
        return `${baseClass} bg-gray-800 hover:bg-gray-700 cursor-pointer
          ${isLastShot ? 'ring-2 ring-blue-400' : ''}`;
    }
  };

  const getCellContent = (state: CellState) => {
    switch (state) {
      case CellState.HIT:
        return (
          <div className="absolute inset-0 flex items-center justify-center text-red-400">
            <Target className="h-4 w-4" />
          </div>
        );
      case CellState.MISS:
        return (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <Waves className="h-4 w-4" />
          </div>
        );
      case CellState.SHIP:
        return gameState?.isGameOver ? (
          <div className="absolute inset-0 flex items-center justify-center text-blue-400">
            <Ship className="h-4 w-4" />
          </div>
        ) : null;
      default:
        return null;
    }
  };

  if (!isConnected) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg bg-gray-800">
        <div className="text-center">
          <div className="mb-16 animate-spin text-blue-400">
            <Waves className="h-8 w-8" />
          </div>
          <p className="text-gray-400">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg bg-gray-800">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-red-400" />
          <p className="mb-4 text-red-400">{error}</p>
          <button
            onClick={startNewGame}
            className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SinkNotification shipType={sunkShip} onClose={() => setSunkShip(null)} />

      <div className="space-y-6">
        <GameStatusBanner
          isGameOver={gameState?.isGameOver ?? false}
          hasWon={gameState?.hasWon ?? false}
        />

        <div className="flex items-center justify-between">
          <ShotStats remainingShots={gameState?.remainingShots ?? 25} />
          <button
            onClick={startNewGame}
            className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            New Game
          </button>
        </div>

        <div className="grid grid-cols-board gap-1 rounded-lg bg-gray-900 p-4">
          {Array.from({ length: BOARD_SIZE }, (_, row) => (
            <div key={row} className="contents">
              {Array.from({ length: BOARD_SIZE }, (_, col) => {
                const cellState = gameState?.board[row][col] ?? CellState.EMPTY;
                return (
                  <div
                    key={`${row}-${col}`}
                    className={getCellClassName(cellState, col, row)}
                    onClick={() => handleCellClick(col, row)}
                  >
                    {getCellContent(cellState)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-gray-800 p-4 text-sm text-gray-400">
          <h3 className="mb-2 text-center font-bold text-white">How to Play</h3>
          <p className="mb-2">
            Click on cells to fire shots. Find and sink all ships before running
            out of shots!
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>Successful hits don't count against your remaining shots</li>
            <li>You need to sink all ships to win</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
