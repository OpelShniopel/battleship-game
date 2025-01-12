import { useEffect, useState } from 'react';
import { useSocket } from '../context/useSocket';
import { BOARD_SIZE, CellState, ShipType, ShotResult } from '../types/game';
import SinkNotification from './SinkNotification';

const GameBoard = () => {
  const { isConnected, startNewGame, makeShot, gameState, error } = useSocket();
  const [sunkShip, setSunkShip] = useState<ShipType | null>(null);

  useEffect(() => {
    if (isConnected) {
      startNewGame();
    }
  }, [isConnected, startNewGame]);

  const handleCellClick = (x: number, y: number) => {
    if (!gameState || gameState.isGameOver) {
      console.log('Cell click ignored - game not ready:', { gameState });
      return;
    }

    const cellState = gameState.board[y][x];
    if (cellState === CellState.HIT || cellState === CellState.MISS) {
      console.log('Cell already shot:', { x, y, cellState });
      return;
    }

    console.log('Attempting shot at:', { x, y });
    makeShot({ x, y }, (result: ShotResult) => {
      if (result.shipSunk) {
        setSunkShip(result.shipSunk);
      }
    });
  };

  const getCellClassName = (state: CellState) => {
    const baseClass = 'board-cell';
    switch (state) {
      case CellState.HIT:
        return `${baseClass} hit-cell`;
      case CellState.MISS:
        return `${baseClass} miss-cell`;
      default:
        return baseClass;
    }
  };

  useEffect(() => {
    return () => {
      setSunkShip(null);
    };
  }, []);

  if (!isConnected) {
    return (
      <div className="py-8 text-center">
        <p className="text-lg text-gray-600">Connecting to server...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-lg text-red-600">{error}</p>
        <button
          onClick={startNewGame}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sunkShip && (
        <SinkNotification
          shipType={sunkShip}
          onClose={() => setSunkShip(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="text-lg font-medium">
          {gameState?.isGameOver ? (
            <span
              className={gameState.hasWon ? 'text-green-600' : 'text-red-600'}
            >
              {gameState.hasWon ? 'You Won!' : 'Game Over!'}
            </span>
          ) : (
            <span className="text-blue-600">
              Shots Remaining: {gameState?.remainingShots ?? 25}
            </span>
          )}
        </div>
        <button
          onClick={startNewGame}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          New Game
        </button>
      </div>

      <div className="grid grid-cols-board gap-1 rounded-lg bg-ocean p-4">
        {Array.from({ length: BOARD_SIZE }, (_, row) => (
          <div key={row} className="contents">
            {Array.from({ length: BOARD_SIZE }, (_, col) => {
              const cellState = gameState?.board[row][col] ?? CellState.EMPTY;
              return (
                <div
                  key={`${row}-${col}`}
                  className={getCellClassName(cellState)}
                  onClick={() => handleCellClick(col, row)}
                >
                  {cellState === CellState.HIT && '💥'}
                  {cellState === CellState.MISS && '•'}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-600">
        <p>
          Click on cells to fire shots. Find and sink all ships before running
          out of shots!
        </p>
        <ul className="mt-2 list-inside list-disc">
          <li>Successful hits don't count against your remaining shots</li>
          <li>You need to sink all ships to win</li>
        </ul>
      </div>
    </div>
  );
};

export default GameBoard;
