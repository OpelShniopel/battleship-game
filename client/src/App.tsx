import GameBoard from './components/GameBoard';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-8 text-center text-4xl font-bold text-gray-800">
            Battleship Game
          </h1>
          <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-lg">
            <GameBoard />
          </div>
        </div>
      </div>
    </SocketProvider>
  );
}

export default App;
