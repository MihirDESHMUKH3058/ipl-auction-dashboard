import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import './AnonymousAuction.css';

export default function AnonymousAuction({ players, auctionRecords, setAuctionRecords, isAdmin }) {
  const teams = ['CSK', 'MI', 'RCB', 'KKR', 'DC', 'SRH', 'RR', 'PBKS', 'LSG', 'GT'];
  
  // State for user identity
  const [userTeam, setUserTeam] = useState(localStorage.getItem('userTeam') || null);

  // State from Supabase
  const [activePlayerId, setActivePlayerId] = useState(null);
  const [bidsRevealed, setBidsRevealed] = useState(false);
  const [dbBids, setDbBids] = useState([]); // Array of { team_name, amount, player_id }
  const [myBid, setMyBid] = useState('');

  const anonymousPlayers = useMemo(() => {
    return players.filter(p => p.isAnonymous === true);
  }, [players]);

  const activePlayer = useMemo(() => {
    return players.find(p => p.id === activePlayerId);
  }, [players, activePlayerId]);

  // 1. Initial Fetch and Subscriptions
  useEffect(() => {
    const setupSubscriptions = async () => {
      // Fetch initial settings
      const { data: settings } = await supabase
        .from('anonymous_auction_settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (settings) {
        setActivePlayerId(settings.active_player_id);
        setBidsRevealed(settings.bids_revealed);
      }

      // Subscribe to settings changes
      const settingsChannel = supabase.channel('settings_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'anonymous_auction_settings' }, payload => {
          console.log('Settings changed!', payload);
          if (payload.new) {
            setActivePlayerId(payload.new.active_player_id ? payload.new.active_player_id.toString() : null);
            setBidsRevealed(payload.new.bids_revealed);
          }
        })
        .subscribe();

      // Subscribe to bids changes
      const bidsChannel = supabase.channel('bids_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'anonymous_bids' }, payload => {
          fetchBids(activePlayerId); // Re-fetch all bids when one changes
        })
        .subscribe();

      return () => {
        supabase.removeChannel(settingsChannel);
        supabase.removeChannel(bidsChannel);
      };
    };

    setupSubscriptions();
  }, [activePlayerId]);

  // Fetch bids for the active player
  const fetchBids = async (pid) => {
    if (!pid) {
      setDbBids([]);
      return;
    }
    const { data } = await supabase
      .from('anonymous_bids')
      .select('*')
      .eq('player_id', pid);
    
    if (data) setDbBids(data);
  };

  useEffect(() => {
    fetchBids(activePlayerId);
  }, [activePlayerId]);

  // Update myBid local state when dbBids change (if I already have a bid in DB)
  useEffect(() => {
    if (userTeam && dbBids.length > 0) {
      const existing = dbBids.find(b => b.team_name === userTeam);
      if (existing) {
        setMyBid(existing.amount.toString());
      } else {
        setMyBid('');
      }
    }
  }, [dbBids, userTeam]);

  // Admin Actions
  const handleSelectPlayer = async (pid) => {
    const stringId = pid.toString();
    const { error } = await supabase.from('anonymous_auction_settings').upsert({ 
      id: 1, 
      active_player_id: stringId, 
      bids_revealed: false 
    });
    
    if (error) {
      console.error("Selection error:", error);
    } else {
      // Clear old bids for this player
      await supabase.from('anonymous_bids').delete().eq('player_id', stringId);
      // Optimistic update
      setActivePlayerId(stringId);
      setBidsRevealed(false);
    }
  };

  const handleToggleReveal = async () => {
    await supabase.from('anonymous_auction_settings').update({ bids_revealed: !bidsRevealed }).eq('id', 1);
  };

  const handleConfirmWinner = async (winningTeam, amount) => {
    if (!activePlayer) return;
    const priceString = `₹${amount},00,000`;
    
    // 1. Add to main auction records
    const { error } = await supabase.from('auction_records').upsert({
      player_id: activePlayer.id.toString(),
      team: winningTeam,
      finalPrice: priceString
    });

    if (!error) {
      // 2. Reset anonymous state
      await supabase.from('anonymous_auction_settings').update({ active_player_id: null, bids_revealed: false }).eq('id', 1);
      await supabase.from('anonymous_bids').delete().eq('player_id', activePlayer.id);
      
      // Update local state if needed (App.jsx will handle via realtime)
      setAuctionRecords(prev => ({
        ...prev,
        [activePlayer.id]: { team: winningTeam, finalPrice: priceString }
      }));
    }
  };

  // Team Actions
  const handleSetTeam = (team) => {
    setUserTeam(team);
    localStorage.setItem('userTeam', team);
  };

  const handleSubmitBid = async () => {
    if (!activePlayer || !userTeam || !myBid) return;
    const amount = parseInt(myBid);
    if (isNaN(amount)) return;

    await supabase.from('anonymous_bids').upsert({
      player_id: activePlayer.id,
      team_name: userTeam,
      amount: amount
    });
    alert("Bid Submitted Successfully!");
  };

  // Components
  if (!isAdmin && !userTeam) {
    return (
      <div className="team-picker-container">
        <h1>Select Your Team</h1>
        <p>You must choose your team to participate in secret bidding.</p>
        <div className="team-grid">
          {teams.map(t => (
            <div key={t} className="team-card" onClick={() => handleSetTeam(t)}>
               <div className="team-badge" style={{ backgroundColor: `var(--${t.toLowerCase()})` }}></div>
               <h3>{t}</h3>
               <p>Click to select</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const winner = bidsRevealed ? dbBids.reduce((prev, current) => (prev.amount > current.amount) ? prev : current, {team_name: 'None', amount: 0}) : null;

  return (
    <div className="anonymous-auction-container">
      <div className="anonymous-header">
        <h1 className="anonymous-title">Secret Bidding Arena</h1>
        <div style={{display:'flex', justifyContent:'center', gap:'1rem'}}>
          <p className="anonymous-subtitle">Real-time Multi-User Auction</p>
          {userTeam && !isAdmin && (
            <div className="current-team-info">
              <span>Your Team: <strong>{userTeam}</strong></span>
              <button className="change-team-btn" onClick={() => setUserTeam(null)}>Change</button>
            </div>
          )}
        </div>
      </div>

      <div className="auction-layout">
        {/* LEFT COLUMN: Admin Player List OR Status List */}
        <div className="player-selection-card">
          {isAdmin ? (
            <>
              <h3>Admin: Select Player</h3>
              <div className="player-list-scroll">
                <div className="player-list">
                  {anonymousPlayers.map(p => {
                    const isSold = !!auctionRecords[p.id];
                    return (
                      <div 
                        key={p.id} 
                        className={`player-item ${activePlayerId === p.id ? 'active' : ''} ${isSold ? 'sold' : ''}`}
                        onClick={() => !isSold && handleSelectPlayer(p.id)}
                      >
                        <img src={`${import.meta.env.BASE_URL}players/${p.image_file}`} alt={p.name} className="player-thumb" />
                        <div className="player-info">
                          <h4>{p.name}</h4>
                          <p>{p.role} • {p.basePrice}</p>
                        </div>
                        {isSold && <span className="sold-tag">SOLD</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <h3>Bidding Progress</h3>
              <div className="bid-status-grid">
                {teams.map(t => {
                  const hasBid = dbBids.some(b => b.team_name === t);
                  return (
                    <div key={t} className={`status-item ${hasBid ? 'has-bid' : ''}`}>
                      <span className="status-icon">{hasBid ? '✅' : '⏳'}</span>
                      <span className="status-team">{t}</span>
                    </div>
                  );
                })}
              </div>
              <p className="waiting-msg">Wait for the admin to reveal all bids.</p>
            </>
          )}
        </div>

        {/* RIGHT COLUMN: Active Console */}
        <div className="bidding-console">
          {activePlayer ? (
            <>
              <div className="player-header-mini">
                <img src={`${import.meta.env.BASE_URL}players/${activePlayer.image_file}`} alt={activePlayer.name} className="mini-img" />
                <div>
                  <h2 style={{margin:0}}>{activePlayer.name}</h2>
                  <p style={{color: '#a0aec0', margin: '0.5rem 0'}}>{activePlayer.role} • {activePlayer.nationality}</p>
                  <div className="base-price-badge">Base Price: {activePlayer.basePrice}</div>
                </div>
              </div>

              {/* ADMIN VIEW OF BIDS */}
              {isAdmin && (
                <div className="admin-only-info">
                  <h4>Admin Control Panel (Bids)</h4>
                  <table style={{width: '100%', marginTop: '1rem', borderCollapse: 'collapse'}}>
                    <thead>
                      <tr style={{textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                        <th style={{padding: '0.5rem'}}>Team</th>
                        <th style={{padding: '0.5rem'}}>Bid Amount (Lakhs)</th>
                        <th style={{padding: '0.5rem'}}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbBids.map(b => (
                        <tr key={b.team_name}>
                          <td style={{padding: '0.5rem'}}>{b.team_name}</td>
                          <td style={{padding: '0.5rem'}}>₹{b.amount} Lakhs</td>
                          <td style={{padding: '0.5rem'}}>
                            {bidsRevealed && (
                              <button className="sell-btn-anon" style={{padding: '4px 12px', fontSize: '0.8rem'}} onClick={() => handleConfirmWinner(b.team_name, b.amount)}>Confirm Win</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="actions-row">
                    <button className="action-btn reveal-btn" onClick={handleToggleReveal}>
                      {bidsRevealed ? "Hide Bids" : "Reveal All Bids"}
                    </button>
                  </div>
                </div>
              )}

              {/* TEAM VIEW / PUBLIC VIEW */}
              {!isAdmin && (
                <div className="bid-controls-card">
                  {bidsRevealed ? (
                    <div className="winner-announce">
                      <h3>🏆 ALL BIDS REVEALED</h3>
                      <div style={{marginTop: '1.5rem'}}>
                        {dbBids.sort((a,b) => b.amount - a.amount).map(b => (
                          <div key={b.team_name} style={{display:'flex', justifyContent:'space-between', padding:'0.5rem', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                            <span>{b.team_name}</span>
                            <strong>₹{b.amount} Lakhs</strong>
                          </div>
                        ))}
                      </div>
                      <p style={{marginTop: '1.5rem', color: 'var(--neon-blue)'}}>Winning Team: {winner.team_name}</p>
                    </div>
                  ) : (
                    <>
                      <h3>Enter Your Bid (Confidential)</h3>
                      <div className="bid-input-wrapper large-bid-input">
                        <span className="currency" style={{fontSize: '1.5rem'}}>₹</span>
                        <input 
                          type="number" 
                          placeholder="Price in Lakhs"
                          value={myBid}
                          onChange={(e) => setMyBid(e.target.value)}
                        />
                      </div>
                      <button className="action-btn submit-bid-btn" onClick={handleSubmitBid}>Submit Bid</button>
                      <p style={{marginTop: '1rem', color: '#718096', fontSize: '0.9rem'}}>Your bid is only visible to the auctioneer.</p>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="no-selection">
              <p>{isAdmin ? "Select a player from the list to start the bidding session" : "Waiting for Admin to start the next bidding session..."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
