import { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import PlayerGrid from './components/PlayerGrid';
import './App.css';

function App() {
  const [players, setPlayers] = useState([]);
  const [filters, setFilters] = useState({
    role: 'All',
    origin: 'All',
    rating: 'All',
    price: 'All'
  });

  useEffect(() => {
    fetch('/players.json')
      .then(res => res.json())
      .then(data => setPlayers(data))
      .catch(err => console.error("Failed to load players data", err));
  }, []);

  // Helper to parse ₹1,50,00,000 string to Lakhs integer (e.g. 150)
  const parsePriceToLakhs = (priceStr) => {
    if (!priceStr) return 0;
    const numStr = priceStr.replace(/[^0-9]/g, '');
    return parseInt(numStr, 10) / 100000;
  };

  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      // Role Filter
      if (filters.role !== 'All' && p.role !== filters.role) return false;
      
      // Origin Filter
      if (filters.origin !== 'All' && p.overseas !== filters.origin) return false;

      // Rating Filter
      if (filters.rating !== 'All') {
        const ratingRequired = parseInt(filters.rating, 10);
        if (p.rating < ratingRequired) return false;
      }

      // Price Filter
      if (filters.price !== 'All') {
        const maxLakhs = parseInt(filters.price, 10);
        const playerLakhs = parsePriceToLakhs(p.basePrice);
        if (playerLakhs > maxLakhs) return false;
      }

      return true;
    });
  }, [players, filters]);

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        <aside className="filters-sidebar">
          <FilterBar filters={filters} setFilters={setFilters} />
        </aside>

        <section className="grid-container">
          <PlayerGrid players={filteredPlayers} />
        </section>
      </main>
    </div>
  );
}

export default App;
