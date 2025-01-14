import { Crosshair } from 'lucide-react';
import React from 'react';
import { ShotStatsProps } from '../../types/gameboard.ts';

export const ShotStats: React.FC<ShotStatsProps> = ({ remainingShots }) => (
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
