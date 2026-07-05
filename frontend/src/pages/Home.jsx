import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Award, ShieldCheck, Star } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import './Home.css';

const Home = () => {
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch some top-rated foods for display on landing
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/foods');
        if (res.ok) {
          const data = await res.json();
          // Filter out the top 3 items
          const topRated = data
            .filter((item) => item.isAvailable)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3);
          setFeaturedFoods(topRated);
        }
      } catch (err) {
        console.error('Error fetching featured foods:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="home-page animate-fade-in">
      {/* Hero Banner Section */}
      <section className="hero-section">
        <div className="hero-container container">
          <div className="hero-content">
            <span className="hero-badge">50% OFF YOUR FIRST ORDER</span>
            <h1 className="hero-title">
              Savor the Art of <br />
              <span className="hero-title-accent">Exquisite Dining</span>
            </h1>
            <p className="hero-subtitle">
              Experience the finest gourmet recipes crafted by master chefs, delivered fresh and warm directly to your doorstep in minutes.
            </p>
            <div className="hero-actions">
              <Link to="/menu" className="btn btn-primary btn-lg">
                Explore Our Menu <ArrowRight size={18} />
              </Link>
              <a href="#features" className="btn btn-secondary btn-lg">
                Why Us?
              </a>
            </div>
          </div>
          
          <div className="hero-graphic-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=700" 
              alt="Gourmet Platter" 
              className="hero-img animate-slide-up"
            />
          </div>
        </div>
      </section>

      {/* Brand Values / Features */}
      <section id="features" className="features-section section-padding">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Our Cooking Philosophy</h2>
            <p className="section-subtitle">We hold our service and recipes to the absolute highest premium standards.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box bg-orange">
                <Award size={28} className="feature-icon" />
              </div>
              <h3 className="feature-title">Gourmet Masterchefs</h3>
              <p className="feature-text">
                Our recipes are crafted by top chefs with decades of experience in high-end culinary arts.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box bg-yellow">
                <Clock size={28} className="feature-icon" />
              </div>
              <h3 className="feature-title">Ultra-Fast Delivery</h3>
              <p className="feature-text">
                Cooked instantly upon ordering and dispatched immediately in specialized thermal containers.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box bg-green">
                <ShieldCheck size={28} className="feature-icon" />
              </div>
              <h3 className="feature-title">Hygiene & Safety</h3>
              <p className="feature-text">
                Strict sanitization checks, triple-layered packaging, and fully contact-free delivery options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Foods */}
      <section className="featured-section section-padding">
        <div className="container">
          <div className="section-header-row">
            <div className="section-header">
              <h2 className="section-title">Chef's Top Selections</h2>
              <p className="section-subtitle">Our most popular and highest rated culinary masterpieces.</p>
            </div>
            <Link to="/menu" className="btn btn-outline">
              View Full Menu <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="loading-spinner-box">
              <div className="spinner"></div>
            </div>
          ) : featuredFoods.length > 0 ? (
            <div className="featured-grid">
              {featuredFoods.map((food) => (
                <div key={food._id} className="featured-card-wrapper">
                  <FoodCard food={food} />
                </div>
              ))}
            </div>
          ) : (
            <div className="no-featured-foods">
              <p>Check back soon! We are updating our special items.</p>
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews / Testimonials */}
      <section className="reviews-section section-padding">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">What Our Guests Say</h2>
            <p className="section-subtitle">Read real reviews from our dining community.</p>
          </div>

          <div className="reviews-grid">
            <div className="review-card">
              <div className="review-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" className="review-star" />
                ))}
              </div>
              <p className="review-text">
                "The Truffle Mushroom Pizza was absolutely divine! The crust was incredibly light and airy, and the truffle fragrance was intense. Gourmet Haven is my absolute favorite place to order."
              </p>
              <div className="review-user">
                <div className="review-avatar">SM</div>
                <div className="review-user-info">
                  <h4 className="review-user-name">Sarah Mitchell</h4>
                  <span className="review-user-role">Verified Gourmet Enthusiast</span>
                </div>
              </div>
            </div>

            <div className="review-card">
              <div className="review-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" className="review-star" />
                ))}
              </div>
              <p className="review-text">
                "Fastest delivery I have ever experienced. The Wagyu Signature Burger arrived steaming hot, cheese perfectly melted, and bun soft. Highly recommend the avocado chicken too!"
              </p>
              <div className="review-user">
                <div className="review-avatar">JD</div>
                <div className="review-user-info">
                  <h4 className="review-user-name">James Davidson</h4>
                  <span className="review-user-role">Verified Food Critic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
