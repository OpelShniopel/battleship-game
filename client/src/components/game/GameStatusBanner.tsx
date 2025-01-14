import { Award, AlertTriangle } from 'lucide-react';
import React from 'react';
import { GameStatusBannerProps } from '../../types/gameboard.ts';

export const GameStatusBanner: React.FC<GameStatusBannerProps> = ({
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
