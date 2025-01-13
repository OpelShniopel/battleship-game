import { Coordinates } from './game';

export interface ShotStatsProps {
  remainingShots: number;
}

export interface GameStatusBannerProps {
  isGameOver: boolean;
  hasWon: boolean;
}

export interface LastShot extends Coordinates {
  timestamp: number;
}
