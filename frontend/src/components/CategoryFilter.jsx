import React from 'react';
import './CategoryFilter.css';

const CategoryFilter = ({ activeCategory, setActiveCategory }) => {
  const categories = ['All', 'Pizzas', 'Burgers', 'Pastas', 'Desserts', 'Drinks'];

  return (
    <div className="category-filter-container">
      <div className="category-filter">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-pill ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
