import React, { useState } from 'react';
import './PlayerCard.css';

export default function PlayerCard({ player }) {
  const [imgError, setImgError] = useState(false);

  // Helper to determine team color variable
  const getTeamColor = (teamCode) => {
    const teams = ['CSK', 'MI', 'RCB', 'KKR', 'DC', 'SRH', 'RR', 'PBKS', 'LSG', 'GT'];
    if (teams.includes(teamCode)) {
      return `var(--${teamCode.toLowerCase()})`;
    }
    return 'var(--neon-blue)';
  };

  const teamColor = getTeamColor(player.team);

  // Render stars
  const renderStars = (rating) => {
    return Array.from({ length: 10 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>
    ));
  };

  return (
    <div className="player-card" style={{ '--card-accent': teamColor }}>
      <div className="card-header">
        <div className="team-badge" style={{ backgroundColor: teamColor }}>
          {player.team}
        </div>
        <div className={`origin-badge ${player.overseas === 'Overseas' ? 'overseas' : 'indian'}`}>
          {player.overseas === 'Overseas' ? '✈️ OVS' : '🇮🇳 IND'}
        </div>
      </div>
      
      <div className="card-image-container">
        {!imgError ? (
          <img 
            src={`/players/${player.id}.png`} 
            alt={player.name}
            onError={() => setImgError(true)}
            className="player-image"
          />
        ) : (
          <div className="player-placeholder">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        )}
      </div>

      <div className="card-body">
        <h2 className="player-name">{player.name}</h2>
        <div className="player-role">{player.role} • {player.country}</div>
        
        <div className="player-rating">
          <div className="stars">{renderStars(player.rating)}</div>
          <span className="rating-text">{player.rating}/10</span>
        </div>

        <div className="card-footer">
          <div className="base-price-label">Base Price</div>
          <div className="base-price-value">{player.basePrice}</div>
        </div>
      </div>
    </div>
  );
}
