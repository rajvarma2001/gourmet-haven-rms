import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartItems.css';

const CartItems = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  if (cartItems.length === 0) {
    return <div className="cart-empty-message">Your cart is empty. Add delicious items from the menu!</div>;
  }

  return (
    <div className="cart-items-list">
      {cartItems.map((item) => (
        <div key={item._id} className="cart-item-row animate-fade-in">
          {/* Item Image */}
          <div className="cart-item-image-wrapper">
            <img src={item.image} alt={item.name} className="cart-item-img" />
          </div>

          {/* Item Info */}
          <div className="cart-item-details">
            <h4 className="cart-item-name">{item.name}</h4>
            <p className="cart-item-category">{item.category}</p>
            <span className="cart-item-unit-price">₹{item.price.toFixed(2)}</span>
          </div>

          {/* Item Quantity Controller */}
          <div className="cart-item-quantity">
            <button 
              className="qty-btn qty-btn-dec" 
              onClick={() => updateQuantity(item._id, item.quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus size={12} />
            </button>
            <span className="cart-qty-val">{item.quantity}</span>
            <button 
              className="qty-btn qty-btn-inc" 
              onClick={() => updateQuantity(item._id, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Item Subtotal Price */}
          <div className="cart-item-subtotal">
            ₹{(item.price * item.quantity).toFixed(2)}
          </div>

          {/* Delete Action Button */}
          <button 
            className="cart-item-remove-btn" 
            onClick={() => removeFromCart(item._id)}
            aria-label="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default CartItems;
