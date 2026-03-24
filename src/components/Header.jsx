import React from 'react';

export default function Header() {
  return (
    <header className="app-header">
      <div className="title-section">
        <h1 className="app-title">IPL 2026</h1>
        <div className="app-subtitle">College Auction</div>
      </div>
      
      <div className="rules-tracker">
        <div className="rules-title">Mandatory Squad Rules</div>
        <div className="rules-list">
          <div className="rule-item">
            <span className="rule-icon">🛡️</span>
            Min 1 Wicket-Keeper
          </div>
          <div className="rule-item">
            <span className="rule-icon">🎯</span>
            Min 3 Bowlers
          </div>
          <div className="rule-item">
            <span className="rule-icon">✈️</span>
            Exactly 4 Overseas
          </div>
        </div>
      </div>
    </header>
  );
}
