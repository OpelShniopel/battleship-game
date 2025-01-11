import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupGameHandlers } from './socket/gameHandlers';

const app = express();
const httpServer = createServer(app);

// Socket.IO configuration
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 30000,
  maxHttpBufferSize: 1e6, // 1 MB
  transports: ['websocket', 'polling'],
});

const activeGames = new Map();
const connectedClients = new Set<string>();

httpServer.on('error', (error) => {
  console.error('Server error:', error);
});

// Rate limiting configuration
const connectionThrottle = new Map<string, number>();
const THROTTLE_WINDOW = 60000; // 1 minute
const MAX_CONNECTIONS_PER_WINDOW = 10;

io.use((socket, next) => {
  const clientIp = socket.handshake.address;
  const now = Date.now();
  const lastConnection = connectionThrottle.get(clientIp) ?? 0;

  if (now - lastConnection > THROTTLE_WINDOW) {
    connectionThrottle.set(clientIp, now);
    return next();
  }

  if (connectedClients.size >= MAX_CONNECTIONS_PER_WINDOW) {
    return next(new Error('Too many connections'));
  }

  next();
});

io.on('connection', (socket) => {
  try {
    console.log(`Client connected: ${socket.id}`);
    connectedClients.add(socket.id);
    console.log(`Active connections: ${connectedClients.size}`);

    socket.on('error', (error) => {
      console.error(`Socket ${socket.id} error:`, error);
    });

    setupGameHandlers(io, socket, activeGames);

    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
      connectedClients.delete(socket.id);
      activeGames.delete(socket.id);
      console.log(`Remaining connections: ${connectedClients.size}`);
    });
  } catch (error) {
    console.error('Error in connection handler:', error);
    socket.disconnect(true);
  }
});

const PORT = 6969;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
