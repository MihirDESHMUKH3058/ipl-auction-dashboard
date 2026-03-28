import { supabase } from './supabaseClient.js';

export class SocketService {
  constructor(io) {
    this.io = io;
    this.auctionNamespace = io.of('/auction');
    this.timerInterval = null;
    this.currentTimer = 300; 
    this.currentBid = 0;
    this.highestBidder = null;
    this.currentPlayerId = null;
    this.setupHandlers();
  }

  setupHandlers() {
    this.auctionNamespace.on('connection', (socket) => {
      console.log(`Socket ${socket.id} connected to /auction`);

      // AUCTION CONTROL
      socket.on('auction:start', async (data) => {
        const { playerId, basePrice } = data;
        this.currentPlayerId = playerId;
        this.currentBid = basePrice || 0;
        this.highestBidder = null;
        
        try {
          const { data: player, error } = await supabase
            .from('players')
            .select('*')
            .eq('id', playerId)
            .single();

          if (error || !player) {
            console.error("Failed to fetch player:", error);
            this.broadcastNewPlayer(data);
          } else {
            this.broadcastNewPlayer(player);
          }
        } catch (err) {
          console.error("Error in auction:start:", err);
          this.broadcastNewPlayer(data);
        }
        
        this.broadcastStatus('preview');
      });

      socket.on('auction:begin_bidding', () => {
        this.startAuctionTimer(60); // 60s as default
      });

      socket.on('auction:manual-sold', async (data) => {
        // data: { id, team_id, team_name, sale_price }
        await this.finalizeSold(data);
      });

      socket.on('auction:manual-unsold', async (data) => {
        // data: { id }
        await this.finalizeUnsold(data.id);
      });

      // BIDDING
      socket.on('bid:place', (data) => {
        const { playerId, amount, teamName, teamId, type } = data;
        
        let newAmount;
        if (type === 'absolute') {
          newAmount = amount;
        } else {
          // Increment logic: Current + 25 Lakhs (0.25 Cr)
          newAmount = (this.currentBid || amount || 0) + 2500000; 
        }
        
        const bid = {
          id: Date.now(),
          playerId,
          amount: newAmount,
          team_id: teamId,
          team_name: teamName || 'Anonymous Team',
          timestamp: new Date().toISOString()
        };

        this.currentBid = newAmount;
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

      socket.on('admin:bag-generate', async (count = 10) => {
        // Select 10 hidden players
        const { data: unsoldPlayers, error: fetchError } = await supabase
          .from('players')
          .select('id')
          .eq('status', 'hidden')
          .limit(count);

        if (!fetchError && unsoldPlayers.length > 0) {
          const ids = unsoldPlayers.map(p => p.id);
          const { error: updateError } = await supabase
            .from('players')
            .update({ status: 'available' })
            .in('id', ids);

          if (!updateError) {
            this.broadcastRefresh();
          }
        }
      });

      socket.on('admin:reset-session', async () => {
        try {
          // Clear all auction results
          const { error } = await supabase.from('players')
            .update({ status: 'hidden', team_name: null, sale_price: null })
            .neq('id', 0); // Safety clause
            
          if (error) console.error("Reset session error:", error);
          this.broadcastRefresh();
          this.broadcastStatus('idle');
        } catch (err) {
          console.error("Failed to reset session:", err);
        }
      });

      socket.on('auction:set-timer', (seconds) => {
        this.startAuctionTimer(seconds);
      });

      socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`);
      });
    });
  }

  async finalizeSold(data) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    const { id, team_id, team_name, sale_price } = data;
    
    try {
      // Update DB
      const { error } = await supabase.from('players')
        .update({ status: 'sold', team_name, sale_price })
        .eq('id', id);

      if (error) console.error("Finalize sold error:", error);

      if (!error) {
        this.broadcastSold(data);
        this.broadcastRefresh();
      }
    } catch (err) {
      console.error("Error finalizing sold:", err);
    }
    
    this.currentPlayerId = null;
    this.highestBidder = null;
  }

  async finalizeUnsold(id) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    try {
      const { error } = await supabase.from('players')
        .update({ status: 'unsold' })
        .eq('id', id);

      if (error) console.error("Finalize unsold error:", error);

      if (!error) {
        this.broadcastUnsold({ id });
        this.broadcastRefresh();
      }
    } catch (err) {
      console.error("Error finalizing unsold:", err);
    }
    
    this.currentPlayerId = null;
    this.highestBidder = null;
  }

  startAuctionTimer(seconds) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.currentTimer = seconds;
    this.broadcastStatus('active');
    
    this.timerInterval = setInterval(async () => {
      this.currentTimer--;
      this.broadcastTimer(this.currentTimer);
      
      if (this.currentTimer <= 0) {
        clearInterval(this.timerInterval);
        this.broadcastStatus('time_expired');
        // We don't auto-finalize here to let admin decide if they want to extend or finalize
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
    this.auctionNamespace.emit('auction:status', status);
  }

  broadcastTimer(seconds) {
    this.auctionNamespace.emit('timer:tick', { seconds });
  }

  broadcastSold(data) {
    this.auctionNamespace.emit('player:sold', data);
  }

  broadcastUnsold(data) {
    this.auctionNamespace.emit('player:unsold', data);
  }

  broadcastRefresh() {
    this.auctionNamespace.emit('system:refresh');
  }
}
