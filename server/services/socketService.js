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
    this.currentPlayer = null;
    this.status = 'idle';
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
        //PlayerData contains the full player object from the admin
        const { id, base_price } = playerData;
        this.currentPlayerId = id;
        this.currentBid = Number(base_price) || 0;
        this.highestBidder = null;
        this.status = 'preview';
        this.currentTimer = 300; // Reset timer for new player

        // Use provided data immediately for the broadcast (ensures name/image show up)
        this.currentPlayer = playerData;
        this.broadcastNewPlayer(this.currentPlayer);
        this.broadcastStatus(this.status);
        this.broadcastTimer(this.currentTimer);
        
        try {
          // Fetch latest from DB to ensure state consistency (background check)
          const { data: dbPlayer, error } = await supabase
            .from('players')
            .select('*')
            .eq('id', id)
            .single();

          if (!error && dbPlayer) {
            this.currentPlayer = dbPlayer;
            // Optionally re-broadcast if DB data is more complete, but usually not needed
          }
        } catch (err) {
          console.error("Error in background player fetch:", err);
        }
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
        // params can be an object { count: 10, tier: '80+' } or just count
        const count = typeof params === 'object' ? params.count || 10 : (params || 10);
        const tier = typeof params === 'object' ? params.tier : null;

        let query = supabase.from('players').select('id').eq('status', 'hidden');
        if (tier) {
          query = query.ilike('category', `%${tier}%`);
        }
        query = query.limit(count);

        const { data: unsoldPlayers, error: fetchError } = await query;

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
          // Clear team players first to avoid foreign key errors if enforced
          const { error: tpError } = await supabase.from('team_players')
            .delete()
            .neq('team_id', 0); // Delete all
            
          if (tpError) console.error("Reset session team_players error:", tpError);

          // Clear all auction results
          const { error } = await supabase.from('players')
            .update({ status: 'hidden', team_name: null, sale_price: null })
            .neq('id', 0); // Safety clause
            
          if (error) console.error("Reset session players error:", error);
          
          this.broadcastRefresh();
          this.broadcastStatus('idle');
        } catch (err) {
          console.error("Failed to reset session:", err);
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
      const { error: playerError } = await supabase.from('players')
        .update({ status: 'sold', team_name, sale_price })
        .eq('id', id);

      if (playerError) console.error("Finalize sold player error:", playerError);

      const { error: teamPlayerError } = await supabase.from('team_players')
        .insert([{ team_id, player_id: id, final_price: sale_price }]);

      if (teamPlayerError && teamPlayerError.code !== '23505') {
        console.error("Finalize sold team_player error:", teamPlayerError);
      }

      if (!playerError) {
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
      const { error: playerError } = await supabase.from('players')
        .update({ status: 'unsold', team_name: null, sale_price: null })
        .eq('id', id);

      if (playerError) console.error("Finalize unsold player error:", playerError);
      
      const { error: tpError } = await supabase.from('team_players')
        .delete()
        .eq('player_id', id);
        
      if (tpError) console.error("Finalize unsold team_player error:", tpError);

      if (!playerError) {
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
}

