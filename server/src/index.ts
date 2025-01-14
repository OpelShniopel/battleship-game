import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupGameHandlers } from './socket/gameHandlers';

const app = express();
const httpServer = createServer(app);

// Socket.IO configuration
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      /^http:\/\/192\.168\.1\.\d+:5173$/, // Matches any IP in 192.168.1.x network
    ],
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 30000,
  maxHttpBufferSize: 1e6, // 1 MB
  transports: ['websocket', 'polling'],
});

const activeGames = new Map();

// Track client connections with timestamps
const clientConnections = new Map<
  string,
  {
    timestamp: number;
    ip: string;
  }
>();

setInterval(() => {
  const now = Date.now();
  for (const [socketId, data] of clientConnections.entries()) {
    // Removes connection data if it's older than 1 hour
    if (now - data.timestamp > 3600000) {
      clientConnections.delete(socketId);
    }
  }
}, 300000); // Clean up every 5 minutes

io.use((socket, next) => {
  const clientIp = socket.handshake.address;
  const now = Date.now();

  // Count active connections from this IP
  let activeConnectionsFromIp = 0;
  for (const data of clientConnections.values()) {
    if (data.ip === clientIp) {
      activeConnectionsFromIp++;
    }
  }

  // Only 10 connections allowed from the same IP
  if (activeConnectionsFromIp >= 10) {
    return next(new Error('Too many connections from this IP'));
  }

  clientConnections.set(socket.id, {
    timestamp: now,
    ip: clientIp,
  });

  next();
});

io.on('connection', (socket) => {
  try {
    console.log(`Client connected: ${socket.id}`);

    socket.on('error', (error) => {
      console.error(`Socket ${socket.id} error:`, error);
    });

    setupGameHandlers(socket, activeGames);

    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
      clientConnections.delete(socket.id);
      activeGames.delete(socket.id);
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
