import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartItems from '../components/CartItems';
import './Cart.css';

const Cart = () => {
  const { 
    cartItems, 
    promoCode, 
    promoError, 
    discountAmount, 
    subtotal, 
    tax, 
    deliveryFee, 
    total, 
    applyPromo, 
    removePromo 
  } = useCart();

  const { user } = useAuth();
  const [promoInput, setPromoInput] = useState('');
  const navigate = useNavigate();

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoInput.trim()) {
      const success = applyPromo(promoInput);
      if (success) {
        setPromoInput('');
      }
    }
  };

  const handleCheckoutClick = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };

  return (
    <div className="cart-page container section-padding animate-fade-in">
      <div className="cart-header text-left">
        <h1 className="cart-title">Your Cart</h1>
      </div>

      {cartItems.length > 0 ? (
        <div className="cart-layout">
          {/* Items list */}
          <div className="cart-main">
            <CartItems />
            
            <div className="cart-actions-row">
              <Link to="/menu" className="btn btn-secondary">
                Continue Ordering
              </Link>
            </div>
          </div>

          {/* Pricing calculations sidebar */}
          <div className="cart-sidebar">
            <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>

              {/* Promo input */}
              <div className="promo-section">
                {promoCode ? (
                  <div className="promo-applied animate-fade-in">
                    <div className="promo-badge-text">
                      <Tag size={14} />
                      <span>{promoCode} Applied</span>
                    </div>
                    <button className="remove-promo-btn" onClick={removePromo} aria-label="Remove promo">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="promo-form">
                    <input
                      type="text"
                      className="form-input promo-input"
                      placeholder="Promo code (e.g. WELCOME10)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                    />
                    <button type="submit" className="btn btn-secondary promo-btn">
                      Apply
                    </button>
                  </form>
                )}
                {promoError && <p className="promo-error animate-fade-in">{promoError}</p>}
              </div>

              {/* Pricing table */}
              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="summary-row discount-row animate-fade-in">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Estimated Tax (5%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'FREE'}</span>
                </div>
                
                {deliveryFee > 0 && (
                  <p className="delivery-free-notice">
                    Add <strong>${(40 - subtotal).toFixed(2)}</strong> more to get free delivery!
                  </p>
                )}

                <hr className="summary-divider" />
                
                <div className="summary-row total-row">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button className="btn btn-primary btn-checkout" onClick={handleCheckoutClick}>
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="cart-empty-state animate-fade-in">
          <div className="empty-icon-box">
            <ShoppingBag size={48} />
          </div>
          <h2>Your Cart is Empty</h2>
          <p>Browse our gourmet menu and select your favorite dishes to start ordering.</p>
          <Link to="/menu" className="btn btn-primary">
            Explore Menu
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;
