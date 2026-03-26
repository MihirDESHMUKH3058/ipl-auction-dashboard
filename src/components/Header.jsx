import React, { useState } from 'react';

export default function Header({ activeTab, setActiveTab, isAdmin, setIsAdmin }) {
  const [showModal, setShowModal] = useState(false);
  const [passcode, setPasscode] = useState('');

  const handleAdminClick = () => {
    if (isAdmin) {
      setActiveTab('admin');
    } else {
      setShowModal(true);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === 'admin123') {
      setIsAdmin(true);
      setActiveTab('admin');
      setShowModal(false);
      setPasscode('');
    } else {
      alert("Incorrect passcode. Access denied.");
    }
  };

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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Admin Access</h2>
            <p style={{marginBottom: '1rem', color: 'var(--text-secondary)'}}>Enter the passcode to unlock auction controls.</p>
            <form onSubmit={handleLogin}>
              <input 
                id="admin-passcode-input"
                type="password" 
                className="modal-input" 
                placeholder="Passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
              />
              <div className="modal-actions">
                <button type="button" className="modal-btn secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="modal-btn primary">Unlock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
