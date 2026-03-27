import { create } from 'zustand';

export const useAuctionStore = create((set) => ({
  currentPlayer: null,
  bids: [],
  timer: 0,
  status: 'idle', // idle, active, paused, sold, unsold
  
  setCurrentPlayer: (player) => set({ currentPlayer: player, status: 'active', bids: [] }),
  addBid: (bid) => set((state) => ({ bids: [bid, ...state.bids] })),
  setTimer: (time) => set({ timer: time }),
  setStatus: (status) => set({ status }),
  reset: () => set({ currentPlayer: null, bids: [], timer: 0, status: 'idle' })
}));
