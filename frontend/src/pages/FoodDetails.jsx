import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, MessageSquare, Plus, Minus, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './FoodDetails.css';

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { cartItems, addToCart, updateQuantity } = useCart();

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  // Fetch food item details
  const fetchFoodDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/foods/${id}`);
      if (!res.ok) {
        throw new Error('Dish details could not be found.');
      }
      const data = await res.json();
      setFood(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-spinner-box">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="container food-details-page">
        <div className="orders-error-box">
          <AlertCircle size={40} className="danger-text" />
          <h2>Error Loading Dish</h2>
          <p>{error || 'The requested dish is not available.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/menu')}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Cart operations helper
  const cartItem = cartItems.find((item) => item._id === food._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleIncrement = () => {
    addToCart(food);
  };

  const handleDecrement = () => {
    updateQuantity(food._id, quantity - 1);
  };

  // Submit Review handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (!comment.trim()) {
      setReviewErrorMsg('Please add a comment for your review.');
      return;
    }

    setReviewSubmitLoading(true);
    setReviewSuccessMsg('');
    setReviewErrorMsg('');

    try {
      const res = await fetch(`/api/foods/${food._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();

      if (res.ok) {
        setReviewSuccessMsg('Thank you! Your review has been submitted.');
        setComment('');
        setRating(5);
        // Refresh local food details to show the new review immediately
        setFood(data);
      } else {
        setReviewErrorMsg(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      setReviewErrorMsg('Server error. Please try again later.');
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  const formattedDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container food-details-page animate-fade-in">
      {/* Back navigation */}
      <div className="back-to-menu-btn" onClick={() => navigate('/menu')}>
        <ArrowLeft size={16} /> Back to Menu
      </div>

      {/* Main product card */}
      <div className="details-grid">
        <div className="details-image-panel">
          <img src={food.image} alt={food.name} className="details-image" />
          <span className="details-category-tag">{food.category}</span>
        </div>

        <div className="details-info-panel">
          <div className="details-header-row">
            <h1 className="details-title">{food.name}</h1>
            <div className="details-rating-row">
              <div className="details-rating-badge">
                <Star size={14} fill="currentColor" />
                <span>{food.rating.toFixed(1)}</span>
              </div>
              <span className="details-review-count">
                ({food.reviews ? food.reviews.length : 0} customer reviews)
              </span>
            </div>
          </div>

          <div className="details-price">${food.price.toFixed(2)}</div>
          <p className="details-desc">{food.description}</p>

          <div className="details-meta-list">
            <div className="details-meta-item">
              <span>Category:</span>
              <strong>{food.category}</strong>
            </div>
            <div className="details-meta-item">
              <span>Availability:</span>
              <strong className={food.isAvailable ? 'success-text' : 'danger-text'}>
                {food.isAvailable ? 'In Stock' : 'Out of Stock'}
              </strong>
            </div>
          </div>

          {/* Add to cart section */}
          {food.isAvailable && (
            <div className="details-purchase-row">
              {quantity > 0 ? (
                <>
                  <div className="quantity-selector">
                    <button className="qty-btn" onClick={handleDecrement} aria-label="Decrease quantity">
                      <Minus size={16} />
                    </button>
                    <span className="qty-val">{quantity}</span>
                    <button className="qty-btn" onClick={handleIncrement} aria-label="Increase quantity">
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="qty-label-info">In Cart</span>
                </>
              ) : (
                <button className="btn btn-primary add-to-cart-btn" onClick={handleIncrement}>
                  <ShoppingCart size={16} style={{ marginRight: '8px' }} /> Add to Cart
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reviews section */}
      <div className="reviews-section">
        <h2 className="reviews-section-title">Customer Reviews & Feedback</h2>
        
        <div className="reviews-layout-grid">
          {/* Review List */}
          <div className="reviews-list-container">
            {(!food.reviews || food.reviews.length === 0) ? (
              <div className="reviews-empty-state">
                <MessageSquare size={32} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
                <p>No reviews yet for this dish. Be the first to share your experience!</p>
              </div>
            ) : (
              food.reviews.slice().reverse().map((rev) => (
                <div key={rev._id} className="review-comment-card animate-fade-in">
                  <div className="review-comment-header">
                    <span className="reviewer-name">{rev.userName}</span>
                    <span className="review-date">{formattedDate(rev.createdAt)}</span>
                  </div>
                  <div className="review-rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < rev.rating ? "currentColor" : "none"} 
                        stroke="currentColor" 
                      />
                    ))}
                  </div>
                  <p className="review-comment-text">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Write a Review Block */}
          <div className="reviews-form-panel">
            {token ? (
              <div className="write-review-card">
                <h3 className="write-review-title">Leave a Review</h3>
                
                {reviewSuccessMsg && (
                  <div className="write-review-alert alert-success">
                    <CheckCircle size={16} /> {reviewSuccessMsg}
                  </div>
                )}
                {reviewErrorMsg && (
                  <div className="write-review-alert alert-danger">
                    <AlertCircle size={16} /> {reviewErrorMsg}
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="write-review-form">
                  {/* Star selection */}
                  <div className="form-group">
                    <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Rating</label>
                    <div className="rating-selection-box">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={24}
                          className={`star-interactive ${
                            (hoverRating || rating) >= star ? 'selected' : ''
                          }`}
                          fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                        />
                      ))}
                      <span style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                        {rating} Star{rating > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="reviewComment">Review Comment</label>
                    <textarea
                      id="reviewComment"
                      className="form-input form-textarea"
                      placeholder="Write your feedback about this dish..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary submit-review-btn"
                    disabled={reviewSubmitLoading}
                  >
                    {reviewSubmitLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="review-login-prompt">
                <MessageSquare size={32} style={{ color: 'var(--primary)' }} />
                <h3>Share Your Feedback</h3>
                <p>Have you tried this dish? Log in to your Gourmet Haven account to share your thoughts with others.</p>
                <Link to="/login" className="btn btn-outline" style={{ marginTop: '8px' }}>
                  Log In to Review
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetails;
