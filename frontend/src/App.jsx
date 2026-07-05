import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Login from './pages/Login';
import FoodDetails from './pages/FoodDetails';
import { useAuth } from './context/AuthContext';
import './App.css';

// Protected Route Wrapper for general users
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner-box container section-padding text-center">
        <div className="spinner"></div>
        <p style={{ marginTop: '16px' }}>Loading session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Protected Route Wrapper
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner-box container section-padding text-center">
        <div className="spinner"></div>
        <p style={{ marginTop: '16px' }}>Loading session...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="app-container">
      {/* Shared Header Navigation */}
      <Navbar />
      
      {/* Page Routing */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/food/:id" element={<FoodDetails />} />
          
          {/* Protected Customer Routes */}
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Administrative Routes */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } 
          />

          {/* 404 Fallback routing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Shared Footer block */}
      <footer className="app-footer">
        <div className="container footer-grid">
          <div>
            <h4 className="footer-brand"><span style={{ color: 'var(--primary)' }}>Gourmet</span>Haven</h4>
            <p className="footer-desc">Exquisite dining delivered instantly. Fresh ingredients and premium recipes crafted by master chefs.</p>
          </div>
          <div>
            <h5>Quick Links</h5>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/menu">Browse Menu</Link></li>
              <li><Link to="/cart">My Cart</Link></li>
            </ul>
          </div>
          <div>
            <h5>Test Credentials</h5>
            <p className="footer-creds">
              Admin: <strong>admin@haven.com</strong> / <strong>admin123</strong> <br />
              Customer: <strong>customer@haven.com</strong> / <strong>cust123</strong> (or sign up!)
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Gourmet Haven Restaurant Group. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
