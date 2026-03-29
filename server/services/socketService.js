import { supabase } from './supabaseClient.js';
import { auctionEngine } from './auctionEngine.js';

const DEFAULT_TIMER_SECONDS = 60;

export class SocketService {
  constructor(io) {
    this.io = io;
    this.auctionNamespace = io.of('/auction');
    this.timerInterval = null;
    this.currentTimer = DEFAULT_TIMER_SECONDS;
    this.currentBid = 0;
    this.highestBidder = null;
    this.currentPlayerId = null;
    this.currentPlayer = null;
    this.status = 'idle';
    this.playerLocks = new Set();
    this.setupHandlers();
  }

  setupHandlers() {
    this.auctionNamespace.on('connection', (socket) => {
      console.log(`Socket ${socket.id} connected to /auction`);

      // 1. SYNC INITIAL STATE
      socket.emit('auction:sync', {
        status: this.status,
        currentPlayer: this.currentPlayer,
        currentBid: this.currentBid,
        currentTimer: this.currentTimer,
        highestBidder: this.highestBidder
      });

      // AUCTION CONTROL
      socket.on('auction:start', async (playerData) => {
        const { id, base_price } = playerData;
        this.currentPlayerId = id;
        this.currentBid = Number(base_price) || 0;
        this.highestBidder = null;
        this.status = 'preview';
        this.currentTimer = DEFAULT_TIMER_SECONDS;

        this.currentPlayer = playerData;
        this.broadcastNewPlayer(this.currentPlayer);
        this.broadcastStatus(this.status);
        this.broadcastTimer(this.currentTimer);
        
        try {
          const { data: dbPlayer, error } = await supabase
            .from('players')
            .select('*')
            .eq('id', id)
            .single();

          if (!error && dbPlayer) {
            this.currentPlayer = dbPlayer;
          }
        } catch (err) {
          console.error("Error in background player fetch:", err);
        }
      });




      socket.on('auction:begin_bidding', () => {
        this.startAuctionTimer(DEFAULT_TIMER_SECONDS);
      });

      socket.on('auction:manual-sold', async (data) => {
        await this.finalizeSold(data);
      });

      socket.on('auction:manual-unsold', async (data) => {
        await this.finalizeUnsold(data.id);
      });

      // BIDDING
      socket.on('bid:place', (data) => {
        const { playerId, amount, teamName, teamId, type } = data;
        
        let newAmount;
        const baseAmount = Number(amount) || 0;
        const currentTotal = Number(this.currentBid) || 0;

        if (type === 'absolute') {
          newAmount = baseAmount;
        } else {
          // Increment logic: Current + 25 Lakhs (0.25 Cr)
          newAmount = (currentTotal || baseAmount || 0) + 2500000; 
        }
        
        const bid = {
          id: Date.now(),
          playerId,
          amount: Number(newAmount),
          team_id: teamId,
          team_name: teamName || 'Anonymous Team',
          timestamp: new Date().toISOString()
        };

        this.currentBid = Number(newAmount);
        this.highestBidder = { id: teamId, name: teamName };
        this.broadcastBid(bid);

        
        // Timer Extension Logic: If bid is placed in last 10s, extend to 10s
        if (this.currentTimer < 10) {
          this.currentTimer = 10;
          this.broadcastTimer(this.currentTimer);
        }
      });

      // PLAYER MANAGEMENT (ADMIN ONLY)
      socket.on('admin:player-add', async (player) => {
        try {
          const { data, error } = await supabase.from('players').insert([player]).select();
          if (error) console.error("Player add error:", error);
          if (!error && data) {
            this.broadcastRefresh();
          }
        } catch (err) { console.error("Error adding player:", err); }
      });

      socket.on('admin:player-update', async ({ id, updates }) => {
        try {
          const { error } = await supabase.from('players').update(updates).eq('id', id);
          if (error) console.error("Player update error:", error);
          if (!error) {
            this.broadcastRefresh();
          }
        } catch (err) { console.error("Error updating player:", err); }
      });

      socket.on('admin:player-delete', async (id) => {
        try {
          const { error } = await supabase.from('players').delete().eq('id', id);
          if (error) console.error("Player delete error:", error);
          if (!error) {
            this.broadcastRefresh();
          }
        } catch (err) { console.error("Error deleting player:", err); }
      });

      socket.on('admin:bag-generate', async (params) => {
        const count = typeof params === 'object' ? params.count || 10 : (params || 10);
        const tier = typeof params === 'object' ? params.tier : null;

        const { data: players, error: fetchError } = await supabase
          .from('players')
          .select('*')
          .neq('status', 'sold');

        if (fetchError) {
          console.error('Bag generation fetch error:', fetchError);
          return;
        }

        const eligiblePlayers = (players || []).filter((player) => {
          const numericRating = Number.parseInt(player.rating, 10);
          if (!tier) return String(player.id) !== String(this.currentPlayerId);
          if (!Number.isFinite(numericRating)) return false;
          if (tier === '80+') return numericRating >= 80;
          if (tier === '70-79') return numericRating >= 70 && numericRating <= 79;
          if (tier === '60-69') return numericRating >= 60 && numericRating <= 69;
          return true;
        });

        const shuffled = eligiblePlayers
          .sort(() => Math.random() - 0.5)
          .slice(0, count);

        const selectedIds = shuffled.map((player) => player.id);
        const hiddenIds = (players || [])
          .filter((player) => String(player.id) !== String(this.currentPlayerId))
          .map((player) => player.id);

        if (hiddenIds.length > 0) {
          const { error: hideError } = await supabase
            .from('players')
            .update({ status: 'hidden' })
            .in('id', hiddenIds);

          if (hideError) {
            console.error('Bag hide error:', hideError);
            return;
          }
        }

        if (selectedIds.length > 0) {
          const { error: updateError } = await supabase
            .from('players')
            .update({ status: 'available' })
            .in('id', selectedIds);

          if (updateError) {
            console.error('Bag update error:', updateError);
            return;
          }
        }

        this.broadcastRefresh();
      });

      socket.on('admin:reset-session', async () => {
        try {
          await auctionEngine.resetSession();
          this.clearAuctionState();
          this.broadcastRefresh();
          this.broadcastStatus('idle');
        } catch (err) {
          console.error("Failed to reset session:", err);
        }
      });

      socket.on('admin:recalculate-session', async () => {
        try {
          await auctionEngine.recalculateTeamBudgets();
          this.broadcastRefresh();
        } catch (err) {
          console.error('Failed to recalculate session:', err);
        }
      });

      socket.on('auction:set-timer', (seconds) => {
        this.startAuctionTimer(seconds);
      });

      socket.on('auction:pause-timer', () => {
        if (this.timerInterval) {
           clearInterval(this.timerInterval);
           this.timerInterval = null;
           this.broadcastStatus('paused');
        }
      });

      socket.on('auction:reset-timer', (seconds) => {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
        this.currentTimer = Number(seconds) > 0 ? Number(seconds) : DEFAULT_TIMER_SECONDS;
        this.broadcastTimer(this.currentTimer);
        this.broadcastStatus(this.currentPlayerId ? 'preview' : 'idle');
      });

      socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`);
      });
    });
  }

  async finalizeSold(data) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    const { id, team_id, team_name, sale_price } = data;
    if (this.playerLocks.has(id)) return;
    this.playerLocks.add(id);
    
    try {
      const record = await auctionEngine.markSold(id, team_id, team_name, sale_price);

      this.broadcastSold({
        id,
        team_id,
        team_name: record.team_name || team_name,
        sale_price: record.sale_price || sale_price
      });
      this.broadcastRefresh();
      
      console.log(`Player ${id} sold to ${team_name} for ${sale_price}`);
    } catch (err) {
      console.error("Error finalizing sold:", err);
    } finally {
      this.playerLocks.delete(id);
    }
    
    this.clearAuctionState();
  }

  async finalizeUnsold(id) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.playerLocks.has(id)) return;
    this.playerLocks.add(id);
    
    try {
      await auctionEngine.markUnsold(id);
      
      this.broadcastUnsold({ id });
      this.broadcastRefresh();
      
      console.log(`Player ${id} marked as unsold`);
    } catch (err) {
      console.error("Error finalizing unsold:", err);
    } finally {
      this.playerLocks.delete(id);
    }
    
    this.clearAuctionState();
  }

  startAuctionTimer(seconds) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.currentTimer = Number(seconds) > 0 ? Number(seconds) : DEFAULT_TIMER_SECONDS;
    this.broadcastStatus('active');
    
    this.timerInterval = setInterval(async () => {
      this.currentTimer--;
      this.broadcastTimer(this.currentTimer);
      
      if (this.currentTimer <= 0) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.broadcastStatus('time_expired');
        
        // AUTO-FINALIZE
        if (this.highestBidder && this.currentPlayerId) {
          console.log(`Timer expired. Auto-finalizing sale for player ${this.currentPlayerId}`);
          await this.finalizeSold({
            id: this.currentPlayerId,
            team_id: this.highestBidder.id,
            team_name: this.highestBidder.name,
            sale_price: this.currentBid
          });
        } else if (this.currentPlayerId) {
          console.log(`Timer expired. No bids for player ${this.currentPlayerId}. Marking as unsold.`);
          await this.finalizeUnsold(this.currentPlayerId);
        }
      }
    }, 1000);
  }

  broadcastNewPlayer(player) {
    this.auctionNamespace.emit('player:new', player);
  }

  broadcastBid(bid) {
    this.auctionNamespace.emit('bid:new', bid);
  }

  broadcastStatus(status) {
    this.status = status;
    this.auctionNamespace.emit('auction:status', status);
  }

  broadcastTimer(seconds) {
    this.currentTimer = seconds;
    this.auctionNamespace.emit('timer:tick', { seconds });
  }

  broadcastSold(data) {
    this.status = 'sold';
    this.auctionNamespace.emit('player:sold', data);
  }

  broadcastUnsold(data) {
    this.status = 'unsold';
    this.auctionNamespace.emit('player:unsold', data);
  }

  broadcastRefresh() {
    this.auctionNamespace.emit('system:refresh');
  }

  clearAuctionState() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.currentPlayerId = null;
    this.currentPlayer = null;
    this.currentBid = 0;
    this.currentTimer = DEFAULT_TIMER_SECONDS;
    this.highestBidder = null;
    this.status = 'idle';
    this.auctionNamespace.emit('auction:sync', {
      status: 'idle',
      currentPlayer: null,
      currentBid: 0,
      currentTimer: DEFAULT_TIMER_SECONDS,
      highestBidder: null
    });
  }
}

