## How to Run

### Prerequisites
- Node.js
- npm or yarn package manager

### Installation and Setup

1. Clone the repository:
```bash
git clone https://github.com/OpelShniopel/battleship-game.git
cd opelshniopel-battleship-game
```

2. Install dependencies for both client and server:
```bash
# Install client dependencies
cd client
yarn install  # or: npm install

# Install server dependencies
cd ../server
yarn install  # or: npm install
```

### Running the Application

1. Start the server:
```bash
cd server
yarn dev  # or: npm run dev
```
The server will start on port 6969.

2. In a new terminal, start the client:
```bash
cd client
yarn dev  # or: npm run dev
```
The client will start on port 5173. Open http://localhost:5173 in your browser to play the game.

### Connection Limits
For security purposes, the server allows a maximum of 10 concurrent connections from the same IP address. This helps prevent server overload and ensures fair access for all players.

### Game Rules
- You have 25 shots to find and sink all ships
- Successful hits don't count against your remaining shots
- The game ends when either:
    - All ships are sunk (Victory!)
    - You run out of shots (Game Over)
- Ship sizes:
    - Carrier (5 cells) x1
    - Battleship (4 cells) x1
    - Cruiser (3 cells) x1
    - Submarine (3 cells) x1
    - Destroyer (2 cells) x3
    - Patrol Boat (1 cell) x3