import React, { useState, useEffect } from 'react';
import { Search, ArrowUpDown, RefreshCw } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import CategoryFilter from '../components/CategoryFilter';
import './Menu.css';

const Menu = () => {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch foods from server
  const fetchFoods = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/foods');
      if (res.ok) {
        const data = await res.json();
        setFoods(data);
        setFilteredFoods(data);
      } else {
        setError('Could not retrieve menu dishes. Please try again.');
      }
    } catch (err) {
      console.error('Menu load error:', err);
      setError('Network error loading menu. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // Filter & Search logic
  useEffect(() => {
    let result = [...foods];

    // Filter by Category
    if (activeCategory !== 'All') {
      result = result.filter((item) => item.category === activeCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    // Sort Logic
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-desc') {
      result.sort((a, b) => b.rating - a.rating);
    }

    setFilteredFoods(result);
  }, [activeCategory, searchQuery, sortBy, foods]);

  return (
    <div className="menu-page container section-padding animate-fade-in">
      {/* Top Banner Header */}
      <div className="menu-header text-center">
        <h1 className="menu-title">Our Gourmet Menu</h1>
        <p className="menu-subtitle">Explore our diverse menu featuring fresh ingredients and crafted dishes.</p>
      </div>

      {/* Controls Bar: Search, Category, Sorting */}
      <div className="menu-controls">
        {/* Search Bar input */}
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search for dishes, ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Sorting Dropdown */}
        <div className="sort-dropdown-wrapper">
          <ArrowUpDown size={18} className="sort-icon" />
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Sort by: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Rating: Highest First</option>
          </select>
        </div>
      </div>

      {/* Categories Pills */}
      <CategoryFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      {/* Grid listing */}
      {loading ? (
        <div className="loading-spinner-box">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="menu-error-box animate-fade-in">
          <p className="error-message">{error}</p>
          <button className="btn btn-secondary" onClick={fetchFoods}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      ) : filteredFoods.length > 0 ? (
        <div className="menu-grid animate-fade-in">
          {filteredFoods.map((food) => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>
      ) : (
        <div className="menu-empty-box">
          <h3>No dishes found</h3>
          <p>We couldn't find any dishes matching your criteria. Try adjusting your filters or search keywords.</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setActiveCategory('All');
              setSearchQuery('');
              setSortBy('default');
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Menu;
