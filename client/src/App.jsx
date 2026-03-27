import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import CatalogPage from './pages/CatalogPage';
import AuctionRoomPage from './pages/AuctionRoomPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CatalogPage />} />
          <Route path="auction" element={<AuctionRoomPage />} />
          <Route path="admin" element={<AdminDashboardPage />} />
          {/* Fallback */}
          <Route path="*" element={<div className="p-20 text-center text-3xl opacity-50">Coming Soon...</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
