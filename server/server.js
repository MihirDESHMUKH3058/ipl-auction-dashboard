import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import playerRoutes from './routes/players.js';
import auctionRoutes from './routes/auction.js';
import teamRoutes from './routes/teams.js';
import { SocketService } from './services/socketService.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1/players', playerRoutes);
app.use('/api/v1/auction', auctionRoutes);
app.use('/api/v1/teams', teamRoutes);

// Serving built frontend files
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

// Fallback for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// API health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io initialization
export const socketService = new SocketService(io);

// Socket.io namespaces handled in SocketService

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
