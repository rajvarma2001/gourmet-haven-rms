import React, { useState } from 'react';
import { Calendar, MapPin, Phone, DollarSign, Clock, Printer, X } from 'lucide-react';
import './OrderCard.css';

const OrderCard = ({ order }) => {
  const [showInvoice, setShowInvoice] = useState(false);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateBreakdown = () => {
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const deliveryFee = (subtotal > 0 && subtotal < 40) ? 5.00 : 0.00;
    const expectedTotal = subtotal + tax + deliveryFee;
    const discount = expectedTotal > order.totalAmount ? (expectedTotal - order.totalAmount) : 0;
    return {
      subtotal,
      tax,
      deliveryFee,
      discount,
      total: order.totalAmount
    };
  };

  const breakdown = calculateBreakdown();

  // Helper to determine progress bar width & label class
  const getStatusProgress = (status) => {
    switch (status) {
      case 'Placed': return { width: '25%', class: 'badge-placed' };
      case 'Preparing': return { width: '50%', class: 'badge-preparing' };
      case 'Out for Delivery': return { width: '75%', class: 'badge-delivery' };
      case 'Delivered': return { width: '100%', class: 'badge-delivered' };
      default: return { width: '0%', class: '' };
    }
  };

  const progress = getStatusProgress(order.status);

  return (
    <div className="order-card animate-slide-up">
      {/* Card Header */}
      <div className="order-card-header">
        <div className="order-meta-info">
          <span className="order-id-label">ORDER ID</span>
          <span className="order-id">#{order._id}</span>
        </div>
        <span className={`badge ${progress.class}`}>{order.status}</span>
      </div>

      {/* Date */}
      <div className="order-card-date">
        <Calendar size={14} />
        <span>{formatDate(order.createdAt)}</span>
      </div>

      {/* Visual Tracking Bar */}
      <div className="order-tracking-container">
        <div className="order-tracking-bar">
          <div className="order-tracking-fill" style={{ width: progress.width }}></div>
        </div>
        <div className="order-tracking-steps">
          <span className={`step-dot ${['Placed', 'Preparing', 'Out for Delivery', 'Delivered'].indexOf(order.status) >= 0 ? 'active' : ''}`} title="Placed">Placed</span>
          <span className={`step-dot ${['Preparing', 'Out for Delivery', 'Delivered'].indexOf(order.status) >= 1 ? 'active' : ''}`} title="Preparing">Preparing</span>
          <span className={`step-dot ${['Out for Delivery', 'Delivered'].indexOf(order.status) >= 2 ? 'active' : ''}`} title="Out for Delivery">On the Way</span>
          <span className={`step-dot ${order.status === 'Delivered' ? 'active' : ''}`} title="Delivered">Delivered</span>
        </div>
      </div>

      {/* Items list */}
      <div className="order-card-items">
        <h5 className="items-title">Items Ordered</h5>
        <div className="items-list">
          {order.items.map((item, idx) => (
            <div key={item.foodId || idx} className="order-item-detail">
              <span className="item-qty-name">
                <strong className="item-qty">{item.quantity}x</strong> {item.name}
              </span>
              <span className="item-price-calc">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact & Address */}
      <div className="order-card-details">
        <div className="detail-row">
          <MapPin size={14} className="detail-icon" />
          <span className="detail-text">{order.deliveryAddress}</span>
        </div>
        <div className="detail-row">
          <Phone size={14} className="detail-icon" />
          <span className="detail-text">{order.contactNumber}</span>
        </div>
        <div className="detail-row">
          <Clock size={14} className="detail-icon" />
          <span className="detail-text">Paid via: <strong>{order.paymentMethod}</strong></span>
        </div>
      </div>

      {/* Total Footer */}
      <div className="order-card-footer">
        <div className="footer-price-group">
          <span className="footer-label">Total Amount</span>
          <span className="footer-total">₹{order.totalAmount.toFixed(2)}</span>
        </div>
        <button className="btn btn-secondary btn-sm invoice-btn" onClick={() => setShowInvoice(true)}>
          View Invoice
        </button>
      </div>

      {/* Invoice Details Modal Popup */}
      {showInvoice && (
        <div className="invoice-print-overlay modal-overlay animate-fade-in">
          <div className="modal-card modal-lg invoice-modal animate-slide-up">
            <div className="modal-header">
              <div className="invoice-header-title">
                <h3 className="invoice-brand"><span className="brand-accent">Gourmet</span>Haven</h3>
                <span className="invoice-badge">INVOICE</span>
              </div>
              <button className="modal-close" onClick={() => setShowInvoice(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="invoice-body">
              {/* Invoice Meta */}
              <div className="invoice-meta-row">
                <div className="invoice-meta-col">
                  <span className="invoice-label">Invoice Number</span>
                  <span className="invoice-val">#INV-{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                </div>
                <div className="invoice-meta-col">
                  <span className="invoice-label">Date Placed</span>
                  <span className="invoice-val">{formatDate(order.createdAt)}</span>
                </div>
                <div className="invoice-meta-col">
                  <span className="invoice-label">Payment Method</span>
                  <span className="invoice-val">{order.paymentMethod}</span>
                </div>
                <div className="invoice-meta-col">
                  <span className="invoice-label">Order Status</span>
                  <span className={`invoice-val status-pill status-${order.status.toLowerCase().replace(/ /g, '-')}`}>{order.status}</span>
                </div>
              </div>

              <hr className="invoice-divider" />

              {/* Bill To & Ship To */}
              <div className="invoice-parties">
                <div className="invoice-party-col">
                  <span className="invoice-label">From:</span>
                  <strong className="party-name">Gourmet Haven Restaurant</strong>
                  <span className="party-text">100 Culinary Blvd, Suite A</span>
                  <span className="party-text">Gourmet City, GC 12345</span>
                  <span className="party-text">Phone: +1 (555) 123-4567</span>
                </div>
                <div className="invoice-party-col">
                  <span className="invoice-label">Deliver To:</span>
                  <strong className="party-name">{order.userName || 'Valued Customer'}</strong>
                  <span className="party-text">{order.deliveryAddress}</span>
                  <span className="party-text">Phone: {order.contactNumber}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="invoice-table-wrapper">
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item Description</th>
                      <th className="text-right">Price</th>
                      <th className="text-center">Qty</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <div className="invoice-item-desc">
                            <span className="invoice-item-name">{item.name}</span>
                          </div>
                        </td>
                        <td className="text-right">₹{item.price.toFixed(2)}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculations & Summary */}
              <div className="invoice-summary-block">
                <div className="invoice-summary-col">
                  <span className="invoice-label">Terms & Notes:</span>
                  <p className="invoice-note">Thank you for dining with Gourmet Haven! All hot meals are freshly prepared and delivered within 45 minutes.</p>
                </div>
                <div className="invoice-summary-col summary-right">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{breakdown.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>GST / Tax (5%)</span>
                    <span>₹{breakdown.tax.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery Fee</span>
                    <span>{breakdown.deliveryFee > 0 ? `₹${breakdown.deliveryFee.toFixed(2)}` : 'FREE'}</span>
                  </div>
                  {breakdown.discount > 0 && (
                    <div className="summary-row discount-row">
                      <span>Promo Discount</span>
                      <span>-₹{breakdown.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <hr className="summary-divider" />
                  <div className="summary-row grand-total-row">
                    <span>Grand Total</span>
                    <span>₹{breakdown.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Tracking Bar in Modal */}
            <div className="invoice-progress-section screen-only">
              <span className="invoice-label">Delivery Progress</span>
              <div className="invoice-progress-bar-container">
                <div className="invoice-progress-bar-outer">
                  <div 
                    className="invoice-progress-bar-inner animate-pulse" 
                    style={{ width: progress.width }}
                  ></div>
                </div>
                <div className="invoice-progress-labels">
                  <span className={['Placed', 'Preparing', 'Out for Delivery', 'Delivered'].indexOf(order.status) >= 0 ? 'active-step' : ''}>Placed</span>
                  <span className={['Preparing', 'Out for Delivery', 'Delivered'].indexOf(order.status) >= 1 ? 'active-step' : ''}>Prepping</span>
                  <span className={['Out for Delivery', 'Delivered'].indexOf(order.status) >= 2 ? 'active-step' : ''}>On Way</span>
                  <span className={order.status === 'Delivered' ? 'active-step' : ''}>Arrived</span>
                </div>
              </div>
            </div>

            {/* Invoice Actions */}
            <div className="invoice-actions screen-only">
              <button className="btn btn-primary invoice-print-btn" onClick={() => window.print()}>
                <Printer size={16} /> Print Receipt
              </button>
              <button className="btn btn-secondary invoice-close-btn" onClick={() => setShowInvoice(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
