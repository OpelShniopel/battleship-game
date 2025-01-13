import GameBoard from './components/GameBoard';
import { SocketProvider } from './context/SocketContext';
import { Swords } from 'lucide-react';

function App() {
  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center">
              <Swords className="mr-3 h-8 w-8 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Battleship Game</h1>
            </div>
          </header>

          <main className="mx-auto max-w-2xl">
            <div className="overflow-hidden rounded-xl bg-gray-800 p-6 shadow-xl ring-1 ring-gray-700">
              <GameBoard />
            </div>
          </main>

          <footer className="mt-8 text-center text-sm text-gray-500">
            <p>© 2025 Battleship Game • Created by Dovydas :)</p>
          </footer>
        </div>
      </div>
    </SocketProvider>
  );
}

export default App;
