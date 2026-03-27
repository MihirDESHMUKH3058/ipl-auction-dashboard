import { io } from 'socket.io-client';
import { useAuctionStore } from '../store/auctionStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class SocketClient {
  constructor() {
    this.socket = io(`${SOCKET_URL}/auction`, {
      autoConnect: false,
    });

    this.setupListeners();
  }

  connect(token) {
    this.socket.auth = { token };
    this.socket.connect();
  }

  setupListeners() {
    this.socket.on('bid:new', (bid) => {
      useAuctionStore.getState().addBid(bid);
    });

    this.socket.on('timer:tick', ({ seconds }) => {
      useAuctionStore.getState().setTimer(seconds);
    });

    this.socket.on('auction:status', (status) => {
      useAuctionStore.getState().setStatus(status);
    });

    this.socket.on('player:new', (player) => {
      useAuctionStore.getState().setCurrentPlayer(player);
    });
  }

  placeBid(playerId, amount) {
    this.socket.emit('bid:place', { playerId, amount });
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export const socketClient = new SocketClient();
