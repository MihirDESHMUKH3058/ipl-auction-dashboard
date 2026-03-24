import React from 'react';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="title-section">
          <h1 className="app-title">IPL 2026</h1>
          <div className="app-subtitle">College Auction</div>
        </div>
        
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            Player Catalog
          </button>
          <button 
            className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            Auction Admin
          </button>
        </div>
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
