import React, { useState, useMemo } from 'react';
import './AnonymousAuction.css';

export default function AnonymousAuction({ players, auctionRecords, setAuctionRecords }) {
  const teams = ['CSK', 'MI', 'RCB', 'KKR', 'DC', 'SRH', 'RR', 'PBKS', 'LSG', 'GT'];
  
  const anonymousPlayers = useMemo(() => {
    return players.filter(p => p.isAnonymous === true);
  }, [players]);

  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [bids, setBids] = useState(teams.reduce((acc, team) => ({ ...acc, [team]: '' }), {}));
  const [showBids, setShowBids] = useState(false);

  const selectedPlayer = useMemo(() => {
    return players.find(p => p.id === selectedPlayerId);
  }, [players, selectedPlayerId]);

  const winner = useMemo(() => {
    if (!showBids) return null;
    
    let highestBid = -1;
    let winningTeam = null;

    Object.entries(bids).forEach(([team, amount]) => {
      const val = parseFloat(amount);
      if (!isNaN(val) && val > highestBid) {
        highestBid = val;
        winningTeam = team;
      }
    });

    return winningTeam ? { team: winningTeam, amount: highestBid } : null;
  }, [bids, showBids]);

  const handleBidChange = (team, value) => {
    setBids(prev => ({ ...prev, [team]: value }));
  };

  const handleSell = () => {
    if (!winner || !selectedPlayer) return;

    const newRecords = {
      ...auctionRecords,
      [selectedPlayer.id]: {
        team: winner.team,
        finalPrice: `₹${winner.amount},00,000`
      }
    };
    
    setAuctionRecords(newRecords);
    // Reset state for next player
    setSelectedPlayerId(null);
    setBids(teams.reduce((acc, team) => ({ ...acc, [team]: '' }), {}));
    setShowBids(false);
  };

  const handleReset = () => {
    setBids(teams.reduce((acc, team) => ({ ...acc, [team]: '' }), {}));
    setShowBids(false);
  };

  return (
    <div className="anonymous-auction-container">
      <div className="anonymous-header">
        <h1 className="anonymous-title">Secret Bidding Arena</h1>
        <p className="anonymous-subtitle">10 Teams, 1 Winner. All bids are hidden until reveal.</p>
      </div>

      <div className="auction-layout">
        <div className="player-selection-card">
          <h3>Select Anonymous Player</h3>
          <div className="player-list">
            {anonymousPlayers.map(p => {
              const isSold = !!auctionRecords[p.id];
              return (
                <div 
                  key={p.id} 
                  className={`player-item ${selectedPlayerId === p.id ? 'active' : ''} ${isSold ? 'sold' : ''}`}
                  onClick={() => !isSold && setSelectedPlayerId(p.id)}
                >
                  <img src={`${import.meta.env.BASE_URL}players/${p.image_file}`} alt={p.name} className="player-thumb" />
                  <div className="player-info">
                    <h4>{p.name}</h4>
                    <p>{p.role} • Base: {p.basePrice}</p>
                  </div>
                  {isSold && <span className="sold-tag">SOLD</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bidding-console">
          {selectedPlayer ? (
            <>
              <div className="console-header">
                <h2>Bidding for {selectedPlayer.name}</h2>
                <div className="base-price-badge">Base: {selectedPlayer.basePrice}</div>
              </div>

              <div className="bidding-grid">
                {teams.map(team => (
                  <div key={team} className="team-bid-input">
                    <label className="team-label">
                      <span className="team-badge" style={{ backgroundColor: `var(--${team.toLowerCase()})` }}></span>
                      {team} Bid
                    </label>
                    <div className="bid-input-wrapper">
                      <span className="currency">₹</span>
                      <input 
                        type={showBids ? "number" : "password"} 
                        placeholder="Price in Lakhs"
                        value={bids[team]}
                        onChange={(e) => handleBidChange(team, e.target.value)}
                        disabled={showBids}
                      />
                      <span className="lakhs-label" style={{marginLeft: '8px', fontSize: '0.8rem', color: '#718096'}}>Lakhs</span>
                    </div>
                  </div>
                ))}
              </div>

              {winner && showBids && (
                <div className="winner-announce">
                  <h3>🏆 WINNER: {winner.team}</h3>
                  <p>Highest Bid: ₹{winner.amount} Lakhs</p>
                </div>
              )}

              <div className="actions-row">
                {!showBids ? (
                  <button className="action-btn reveal-btn" onClick={() => setShowBids(true)}>Reveal All Bids</button>
                ) : (
                  <>
                    <button className="action-btn sell-btn-anon" onClick={handleSell}>Confirm Sale</button>
                    <button className="action-btn reset-btn-anon" onClick={handleReset}>Edit Bids</button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Please select a player from the list to start bidding</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
