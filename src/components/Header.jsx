import React, { useState } from 'react';

export default function Header({ activeTab, setActiveTab, isAdmin }) {
  const handleAdminClick = () => {
    if (isAdmin) {
      setActiveTab('admin');
    } else {
      alert("Admin access required. Please log in with an admin code.");
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="title-section">
          <h1 className="app-title">IPL 2026</h1>
          <div className="app-subtitle">College Auction Portal</div>
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
            onClick={handleAdminClick}
          >
            {isAdmin ? "Auction Admin" : "Auction Admin 🔒"}
          </button>
          <button 
            className={`nav-tab ${activeTab === 'anonymous' ? 'active' : ''}`}
            onClick={() => setActiveTab('anonymous')}
          >
            Anonymous Auction
          </button>
          <button 
            className={`nav-tab ${activeTab === 'bags' ? 'active' : ''}`}
            onClick={() => setActiveTab('bags')}
          >
            Player Bags
          </button>
          <button 
            className={`nav-tab ${activeTab === 'rosters' ? 'active' : ''}`}
            onClick={() => setActiveTab('rosters')}
          >
            Team Rosters
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
