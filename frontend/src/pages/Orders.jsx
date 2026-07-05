import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import OrderCard from '../components/OrderCard';
import './Orders.css';

const Orders = () => {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders/myorders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        setError('Failed to fetch your orders. Please try again.');
      }
    } catch (err) {
      console.error('Fetch my orders error:', err);
      setError('Network error fetching orders. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <div className="orders-page container section-padding animate-fade-in">
      <div className="orders-header text-left">
        <h1 className="orders-title">Your Order History</h1>
      </div>

      {loading ? (
        <div className="loading-spinner-box">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="orders-error-box text-center">
          <p className="error-message">{error}</p>
          <button className="btn btn-secondary" onClick={fetchOrders}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      ) : orders.length > 0 ? (
        <div className="orders-grid animate-fade-in">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      ) : (
        <div className="orders-empty-state text-center animate-fade-in">
          <div className="empty-icon-box">
            <ClipboardList size={48} />
          </div>
          <h2>No Orders Placed Yet</h2>
          <p>You haven't ordered anything yet. Head over to our menu to place your first order!</p>
          <Link to="/menu" className="btn btn-primary">
            Explore Menu <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Orders;
