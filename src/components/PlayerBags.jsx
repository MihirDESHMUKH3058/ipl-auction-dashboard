import React, { useState, useMemo } from 'react';
import PlayerCard from './PlayerCard';
import './PlayerBags.css';

export default function PlayerBags({ players, auctionRecords }) {
  const [activeBagIndex, setActiveBagIndex] = useState(0);

  const parsePriceToLakhs = (priceStr) => {
    if (!priceStr) return 0;
    const numStr = priceStr.replace(/[^0-9]/g, '');
    return parseInt(numStr, 10) / 100000;
  };

  const bags = useMemo(() => {
    const categories = [
      { 
        id: 'capped-bat-in', 
        title: 'Bag 1: Indian Capped Batsman', 
        filter: p => p.role === 'Batsman' && p.overseas === 'Indian' && parsePriceToLakhs(p.basePrice) >= 50 
      },
      { 
        id: 'bat-ovs', 
        title: 'Bag 2: Overseas Batsman', 
        filter: p => p.role === 'Batsman' && p.overseas === 'Overseas' 
      },
      { 
        id: 'uncapped-bat-in', 
        title: 'Bag 3: Uncapped Indian Batsman', 
        filter: p => p.role === 'Batsman' && p.overseas === 'Indian' && parsePriceToLakhs(p.basePrice) < 50 
      },
      { 
        id: 'capped-bowl-in', 
        title: 'Bag 4: Indian Capped Bowler', 
        filter: p => p.role === 'Bowler' && p.overseas === 'Indian' && parsePriceToLakhs(p.basePrice) >= 50 
      },
      { 
        id: 'bowl-ovs', 
        title: 'Bag 5: Overseas Bowler', 
        filter: p => p.role === 'Bowler' && p.overseas === 'Overseas' 
      },
      { 
        id: 'uncapped-bowl-in', 
        title: 'Bag 6: Uncapped Indian Bowler', 
        filter: p => p.role === 'Bowler' && p.overseas === 'Indian' && parsePriceToLakhs(p.basePrice) < 50 
      },
      { 
        id: 'wk', 
        title: 'Bag 7: Wicketkeepers', 
        filter: p => p.role === 'Wicket-Keeper' 
      },
      { 
        id: 'allrounder-in', 
        title: 'Bag 8: Indian All-rounders', 
        filter: p => p.role === 'All-Rounder' && p.overseas === 'Indian' 
      },
      { 
        id: 'allrounder-ovs', 
        title: 'Bag 9: Overseas All-rounders', 
        filter: p => p.role === 'All-Rounder' && p.overseas === 'Overseas' 
      }
    ];

    return categories.map(cat => ({
      ...cat,
      players: players.filter(cat.filter)
    }));
  }, [players]);

  const activeBag = bags[activeBagIndex];

  return (
    <div className="bags-container">
      <div className="bags-sidebar">
        <h3 className="sidebar-title">Auction Sets</h3>
        <div className="bag-selector">
          {bags.map((bag, index) => (
            <button
              key={bag.id}
              className={`bag-btn ${activeBagIndex === index ? 'active' : ''}`}
              onClick={() => setActiveBagIndex(index)}
            >
              <span className="bag-number">{index + 1}</span>
              <span className="bag-name">{bag.title.split(': ')[1]}</span>
              <span className="bag-count">{bag.players.length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bags-main">
        <div className="bag-header">
          <h2 className="bag-title">{activeBag.title}</h2>
          <div className="bag-stats">
            {activeBag.players.length} Players in this set
          </div>
        </div>

        {activeBag.players.length === 0 ? (
          <div className="empty-bag-state">
            <h3>No players found in this category</h3>
            <p>Try adjusting your search or checking another bag.</p>
          </div>
        ) : (
          <div className="bag-player-grid">
            {activeBag.players.map(player => (
              <PlayerCard key={player.id} player={player} auctionRecord={auctionRecords[player.id]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
