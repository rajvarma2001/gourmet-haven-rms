import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Smartphone, Truck, CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, total, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Local state for delivery details
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  
  // Checkout flow state
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [error, setError] = useState('');

  // Auto prefill profile info
  useEffect(() => {
    if (user) {
      if (user.address) setAddress(user.address);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Prevent accessing checkout with empty cart (unless order was just placed)
  useEffect(() => {
    if (cartItems.length === 0 && !placedOrder) {
      navigate('/cart');
    }
  }, [cartItems, placedOrder, navigate]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!address.trim() || !phone.trim()) {
      setError('Please provide a delivery address and contact number.');
      return;
    }

    setSubmitting(true);
    setError('');

    // Prepare API items payload matching Schema copy
    const itemsPayload = cartItems.map((item) => ({
      foodId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: itemsPayload,
          totalAmount: total,
          deliveryAddress: address,
          contactNumber: phone,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPlacedOrder(data);
        clearCart();
      } else {
        setError(data.message || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error('Submit order error:', err);
      setError('Network error submitting order. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  // If order was successfully placed, render Order Success Confirmation screen
  if (placedOrder) {
    return (
      <div className="checkout-success-page container section-padding animate-fade-in">
        <div className="success-card">
          <div className="success-icon-wrapper animate-bounce">
            <CheckCircle2 size={56} className="success-check-icon" />
          </div>
          <h1 className="success-title">Order Placed Successfully!</h1>
          <p className="success-subtitle">
            Thank you for dining with Gourmet Haven. Our kitchens are already prepping your warm meal!
          </p>

          <div className="success-order-details">
            <div className="success-detail-row">
              <span>Order Number:</span>
              <strong>#{placedOrder._id}</strong>
            </div>
            <div className="success-detail-row">
              <span>Total Paid:</span>
              <strong className="success-amount">₹{placedOrder.totalAmount.toFixed(2)}</strong>
            </div>
            <div className="success-detail-row">
              <span>Delivery Address:</span>
              <span>{placedOrder.deliveryAddress}</span>
            </div>
            <div className="success-detail-row">
              <span>Payment Type:</span>
              <span>{placedOrder.paymentMethod}</span>
            </div>
          </div>

          <div className="success-actions">
            <Link to="/orders" className="btn btn-primary">
              Track Your Orders <ArrowRight size={16} />
            </Link>
            <Link to="/menu" className="btn btn-secondary">
              Back to Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page container section-padding animate-fade-in">
      <div className="checkout-header text-left">
        <h1 className="checkout-title">Checkout</h1>
      </div>

      <div className="checkout-layout">
        {/* Delivery Details Form */}
        <div className="checkout-form-container">
          <form onSubmit={handleSubmitOrder} className="checkout-form">
            <h3 className="section-subtitle-bold">Delivery Address & Contact</h3>
            <hr className="checkout-divider" />
            
            {error && <p className="checkout-error-msg animate-fade-in">{error}</p>}

            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                className="form-input"
                value={user ? user.name : ''}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Contact Number</label>
              <input
                id="phone"
                type="tel"
                className="form-input"
                placeholder="e.g. +1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address">Delivery Address</label>
              <textarea
                id="address"
                rows="3"
                className="form-input form-textarea"
                placeholder="Apt#, Street Address, City, Zipcode..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <h3 className="section-subtitle-bold spacing-top">Payment Method</h3>
            <hr className="checkout-divider" />

            <div className="payment-options-grid">
              <label className={`payment-option ${paymentMethod === 'Cash on Delivery' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="Cash on Delivery"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                  className="radio-hidden"
                />
                <Truck size={20} />
                <div className="payment-opt-info">
                  <span className="payment-opt-title">Cash on Delivery</span>
                  <span className="payment-opt-desc">Pay with cash when food arrives</span>
                </div>
              </label>

              <label className={`payment-option ${paymentMethod === 'UPI' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="radio-hidden"
                />
                <Smartphone size={20} />
                <div className="payment-opt-info">
                  <span className="payment-opt-title">UPI Pay</span>
                  <span className="payment-opt-desc">Scan & Pay using GooglePay/PhonePe</span>
                </div>
              </label>

              <label className={`payment-option ${paymentMethod === 'Credit Card' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="Credit Card"
                  checked={paymentMethod === 'Credit Card'}
                  onChange={() => setPaymentMethod('Credit Card')}
                  className="radio-hidden"
                />
                <CreditCard size={20} />
                <div className="payment-opt-info">
                  <span className="payment-opt-title">Credit / Debit Card</span>
                  <span className="payment-opt-desc">Simulated card swipe payment</span>
                </div>
              </label>
            </div>

            <button type="submit" className="btn btn-primary submit-checkout-btn" disabled={submitting}>
              {submitting ? 'Placing Order...' : `Place Order • ₹${total.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Mini Order Summary */}
        <div className="checkout-sidebar">
          <div className="mini-summary-card">
            <h3 className="mini-summary-title">Order Items</h3>
            <div className="mini-items-list">
              {cartItems.map((item) => (
                <div key={item._id} className="mini-item-row">
                  <span className="mini-item-name">
                    <strong className="mini-item-qty">{item.quantity}x</strong> {item.name}
                  </span>
                  <span className="mini-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <hr className="mini-summary-divider" />

            <div className="mini-summary-total">
              <span>Total Amount</span>
              <span className="mini-total-val">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
