import { create } from 'zustand';

export const useAuctionStore = create((set, get) => ({
  currentPlayer: null,
  bids: [],
  timer: 300,
  status: 'idle', // idle, active, sold, unsold, expired
  
  setCurrentPlayer: (player) => {
    set({ 
      currentPlayer: player, 
      status: player ? 'preview' : 'idle', 
      bids: [],
      timer: 300
    });
  },
  
  addBid: (bid) => set((state) => ({ 
    bids: [bid, ...state.bids],
    timer: 300 // Local sync, server will broadcast the official tick
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
    if (!currentPlayer) return;

    const amount = parseFloat(amountCr) * 10000000;
    const { socketClient } = await import('../lib/socketClient');
    socketClient.placeBid(currentPlayer.id, amount, 'ADMIN OVERRIDE', 'admin', 'absolute');
  },

  updateLocalTimer: (time) => set({ timer: time }),

  setTimer: async (time) => {
    const { socketClient } = await import('../lib/socketClient');
    socketClient.setTimer(time);
  },
  setStatus: (status) => set({ status: status === 'time_expired' ? 'expired' : status }),
  
  markSold: (playerStore, teamStore, data) => {
    const { id, team_id, team_name, sale_price } = data;
    playerStore.updatePlayerStatus(id, 'sold', team_name, sale_price);
    // Find team and subtract budget using ID
    if (teamStore && teamStore.updateTeamBudget) {
      teamStore.updateTeamBudget(team_id, sale_price, 'N/A');
    }
    set({ status: 'sold' });
  },

  markUnsold: (playerStore, data) => {
    const { id } = data;
    playerStore.updatePlayerStatus(id, 'unsold');
    set({ status: 'unsold' });
  },

  reset: () => set({ currentPlayer: null, bids: [], timer: 300, status: 'idle' })
}));
