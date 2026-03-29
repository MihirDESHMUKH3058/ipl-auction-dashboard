import { create } from 'zustand';
import { DEFAULT_AUCTION_TIMER } from '../lib/auctionData';

export const useAuctionStore = create((set, get) => ({
  currentPlayer: null,
  bids: [],
  timer: DEFAULT_AUCTION_TIMER,
  status: 'idle', // idle, active, sold, unsold, expired
  
  setCurrentPlayer: (player) => {
    set({ 
      currentPlayer: player, 
      status: player ? 'preview' : 'idle', 
      bids: [],
      timer: DEFAULT_AUCTION_TIMER
    });
  },
  
  addBid: (bid) => set((state) => ({ 
    bids: [bid, ...state.bids],
    timer: state.timer
  })),

  handleSold: async (playerStore, teamStore) => {
    const { currentPlayer, bids } = get();
    if (!currentPlayer || bids.length === 0) return;

    const winningBid = bids[0];
    const data = {
      id: currentPlayer.id,
      team_id: winningBid.team_id,
      team_name: winningBid.team_name,
      sale_price: winningBid.amount
    };

    const { socketClient } = await import('../lib/socketClient');
    socketClient.manualSold(data);
  },

  handleUnsold: async (playerStore) => {
    const { currentPlayer } = get();
    if (!currentPlayer) return;

    const { socketClient } = await import('../lib/socketClient');
    socketClient.manualUnsold(currentPlayer.id);
  },

  manualBid: async (amountCr) => {
    const { currentPlayer } = get();
    if (!currentPlayer || !amountCr || isNaN(parseFloat(amountCr))) return;

    const amount = parseFloat(amountCr) * 10000000;
    const { socketClient } = await import('../lib/socketClient');
    socketClient.placeBid(currentPlayer.id, amount, 'ADMIN OVERRIDE', 'admin', 'absolute');
  },


  updateLocalTimer: (time) => set({ timer: time }),

  startTimer: async (time) => {
    const { socketClient } = await import('../lib/socketClient');
    socketClient.startTimer(time);
  },
  pauseTimer: async () => {
    const { socketClient } = await import('../lib/socketClient');
    socketClient.pauseTimer();
  },
  resetTimer: async (time = DEFAULT_AUCTION_TIMER) => {
    const { socketClient } = await import('../lib/socketClient');
    socketClient.resetTimer(time);
  },
  setStatus: (status) => set({ status: status === 'time_expired' ? 'expired' : status }),
  
  markSold: (playerStore, teamStore, data) => {
    const { id, team_name, sale_price } = data;
    playerStore.updatePlayerStatus(id, 'sold', team_name, sale_price);
    if (teamStore?.fetchTeams) {
      teamStore.fetchTeams();
    }
    set((state) => ({
      status: 'sold',
      currentPlayer: state.currentPlayer
        ? {
            ...state.currentPlayer,
            status: 'sold',
            team_name,
            sale_price
          }
        : state.currentPlayer
    }));
  },

  markUnsold: (playerStore, data) => {
    const { id } = data;
    playerStore.updatePlayerStatus(id, 'unsold');
    set((state) => ({
      status: 'unsold',
      currentPlayer: state.currentPlayer
        ? {
            ...state.currentPlayer,
            status: 'unsold',
            team_name: null,
            sale_price: null
          }
        : state.currentPlayer
    }));
  },

  setAuctionState: (state) => {
    const { status, currentPlayer, currentBid, currentTimer, highestBidder } = state;
    set({
      status: status === 'time_expired' ? 'expired' : (status || 'idle'),
      currentPlayer: currentPlayer || null,
      bids: highestBidder ? [{
        amount: currentBid,
        team_id: highestBidder.id,
        team_name: highestBidder.name
      }] : [],
      timer: Number.isFinite(currentTimer) ? currentTimer : DEFAULT_AUCTION_TIMER
    });
  },

  reset: () => set({ currentPlayer: null, bids: [], timer: DEFAULT_AUCTION_TIMER, status: 'idle' })
}));

