import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './FoodCard.css';

const FoodCard = ({ food }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  
  // Find if this item is already in the cart
  const cartItem = cartItems.find((item) => item._id === food._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleIncrement = () => {
    addToCart(food);
  };

  const handleDecrement = () => {
    updateQuantity(food._id, quantity - 1);
  };

  return (
    <div className={`food-card ${!food.isAvailable ? 'unavailable' : ''}`}>
      {/* Category Tag */}
      <span className="food-card-category">{food.category}</span>
      
      {/* Food Image */}
      <Link to={`/food/${food._id}`} className="food-card-image-link">
        <div className="food-card-image-container">
          <img src={food.image} alt={food.name} className="food-card-image" loading="lazy" />
          {!food.isAvailable && <div className="sold-out-overlay">Sold Out</div>}
        </div>
      </Link>

      {/* Info Body */}
      <div className="food-card-body">
        <div className="food-card-header">
          <Link to={`/food/${food._id}`} className="food-card-title-link">
            <h3 className="food-card-title">{food.name}</h3>
          </Link>
          <div className="food-card-rating">
            <Star size={14} className="star-icon" fill="currentColor" />
            <span>{food.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <p className="food-card-desc">{food.description}</p>
        
        {/* Footer actions */}
        <div className="food-card-footer">
          <span className="food-card-price">${food.price.toFixed(2)}</span>
          
          {food.isAvailable && (
            <div className="food-card-actions">
              {quantity > 0 ? (
                <div className="quantity-selector animate-fade-in">
                  <button className="qty-btn qty-btn-dec" onClick={handleDecrement} aria-label="Decrease quantity">
                    <Minus size={14} />
                  </button>
                  <span className="qty-val">{quantity}</span>
                  <button className="qty-btn qty-btn-inc" onClick={handleIncrement} aria-label="Increase quantity">
                    <Plus size={14} />
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary add-to-cart-btn" onClick={handleIncrement}>
                  <ShoppingCart size={16} /> Add
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
