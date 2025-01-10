const GameBoard = () => {
  return (
    <div className="grid grid-cols-board gap-1 bg-white p-4">
      {[...Array(10)].map((_, row) =>
        [...Array(10)].map((_, col) => (
          <div key={`${row}-${col}`} className="board-cell">
            {row}, {col}
          </div>
        ))
      )}
    </div>
  );
};

export default GameBoard;
