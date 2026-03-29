import { io } from 'socket.io-client';
import { useAuctionStore } from '../store/auctionStore';
import { usePlayerStore } from '../store/playerStore';
import { useTeamStore } from '../store/teamStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class SocketClient {
  constructor() {
    this.socket = io(`${SOCKET_URL}/auction`, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupListeners();
  }

  connect(token) {
    if (!this.socket.connected) {
      if (token) this.socket.auth = { token };
      this.socket.connect();
    }
  }

  isConnected() {
    return this.socket.connected;
  }

  setupListeners() {
    this.socket.on('auction:sync', (state) => {
      useAuctionStore.getState().setAuctionState(state);
    });

    this.socket.on('bid:new', (bid) => {

      useAuctionStore.getState().addBid(bid);
    });

    this.socket.on('timer:tick', ({ seconds }) => {
      useAuctionStore.getState().updateLocalTimer(seconds);
    });

    this.socket.on('auction:status', (status) => {
      useAuctionStore.getState().setStatus(status);
    });

    this.socket.on('player:new', (player) => {
      useAuctionStore.getState().setCurrentPlayer(player);
    });

    this.socket.on('player:sold', (data) => {
      useAuctionStore.getState().markSold(
        usePlayerStore.getState(), 
        useTeamStore.getState(), 
        data
      );
    });

    this.socket.on('player:unsold', (data) => {
      useAuctionStore.getState().markUnsold(
        usePlayerStore.getState(), 
        data
      );
    });

    this.socket.on('system:refresh', () => {
      usePlayerStore.getState().fetchPlayers();
      useTeamStore.getState().fetchTeams();
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason);
    });
  }

  startAuction(player) {
    this.socket.emit('auction:start', player);
  }



  beginBidding() {
    this.socket.emit('auction:begin_bidding');
  }

  placeBid(playerId, amount, teamName, teamId, type = 'increment') {
    this.socket.emit('bid:place', { playerId, amount, teamName, teamId, type });
  }

  // Admin Actions
  addPlayer(player) {
    this.socket.emit('admin:player-add', player);
  }

  updatePlayer(id, updates) {
    this.socket.emit('admin:player-update', { id, updates });
  }

  deletePlayer(id) {
    this.socket.emit('admin:player-delete', id);
  }

  generateBag(count, tier = null) {
    this.socket.emit('admin:bag-generate', { count, tier });
  }

  manualSold(data) {
    this.socket.emit('auction:manual-sold', data);
  }

  manualUnsold(id) {
    this.socket.emit('auction:manual-unsold', { id });
  }

  setTimer(seconds) {
    this.socket.emit('auction:set-timer', seconds);
  }

  pauseTimer() {
    this.socket.emit('auction:pause-timer');
  }

  resetSession() {
    this.socket.emit('admin:reset-session');
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export const socketClient = new SocketClient();
