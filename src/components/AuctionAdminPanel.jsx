import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import './AuctionAdminPanel.css';

export default function AuctionAdminPanel({ players, auctionRecords, setAuctionRecords }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [finalPrice, setFinalPrice] = useState('');

  const teams = ['CSK', 'MI', 'RCB', 'KKR', 'DC', 'SRH', 'RR', 'PBKS', 'LSG', 'GT'];

  const availablePlayers = useMemo(() => {
    return players.filter(p => !auctionRecords[p.id] && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [players, auctionRecords, searchTerm]);

  const handleSell = (e) => {
    e.preventDefault();
    if (!selectedPlayerId || !selectedTeam || !finalPrice) return;

    const newRecords = {
      ...auctionRecords,
      [selectedPlayerId]: {
        team: selectedTeam,
        finalPrice: `₹${finalPrice},00,000` // Storing as string matching Base Price format for easy display
      }
    };
    
    setAuctionRecords(newRecords);
    
    // Clear form
    setSelectedPlayerId('');
    setSelectedTeam('');
    setFinalPrice('');
    setSearchTerm('');
  };

  const handleResetPlayer = (id) => {
    const newRecords = { ...auctionRecords };
    delete newRecords[id];
    setAuctionRecords(newRecords);
  };

  const handleExport = () => {
    if (Object.keys(auctionRecords).length === 0) {
      alert("No players sold yet to export!");
      return;
    }

    const data = Object.entries(auctionRecords).map(([id, record]) => {
      const p = players.find(p => p.id.toString() === id);
      return {
        "Player Name": p?.name || 'Unknown',
        "Team": record.team,
        "Sold Price": record.finalPrice,
        "Rating": p?.rating || 0
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Auction Results");
    XLSX.writeFile(wb, "ipl_auction_results_manual.xlsx");
  };

  return (
    <div className="admin-panel-container">
      <div className="admin-form-card">
        <h2 className="admin-title">Live Auction Control Panel</h2>
        
        <form onSubmit={handleSell} className="admin-form">
          <div className="form-group">
            <label>Search Player to Auction</label>
            <input 
              type="text" 
              placeholder="Type player name..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Select Player</label>
            <select 
              value={selectedPlayerId} 
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              required
            >
              <option value="">-- Choose Player --</option>
              {availablePlayers.slice(0, 50).map(p => (
                <option key={p.id} value={p.id}>#{p.id} {p.name} ({p.role}) - Base: {p.basePrice}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Sold To Team</label>
              <select 
                value={selectedTeam} 
                onChange={(e) => setSelectedTeam(e.target.value)}
                required
              >
                <option value="">-- Choose Team --</option>
                {teams.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group flex-1">
              <label>Final Price (in Lakhs)</label>
              <div className="price-input-wrapper">
                <span className="currency-symbol">₹</span>
                <input 
                  type="number" 
                  min="0" 
                  placeholder="e.g. 200 for 2Cr" 
                  value={finalPrice} 
                  onChange={(e) => setFinalPrice(e.target.value)}
                  required
                />
                <span className="lakhs-suffix">Lakhs</span>
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn sell-btn">Mark as SOLD</button>
        </form>
      </div>

      <div className="admin-history-card">
        <div className="history-header">
          <h2 className="admin-title">Recent Sales History</h2>
          <button 
            type="button" 
            className="export-btn" 
            onClick={handleExport}
            title="Download Excel matching current state"
          >
            📥 Export to Excel
          </button>
        </div>
        <div className="history-list">
          {Object.entries(auctionRecords).length === 0 ? (
            <p className="empty-state">No players sold yet.</p>
          ) : (
            [...Object.entries(auctionRecords)].reverse().map(([id, record]) => {
              const p = players.find(p => p.id.toString() === id);
              if (!p) return null;
              return (
                <div key={id} className="history-item">
                  <div className="history-info">
                    <strong>{p.name}</strong> 
                    <span className="history-team badge" style={{backgroundColor: `var(--${record.team.toLowerCase()})`}}>{record.team}</span>
                  </div>
                  <div className="history-actions">
                    <span className="history-price">{record.finalPrice}</span>
                    <button type="button" onClick={() => handleResetPlayer(id)} className="undo-btn">Undo</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
