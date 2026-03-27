import { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import PlayerGrid from './components/PlayerGrid';
import AuctionAdminPanel from './components/AuctionAdminPanel';
import AnonymousAuction from './components/AnonymousAuction';
import TeamRosters from './components/TeamRosters';
import PlayerBags from './components/PlayerBags';
import MyTeam from './components/MyTeam';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [players, setPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState('catalog');
  
  // Refresh session timestamp on activity (tab change)
  useEffect(() => {
    const savedSession = localStorage.getItem('ipl_auction_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        session.timestamp = Date.now();
        localStorage.setItem('ipl_auction_session', JSON.stringify(session));
      } catch (e) {
        console.error("Failed to refresh session timestamp", e);
      }
    }
  }, [activeTab]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loginCode, setLoginCode] = useState('');
  const [userTeam, setUserTeam] = useState(null); // Consolidated team state
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [presenceState, setPresenceState] = useState({});
  const [myPresenceId] = useState(() => Math.random().toString(36).substr(2, 9));
  
  // Load initial state from localStorage if available
  const [auctionRecords, setAuctionRecords] = useState(() => {
    const saved = localStorage.getItem('auctionState');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {};
  });

  const [filters, setFilters] = useState({
    role: 'All',
    origin: 'All',
    rating: 'All',
    price: 'All',
    availability: 'All'
  });

  // 1. Session Persistence Check on Mount
  useEffect(() => {
    const savedSession = localStorage.getItem('ipl_auction_session');
    if (savedSession) {
      try {
        const { code, is_admin, timestamp } = JSON.parse(savedSession);
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;

        if (now - timestamp < thirtyMinutes) {
          console.log("Restoring session for:", code);
          setLoginCode(code);
          setIsAdmin(is_admin);
          setIsAuthenticated(true);
          setShowLogin(false);
          if (!is_admin) {
            setUserTeam(code);
          }
        } else {
          console.log("Session expired.");
          localStorage.removeItem('ipl_auction_session');
        }
      } catch (e) {
        console.error("Failed to parse saved session", e);
        localStorage.removeItem('ipl_auction_session');
      }
    }
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}players.json`)
      .then(res => res.json())
      .then(data => setPlayers(data))
      .catch(err => console.error("Failed to load players data", err));
  }, []);

  // Save to localStorage whenever auctionRecords change (Fallback)
  useEffect(() => {
    localStorage.setItem('auctionState', JSON.stringify(auctionRecords));
  }, [auctionRecords]);

  // Supabase: Fetch initial data and subscribe to Real-Time updates
  useEffect(() => {
    let channel;
    const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE';

    const setupSupabase = async () => {
      if (!isSupabaseConfigured) {
        console.warn("Supabase not configured. Falling back to LocalStorage.");
        return;
      }

      // 1. Fetch existing records
      const { data, error } = await supabase.from('auction_records').select('*');
      if (error) {
        console.error('Error fetching Supabase records:', error);
      } else if (data) {
        const recordsMap = {};
        data.forEach(row => {
          recordsMap[row.player_id] = { team: row.team, finalPrice: row.finalPrice };
        });
        // Use records from Supabase as the source of truth, replacing any local stale data
        setAuctionRecords(recordsMap);
      }

      // 2. Subscribe to Real-Time Updates & Presence
      channel = supabase.channel('public:auction_records', {
        config: {
          presence: {
            key: myPresenceId,
          },
        },
      });

      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'auction_records' }, (payload) => {
          console.log('Realtime change received!', payload.eventType, payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const row = payload.new;
            console.log('Syncing INSERT/UPDATE:', row.player_id);
            setAuctionRecords(prev => ({
              ...prev,
              [row.player_id]: { team: row.team, finalPrice: row.finalPrice }
            }));
          } else if (payload.eventType === 'DELETE') {
            const row = payload.old;
            console.log('Syncing DELETE for player_id:', row.player_id);
            setAuctionRecords(prev => {
              const newRecords = { ...prev };
              if (row.player_id) {
                delete newRecords[row.player_id];
              }
              return newRecords;
            });
          }
        })
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState();
          console.log('Presence sync:', newState);
          setPresenceState(newState);
        })
        .subscribe(async (status) => {
          console.log('Supabase Realtime subscription status:', status);
          if (status === 'CHANNEL_ERROR') {
            console.error("Realtime subscription failed! Trying to reconnect...");
          }
          if (status === 'SUBSCRIBED' && isAuthenticated && !isAdmin && loginCode) {
            // Track presence if already authenticated as a team
            await channel.track({ 
              team: loginCode, 
              online_at: new Date().toISOString(),
              id: myPresenceId
            });
          }
        });
    };

    setupSupabase();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Also sync to local Excel file (only works on local dev server)
  useEffect(() => {
    if (players.length > 0 && Object.keys(auctionRecords).length > 0) {
      const syncUrl = `${import.meta.env.BASE_URL}api/sync-auction`.replace(/\/+/g, '/');
      fetch(syncUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: auctionRecords, players })
      })
      .then(res => {
        if(res.ok) {
          console.log("%c[Success] Auction results synced to local Excel file", "color: #00ff00");
        } else if (res.status === 409) {
          alert("⚠️ ERROR: Cannot update Excel file because it is OPEN in Microsoft Excel.\n\nPlease CLOSE 'auction_results.xlsx' and then click 'Undo' followed by 'Mark as Sold' again to retry.");
        }
      })
      .catch(err => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.error("[Error] Local Excel sync failed even on localhost. Check if dev server is running.", err);
        } else {
          console.debug("[Info] Excel sync is disabled on the public GitHub link.");
        }
      });
    }
  }, [auctionRecords, players]);

  const parsePriceToLakhs = (priceStr) => {
    if (!priceStr) return 0;
    const numStr = priceStr.replace(/[^0-9]/g, '');
    return parseInt(numStr, 10) / 100000;
  };

  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      // Exclude anonymous players from the general catalog
      if (p.isAnonymous) return false;
      
      if (filters.role !== 'All' && p.role !== filters.role) return false;
      if (filters.origin !== 'All' && p.overseas !== filters.origin) return false;
      if (filters.rating !== 'All' && p.rating < parseInt(filters.rating, 10)) return false;
      
      if (filters.price !== 'All') {
        const maxLakhs = parseInt(filters.price, 10);
        const playerLakhs = parsePriceToLakhs(p.basePrice);
        if (playerLakhs > maxLakhs) return false;
      }
      
      const isSold = !!auctionRecords[p.id];
      if (filters.availability === 'Available' && isSold) return false;
      if (filters.availability === 'Sold' && !isSold) return false;

      return true;
    });
  }, [players, filters, auctionRecords]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const teamCodes = ['CSK26', 'MI26', 'RCB26', 'KKR26', 'SRH26', 'DC26', 'PBKS26', 'RR26', 'LSG26', 'GT26'];
    const adminCodes = ['IPL_ADMIN_2026', 'etc@2027'];

    if (loginCode === 'IPL_ADMIN_2026') {
      setShowPasswordStep(true);
    } else if (teamCodes.includes(loginCode)) {
      // Check if team is already joined by someone else
      const isTeamActive = Object.values(presenceState).some(presences => 
        presences.some(p => p.team === loginCode && p.id !== myPresenceId)
      );

      if (isTeamActive) {
        alert(`Team ${loginCode} is already joined by another user! Only one person per team can join.`);
        return;
      }

      setIsAuthenticated(true);
      setIsAdmin(false);
      setShowLogin(false);
      setUserTeam(loginCode);
      
      // Save session to localStorage
      localStorage.setItem('ipl_auction_session', JSON.stringify({
        code: loginCode,
        is_admin: false,
        timestamp: Date.now()
      }));

      // Track presence immediately after login
      const channel = supabase.getChannels().find(c => c.topic === 'public:auction_records');
      if (channel) {
        channel.track({ 
          team: loginCode, 
          online_at: new Date().toISOString(),
          id: myPresenceId
        });
      }
    } else {
      alert("Invalid Access Code!");
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (adminPassword === 'etc@2027') {
      setIsAuthenticated(true);
      setIsAdmin(true);
      setShowLogin(false);
      
      // Save session to localStorage
      localStorage.setItem('ipl_auction_session', JSON.stringify({
        code: 'ADMIN',
        is_admin: true,
        timestamp: Date.now()
      }));
    } else {
      alert("Incorrect Admin Password!");
    }
  };

  // Admin state is now handled directly by the login submit logic

  if (showLogin) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">IPL 2026</h1>
            <p className="login-subtitle">College Auction Portal</p>
          </div>
          <form onSubmit={showPasswordStep ? handlePasswordSubmit : handleLoginSubmit}>
            <div className="login-field">
              <label htmlFor="access-code">{showPasswordStep ? "Admin Password" : "Access Code"}</label>
              <input 
                id="access-code"
                type="password" 
                placeholder={showPasswordStep ? "Enter Password" : "Enter Team or Admin Code"}
                value={showPasswordStep ? adminPassword : loginCode}
                onChange={(e) => showPasswordStep ? setAdminPassword(e.target.value) : setLoginCode(e.target.value)}
                autoFocus
                key={showPasswordStep ? "password-input" : "code-input"}
              />
            </div>
            <button type="submit" className="login-submit">
              {showPasswordStep ? "Unlock Admin Access" : "Enter Dashboard"}
            </button>
            {showPasswordStep && (
              <button 
                type="button" 
                className="login-back" 
                onClick={() => { setShowPasswordStep(false); setAdminPassword(''); }}
              >
                Back to Access Code
              </button>
            )}
          </form>
          <div className="login-footer">
            Access restricted to authorized team representatives and administrators.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        userTeam={userTeam}
        setUserTeam={setUserTeam}
        setIsAuthenticated={setIsAuthenticated}
        setShowLogin={setShowLogin}
      />
      
      <main className="main-content">
        {activeTab === 'catalog' ? (
          <>
            <aside className="filters-sidebar">
              <FilterBar filters={filters} setFilters={setFilters} />
            </aside>
            <section className="grid-container">
              <PlayerGrid players={filteredPlayers} auctionRecords={auctionRecords} />
            </section>
          </>
        ) : activeTab === 'admin' ? (
          isAdmin ? (
            <AuctionAdminPanel 
              players={players} 
              auctionRecords={auctionRecords} 
              setAuctionRecords={setAuctionRecords} 
            />
          ) : (
            <div className="auth-required" style={{padding: '3rem', textAlign: 'center', color: '#fff', fontSize: '1.2rem'}}>
              <h2>Admin Access Required</h2>
              <p>Please enter the correct passcode in the navigation tab to unlock.</p>
            </div>
          )
        ) : activeTab === 'anonymous' ? (
          <AnonymousAuction 
            players={players} 
            auctionRecords={auctionRecords} 
            setAuctionRecords={setAuctionRecords} 
            isAdmin={isAdmin}
            userTeam={userTeam}
          />
        ) : activeTab === 'myteam' ? (
          <MyTeam 
            players={players} 
            auctionRecords={auctionRecords} 
            userTeam={userTeam}
          />
        ) : activeTab === 'bags' ? (
          <PlayerBags 
            players={players} 
            auctionRecords={auctionRecords} 
          />
        ) : (
          <TeamRosters 
            players={players} 
            auctionRecords={auctionRecords} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
