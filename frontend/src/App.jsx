import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare } from 'lucide-react';
import Dashboard from './components/Dashboard';
import DataReview from './components/DataReview';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav style={{ 
      background: 'rgba(15, 23, 42, 0.8)', 
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      padding: '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
          <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, var(--success), #34d399)', borderRadius: '50%' }}></div>
          Breathe ESG
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/" style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            color: location.pathname === '/' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: location.pathname === '/' ? 600 : 400
          }}>
            <LayoutDashboard size={18} /> Overview
          </Link>
          <Link to="/review" style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            color: location.pathname === '/review' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: location.pathname === '/review' ? 600 : 400
          }}>
            <CheckSquare size={18} /> Data Review
          </Link>
        </div>
        <div>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            A
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/review" element={<DataReview />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
