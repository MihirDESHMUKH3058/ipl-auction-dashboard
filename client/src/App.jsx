import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import LobbyPage from './pages/LobbyPage';
import CatalogPage from './pages/CatalogPage';
import AuctionRoomPage from './pages/AuctionRoomPage';
import TeamsDashboardPage from './pages/TeamsDashboardPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProjectorPage from './pages/ProjectorPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Main Application with Sidebar/Nav Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<LobbyPage />} />
          <Route path="teams" element={<TeamsDashboardPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="auction" element={<AuctionRoomPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="admin" element={<AdminDashboardPage />} />
        </Route>

        {/* Projector View (No Sidebar/Nav for clean broadcast) */}
        <Route path="/projector" element={<ProjectorPage />} />

        {/* Fallback */}
        <Route path="*" element={<div className="p-20 text-center text-3xl opacity-50 font-headline font-black uppercase text-white">404 • Page Not Found</div>} />
      </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
