import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import GameBoard from '../GameBoard.tsx';
import { SocketContext } from '../../../context/useSocket.ts';
import { CellState, GameState } from '../../../types/game.ts';
import '@testing-library/jest-dom/vitest';

// Mock socket context
const mockSocket = {
  isConnected: true,
  startNewGame: vi.fn(),
  makeShot: vi.fn(),
  gameState: {
    board: Array(10).fill(Array(10).fill(CellState.EMPTY)),
    remainingShots: 25,
    isGameOver: false,
    hasWon: false,
  } as GameState,
  error: null,
};

describe('GameBoard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('handles cell click correctly', async () => {
    const { container } = render(
      <SocketContext.Provider value={mockSocket}>
        <GameBoard />
      </SocketContext.Provider>
    );

    const cell = container.querySelector('.board-cell');
    if (cell) {
      await userEvent.click(cell);
      expect(mockSocket.makeShot).toHaveBeenCalledWith(
        { x: 0, y: 0 },
        expect.any(Function)
      );
    }
  });

  test('shows game over state correctly', () => {
    const gameOverState = {
      ...mockSocket,
      gameState: {
        ...mockSocket.gameState,
        isGameOver: true,
        hasWon: true,
      },
    };

    const { getByText } = render(
      <SocketContext.Provider value={gameOverState}>
        <GameBoard />
      </SocketContext.Provider>
    );

    expect(getByText('Victory!')).toBeInTheDocument();
  });

  test('shows remaining shots counter', () => {
    const { getByText } = render(
      <SocketContext.Provider value={mockSocket}>
        <GameBoard />
      </SocketContext.Provider>
    );

    expect(getByText('25')).toBeInTheDocument();
  });

  test('disables board when game is over', () => {
    const gameOverState = {
      ...mockSocket,
      gameState: {
        ...mockSocket.gameState,
        isGameOver: true,
      },
    };

    const { container } = render(
      <SocketContext.Provider value={gameOverState}>
        <GameBoard />
      </SocketContext.Provider>
    );

    const cells = container.querySelectorAll('.board-cell');
    cells.forEach((cell: Element) => {
      expect(cell).toHaveAttribute('data-disabled', 'true');
    });
  });
});
