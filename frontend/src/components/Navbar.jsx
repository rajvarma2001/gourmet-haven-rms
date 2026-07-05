import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, X, ShieldAlert, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <span className="brand-accent">Gourmet</span>Haven
        </Link>

        {/* Hamburger Icon */}
        <button className="mobile-toggle" onClick={toggleMobileMenu} aria-label="Toggle navigation">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Nav Links */}
        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
            Home
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
            Menu
          </NavLink>
          {user && (
            <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
              My Orders
            </NavLink>
          )}
          {user && user.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link admin-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
              <ShieldAlert size={16} /> Admin Panel
            </NavLink>
          )}

          {/* Mobile Profile Actions */}
          <div className="mobile-profile-actions">
            {user ? (
              <>
                <Link to="/profile" className="nav-link" onClick={closeMobileMenu}>
                  Profile ({user.name})
                </Link>
                <button className="btn btn-secondary mobile-logout" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary mobile-signin" onClick={closeMobileMenu}>
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Action Icons */}
        <div className="nav-actions">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn" 
            aria-label="Toggle dark/light theme"
          >
            {theme === 'light' ? <Moon size={20} className="hover-wiggle" /> : <Sun size={20} className="hover-wiggle" />}
          </button>

          {/* Cart Icon */}
          <Link to="/cart" className="cart-icon-btn" aria-label="Shopping Cart">
            <ShoppingBag size={22} className="hover-wiggle" />
            {cartCount > 0 && <span className="cart-badge animate-fade-in">{cartCount}</span>}
          </Link>

          {/* User Profile Dropdown (Desktop) */}
          <div className="profile-dropdown-container" ref={dropdownRef}>
            {user ? (
              <>
                <button 
                  className="profile-btn" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-label="User profile options"
                >
                  <User size={20} />
                  <span className="profile-name">{user.name.split(' ')[0]}</span>
                </button>
                {dropdownOpen && (
                  <div className="profile-dropdown animate-slide-up">
                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      My Profile
                    </Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      My Orders
                    </Link>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item logout-btn" onClick={handleLogout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="btn btn-primary signin-btn">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
