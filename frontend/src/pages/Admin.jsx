import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingBasket, 
  TrendingUp, 
  CheckSquare, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  RefreshCw,
  Search,
  Filter,
  Eye,
  User,
  Phone,
  MapPin,
  Lock,
  Save,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  LayoutDashboard,
  ShieldCheck,
  Tag,
  Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const Admin = () => {
  const { token, user, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Tab state: 'dashboard', 'orders', 'menu', 'profile'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Backend data states
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Orders Tab filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null); // Details modal state

  // Menu Tab filters & states
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('All');
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'Pizzas',
    rating: '4.5',
    isAvailable: true,
  });

  // Admin Profile Tab Form states
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminAddress, setAdminAddress] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Prefill admin profile data
  useEffect(() => {
    if (user) {
      setAdminName(user.name);
      setAdminPhone(user.phone || '');
      setAdminAddress(user.address || '');
    }
  }, [user]);

  // Fetch metrics & items
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Analytics
      const resAnalytics = await fetch('/api/orders/analytics', { headers });
      const dataAnalytics = await resAnalytics.json();

      // 2. Fetch Orders
      const resOrders = await fetch('/api/orders', { headers });
      const dataOrders = await resOrders.json();

      // 3. Fetch Food Items
      const resFoods = await fetch('/api/foods');
      const dataFoods = await resFoods.json();

      if (resAnalytics.ok && resOrders.ok && resFoods.ok) {
        setAnalytics(dataAnalytics);
        setOrders(dataOrders);
        setMenuItems(dataFoods);
      } else {
        setError('Error loading administrative data. Please reload.');
      }
    } catch (err) {
      console.error('Admin loading error:', err);
      setError('Network error fetching administrative details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user && user.role === 'admin') {
      fetchData();
    }
  }, [token, user]);

  // Update order status (from list or details modal)
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        
        // Update local orders state
        setOrders((prev) => prev.map((o) => (o._id === orderId ? updatedOrder : o)));
        
        // Update selected modal order state if currently open
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(updatedOrder);
        }

        // Refresh analytics totals
        const resAnalytics = await fetch('/api/orders/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resAnalytics.ok) {
          const dataAnalytics = await resAnalytics.json();
          setAnalytics(dataAnalytics);
        }
      } else {
        alert('Could not update order status.');
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  // Toggle food availability instantly from the list
  const handleToggleAvailability = async (item) => {
    const updatedAvailable = !item.isAvailable;
    try {
      const res = await fetch(`/api/foods/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: updatedAvailable }),
      });

      if (res.ok) {
        const data = await res.json();
        setMenuItems((prev) => prev.map((f) => (f._id === item._id ? data : f)));
      } else {
        alert('Failed to toggle food availability.');
      }
    } catch (err) {
      console.error('Toggle availability error:', err);
    }
  };

  // CRUD Actions
  const handleEditClick = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: item.image,
      category: item.category,
      rating: item.rating.toString(),
      isAvailable: item.isAvailable,
    });
    setShowItemForm(true);
  };

  const handleCreateClick = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'Pizzas',
      rating: '4.5',
      isAvailable: true,
    });
    setShowItemForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editingItem ? `/api/foods/${editingItem._id}` : '/api/foods';
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const item = await res.json();
        if (editingItem) {
          setMenuItems((prev) => prev.map((f) => (f._id === editingItem._id ? item : f)));
        } else {
          setMenuItems((prev) => [...prev, item]);
        }
        setShowItemForm(false);
        fetchData(); // Reload analytics
      } else {
        const data = await res.json();
        alert(data.message || 'Save failed');
      }
    } catch (err) {
      console.error('Menu save error:', err);
    }
  };

  const handleDeleteItem = (itemId) => {
    setDeleteConfirmId(itemId);
  };

  const executeDeleteItem = async (itemId) => {
    try {
      const res = await fetch(`/api/foods/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setMenuItems((prev) => prev.filter((f) => f._id !== itemId));
      } else {
        const data = await res.json();
        alert(data.message || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete item error:', err);
      alert('Network error deleting item');
    }
  };

  // Profile Update Form
  const handleUpdateAdminProfile = async (e) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    if (adminPassword && adminPassword !== adminConfirmPassword) {
      setProfileErrorMsg('Passwords do not match.');
      return;
    }

    setProfileUpdating(true);
    const payload = { name: adminName, phone: adminPhone, address: adminAddress };
    if (adminPassword) {
      payload.password = adminPassword;
    }

    const result = await updateProfile(payload);
    setProfileUpdating(false);

    if (result.success) {
      setProfileSuccessMsg('Admin credentials updated successfully!');
      setAdminPassword('');
      setAdminConfirmPassword('');
    } else {
      setProfileErrorMsg(result.message || 'Failed to update admin settings.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filters logic for Orders Tab
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order._id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.userName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.deliveryAddress.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.contactNumber.includes(orderSearch);

    const matchesStatus = orderStatusFilter === 'All' || order.status === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filters logic for Menu Tab
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(menuSearch.toLowerCase());

    const matchesCategory = menuCategoryFilter === 'All' || item.category === menuCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Visual status trackers
  const getStatusPercent = (status) => {
    switch (status) {
      case 'Placed': return 25;
      case 'Preparing': return 50;
      case 'Out for Delivery': return 75;
      case 'Delivered': return 100;
      default: return 0;
    }
  };

  return (
    <div className="admin-page container section-padding animate-fade-in">
      <div className="admin-header text-left">
        <div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle-desc">Manage your gourmet recipes, client checkout orders, and restaurant configurations.</p>
        </div>
        {analytics && (
          <span className="db-mode-badge animate-fade-in">
            Mode: <strong>{analytics.dbMode.toUpperCase()}</strong>
          </span>
        )}
      </div>

      {loading ? (
        <div className="loading-spinner-box">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="admin-error-box text-center">
          <p className="error-message">{error}</p>
          <button className="btn btn-secondary" onClick={fetchData}>
            <RefreshCw size={16} /> Reload Dashboard
          </button>
        </div>
      ) : (
        <>
          {/* Dashboard Metrics summary (Visible in Dashboard tab) */}
          <div className="analytics-grid">
            <div className="analytic-card">
              <div className="analytic-icon-box orange"><DollarSign size={22} /></div>
              <div className="analytic-info">
                <span className="analytic-label">Total Revenue</span>
                <h2 className="analytic-value">₹{analytics ? analytics.totalSales.toFixed(2) : '0.00'}</h2>
              </div>
            </div>

            <div className="analytic-card">
              <div className="analytic-icon-box yellow"><ShoppingBasket size={22} /></div>
              <div className="analytic-info">
                <span className="analytic-label">Orders Placed</span>
                <h2 className="analytic-value">{analytics ? analytics.totalOrders : '0'}</h2>
              </div>
            </div>

            <div className="analytic-card">
              <div className="analytic-icon-box blue"><TrendingUp size={22} /></div>
              <div className="analytic-info">
                <span className="analytic-label">Average Order</span>
                <h2 className="analytic-value">₹{analytics ? analytics.avgOrderValue.toFixed(2) : '0.00'}</h2>
              </div>
            </div>

            <div className="analytic-card">
              <div className="analytic-icon-box green"><CheckSquare size={22} /></div>
              <div className="analytic-info">
                <span className="analytic-label">Active Dishes</span>
                <h2 className="analytic-value">{menuItems.filter((i) => i.isAvailable).length}</h2>
              </div>
            </div>
          </div>

          {/* Admin Navigation Tab row */}
          <div className="admin-tabs-row">
            <div className="admin-tabs">
              <button
                className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard Overview
              </button>
              <button
                className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                Orders Manager ({orders.length})
              </button>
              <button
                className={`admin-tab ${activeTab === 'menu' ? 'active' : ''}`}
                onClick={() => setActiveTab('menu')}
              >
                Menu Editor ({menuItems.length})
              </button>
              <button
                className={`admin-tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Admin Profile
              </button>
            </div>
            {activeTab === 'menu' && (
              <button className="btn btn-primary add-item-btn animate-fade-in" onClick={handleCreateClick}>
                <Plus size={16} /> Add New Dish
              </button>
            )}
          </div>

          {/* Tab 1: Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-grid animate-fade-in">
              {/* Popular Dishes */}
              <div className="dashboard-left-panel">
                <div className="dashboard-card">
                  <h3 className="panel-title">Top Selling Dishes</h3>
                  <hr className="admin-divider" />
                  {analytics && analytics.popularItems && analytics.popularItems.length > 0 ? (
                    <div className="popular-items-list">
                      {analytics.popularItems.map((item, idx) => (
                        <div key={idx} className="popular-item-row">
                          <span className="popular-idx">#{idx + 1}</span>
                          <div className="popular-info">
                            <span className="popular-name">{item.name}</span>
                            <span className="popular-sales">{item.quantity} orders</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data-text">No orders placed to rank popular dishes.</p>
                  )}
                </div>

                {/* Sales status breakdown */}
                <div className="dashboard-card spacing-top">
                  <h3 className="panel-title">Orders Status Breakdown</h3>
                  <hr className="admin-divider" />
                  {analytics && analytics.statusCounts ? (
                    <div className="status-progress-grid">
                      {Object.entries(analytics.statusCounts).map(([status, count]) => (
                        <div key={status} className="status-progress-row">
                          <div className="status-row-info">
                            <span className="status-row-label">{status}</span>
                            <span className="status-row-count">{count} orders</span>
                          </div>
                          <div className="status-row-meter">
                            <div 
                              className={`status-meter-fill fill-${status.toLowerCase().replace(/ /g, '-')}`}
                              style={{ width: `${analytics.totalOrders > 0 ? (count / analytics.totalOrders) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data-text">No orders status data available.</p>
                  )}
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="dashboard-right-panel">
                <div className="dashboard-card">
                  <div className="panel-header-row">
                    <h3 className="panel-title">Recent Checkout Orders</h3>
                    <button className="text-btn" onClick={() => setActiveTab('orders')}>View All</button>
                  </div>
                  <hr className="admin-divider" />

                  {orders.length > 0 ? (
                    <div className="recent-orders-list">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order._id} className="recent-order-row" onClick={() => { setSelectedOrder(order); setActiveTab('orders'); }}>
                          <div className="recent-order-meta">
                            <span className="recent-order-id">#{order._id.slice(-6)}</span>
                            <span className="recent-order-date">{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="recent-order-body">
                            <span className="recent-order-user">{order.userName}</span>
                            <span className="recent-order-total">₹{order.totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="recent-order-footer">
                            <span className={`badge badge-${order.status.toLowerCase().replace(/ /g, '-')}`}>{order.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data-text">No recent orders recorded.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Orders Manager Tab */}
          {activeTab === 'orders' && (
            <div className="admin-orders-manager-panel animate-fade-in">
              {/* Filter controls */}
              <div className="admin-filters-bar">
                <div className="filter-search-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="form-input filter-search"
                    placeholder="Search by ID, name, phone, address..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
                <div className="filter-status-wrapper">
                  <Filter size={16} className="filter-icon" />
                  <select
                    className="form-input filter-status-select"
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Placed">Placed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {filteredOrders.length > 0 ? (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Items Summary</th>
                        <th>Total Paid</th>
                        <th>Order Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order._id}>
                          <td><span className="tbl-order-id">#{order._id.slice(-6)}</span></td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>
                            <div className="tbl-cust-info">
                              <span className="tbl-cust-name">{order.userName}</span>
                              <span className="tbl-cust-phone">{order.contactNumber}</span>
                            </div>
                          </td>
                          <td>
                            <div className="tbl-items-summary">
                              {order.items.map((it, i) => (
                                <div key={i} className="tbl-item-brief">
                                  {it.quantity}x {it.name}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td><strong className="tbl-total-val">₹{order.totalAmount.toFixed(2)}</strong></td>
                          <td>
                            <select
                              className={`status-select select-${order.status.toLowerCase().replace(/ /g, '-')}`}
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            >
                              <option value="Placed">Placed</option>
                              <option value="Preparing">Preparing</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                          <td>
                            <button className="btn btn-secondary btn-action-view" onClick={() => setSelectedOrder(order)}>
                              <Eye size={14} /> Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="admin-empty-state">No orders matching your filters.</div>
              )}
            </div>
          )}

          {/* Tab 3: Menu Editor Tab */}
          {activeTab === 'menu' && (
            <div className="admin-menu-editor-panel animate-fade-in">
              {/* Search & Category filter */}
              <div className="admin-filters-bar">
                <div className="filter-search-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="form-input filter-search"
                    placeholder="Search dishes by name or description..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                  />
                </div>
                <div className="filter-status-wrapper">
                  <Filter size={16} className="filter-icon" />
                  <select
                    className="form-input filter-status-select"
                    value={menuCategoryFilter}
                    onChange={(e) => setMenuCategoryFilter(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    <option value="Pizzas">Pizzas</option>
                    <option value="Burgers">Burgers</option>
                    <option value="Pastas">Pastas</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Drinks">Drinks</option>
                  </select>
                </div>
              </div>

              {filteredMenuItems.length > 0 ? (
                <div className="admin-menu-grid">
                  {filteredMenuItems.map((item) => (
                    <div key={item._id} className="admin-menu-row-card">
                      <img src={item.image} alt={item.name} className="admin-menu-row-img" />
                      <div className="admin-menu-row-details">
                        <div className="admin-menu-row-meta">
                          <span className="admin-menu-row-cat">{item.category}</span>
                          <span className={`availability-dot ${item.isAvailable ? 'available' : 'unavailable'}`}>
                            {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        <h4 className="admin-menu-row-title">{item.name}</h4>
                        <p className="admin-menu-row-desc">{item.description}</p>
                        <span className="admin-menu-row-price">₹{item.price.toFixed(2)}</span>
                      </div>
                      <div className="admin-menu-row-actions">
                        {/* Instant Stock Toggle */}
                        <button 
                          className={`btn toggle-stock-btn ${item.isAvailable ? 'btn-outline' : 'btn-primary'}`}
                          onClick={() => handleToggleAvailability(item)}
                          title={item.isAvailable ? "Set Out of Stock" : "Set In Stock"}
                        >
                          {item.isAvailable ? 'In Stock' : 'Out Stock'}
                        </button>
                        <button className="btn btn-secondary icon-only-btn" onClick={() => handleEditClick(item)} aria-label="Edit dish">
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-secondary icon-only-btn danger-hover" onClick={() => handleDeleteItem(item._id)} aria-label="Delete dish">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-empty-state">No dishes found matching search filters.</div>
              )}
            </div>
          )}

          {/* Tab 4: Admin Profile Tab */}
          {activeTab === 'profile' && (
            <div className="admin-profile-panel-wrapper animate-fade-in">
              <div className="admin-profile-card">
                <div className="profile-avatar-side">
                  <div className="profile-avatar-large">
                    {user ? user.name.split(' ').map(n => n[0]).join('') : 'A'}
                  </div>
                  <h2 className="profile-name-display">{user ? user.name : 'Admin'}</h2>
                  <span className="profile-role-badge">SYSTEM ADMINISTRATOR</span>
                  <span className="profile-email-sub">{user ? user.email : ''}</span>
                </div>

                <div className="profile-form-main">
                  <form onSubmit={handleUpdateAdminProfile} className="profile-form">
                    <h3 className="profile-form-subtitle">Personal Admin Coordinates</h3>
                    <hr className="admin-divider" />

                    {profileSuccessMsg && (
                      <div className="profile-alert alert-success animate-fade-in">
                        <CheckCircle2 size={16} />
                        <span>{profileSuccessMsg}</span>
                      </div>
                    )}
                    {profileErrorMsg && (
                      <div className="profile-alert alert-danger animate-fade-in">
                        <AlertCircle size={16} />
                        <span>{profileErrorMsg}</span>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label" htmlFor="adminName">Full Name</label>
                      <input
                        id="adminName"
                        type="text"
                        className="form-input"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="adminPhone">Phone Contact</label>
                      <input
                        id="adminPhone"
                        type="tel"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="adminAddress">Restaurant Main HQ Coordinates</label>
                      <textarea
                        id="adminAddress"
                        rows="2"
                        value={adminAddress}
                        onChange={(e) => setAdminAddress(e.target.value)}
                        className="form-input form-textarea"
                      />
                    </div>

                    <h3 className="profile-form-subtitle spacing-top">Update Admin Password</h3>
                    <hr className="admin-divider" />

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label" htmlFor="adminPassword">New Password</label>
                        <input
                          id="adminPassword"
                          type="password"
                          className="form-input"
                          placeholder="Enter new password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="adminConfirmPassword">Confirm Password</label>
                        <input
                          id="adminConfirmPassword"
                          type="password"
                          className="form-input"
                          placeholder="Confirm new password"
                          value={adminConfirmPassword}
                          onChange={(e) => setAdminConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary submit-profile-btn" disabled={profileUpdating}>
                      <Save size={16} /> {profileUpdating ? 'Saving...' : 'Save Coordinates'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Details Modal popup for Selected Order */}
          {selectedOrder && (() => {
            const subtotal = selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const tax = subtotal * 0.05;
            const deliveryFee = (subtotal > 0 && subtotal < 40) ? 5.00 : 0.00;
            const expectedTotal = subtotal + tax + deliveryFee;
            const discount = expectedTotal > selectedOrder.totalAmount ? (expectedTotal - selectedOrder.totalAmount) : 0;
            return (
              <div className="invoice-print-overlay modal-overlay animate-fade-in">
                <div className="modal-card modal-lg invoice-modal animate-slide-up">
                  <div className="modal-header">
                    <div className="invoice-header-title">
                      <h3 className="invoice-brand"><span className="brand-accent">Gourmet</span>Haven</h3>
                      <span className="invoice-badge">INVOICE</span>
                    </div>
                    <button className="modal-close" onClick={() => setSelectedOrder(null)}>
                      <X size={20} />
                    </button>
                  </div>

                  <div className="invoice-body">
                    {/* Invoice Meta */}
                    <div className="invoice-meta-row">
                      <div className="invoice-meta-col">
                        <span className="invoice-label">Invoice Number</span>
                        <span className="invoice-val">#INV-{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}</span>
                      </div>
                      <div className="invoice-meta-col">
                        <span className="invoice-label">Date Placed</span>
                        <span className="invoice-val">{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="invoice-meta-col">
                        <span className="invoice-label">Payment Method</span>
                        <span className="invoice-val">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="invoice-meta-col">
                        <span className="invoice-label">Order Status</span>
                        <span className={`invoice-val status-pill status-${selectedOrder.status.toLowerCase().replace(/ /g, '-')}`}>{selectedOrder.status}</span>
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
                        <strong className="party-name">{selectedOrder.userName}</strong>
                        <span className="party-text">{selectedOrder.deliveryAddress}</span>
                        <span className="party-text">Phone: {selectedOrder.contactNumber}</span>
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
                          {selectedOrder.items.map((item, idx) => (
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
                        <p className="invoice-note">All records are administrative coordinates. For kitchen and billing inquiries, contact main operations.</p>
                      </div>
                      <div className="invoice-summary-col summary-right">
                        <div className="summary-row">
                          <span>Subtotal</span>
                          <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                          <span>GST / Tax (5%)</span>
                          <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                          <span>Delivery Fee</span>
                          <span>{deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : 'FREE'}</span>
                        </div>
                        {discount > 0 && (
                          <div className="summary-row discount-row">
                            <span>Promo Discount</span>
                            <span>-₹{discount.toFixed(2)}</span>
                          </div>
                        )}
                        <hr className="summary-divider" />
                        <div className="summary-row grand-total-row">
                          <span>Grand Total</span>
                          <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status editing at the bottom */}
                  <div className="modal-status-editor-row screen-only">
                    <div className="status-selector-container">
                      <span className="status-label-text">Modify Status:</span>
                      <select
                        className={`status-select select-${selectedOrder.status.toLowerCase().replace(/ /g, '-')}`}
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                      >
                        <option value="Placed">Placed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>

                    {/* Progress visual bar */}
                    <div className="modal-progress-bar-container">
                      <div className="progress-bar-outer">
                        <div 
                          className="progress-bar-inner animate-pulse" 
                          style={{ width: `${getStatusPercent(selectedOrder.status)}%` }}
                        ></div>
                      </div>
                      <div className="progress-steps-labels">
                        <span className={getStatusPercent(selectedOrder.status) >= 25 ? 'active-step' : ''}>Placed</span>
                        <span className={getStatusPercent(selectedOrder.status) >= 50 ? 'active-step' : ''}>Prepping</span>
                        <span className={getStatusPercent(selectedOrder.status) >= 75 ? 'active-step' : ''}>On Way</span>
                        <span className={getStatusPercent(selectedOrder.status) >= 100 ? 'active-step' : ''}>Arrived</span>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Actions */}
                  <div className="invoice-actions screen-only">
                    <button className="btn btn-primary invoice-print-btn" onClick={() => window.print()}>
                      <Printer size={16} /> Print Invoice
                    </button>
                    <button className="btn btn-secondary invoice-close-btn" onClick={() => setSelectedOrder(null)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Dialog popup for Add/Edit Menu Item (CRUD) */}
          {showItemForm && (
            <div className="modal-overlay animate-fade-in">
              <div className="modal-card animate-slide-up">
                <div className="modal-header">
                  <h3>{editingItem ? 'Edit Food Dish' : 'Add New Menu Item'}</h3>
                  <button className="modal-close" onClick={() => setShowItemForm(false)}>
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleFormSubmit} className="modal-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="itemName">Dish Name</label>
                    <input
                      id="itemName"
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="itemDesc">Description</label>
                    <textarea
                      id="itemDesc"
                      rows="2"
                      className="form-input"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="itemPrice">Price (₹)</label>
                      <input
                        id="itemPrice"
                        type="number"
                        step="0.01"
                        className="form-input"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="itemRating">Rating (Out of 5)</label>
                      <input
                        id="itemRating"
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        className="form-input"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="itemCategory">Category</label>
                    <select
                      id="itemCategory"
                      className="form-input"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Pizzas">Pizzas</option>
                      <option value="Burgers">Burgers</option>
                      <option value="Pastas">Pastas</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Drinks">Drinks</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="itemImage">Image URL</label>
                    <input
                      id="itemImage"
                      type="url"
                      className="form-input"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-checkbox">
                    <input
                      id="itemAvailable"
                      type="checkbox"
                      className="checkbox-input"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    />
                    <label className="checkbox-label" htmlFor="itemAvailable">Available for Ordering</label>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowItemForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingItem ? 'Save Changes' : 'Create Item'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Custom Delete Confirmation Modal Popup */}
          {deleteConfirmId && (
            <div className="modal-overlay animate-fade-in" style={{ zIndex: 1100 }}>
              <div className="modal-card animate-slide-up" style={{ maxWidth: '420px' }}>
                <div className="modal-header">
                  <h3>Delete Menu Dish</h3>
                  <button className="modal-close" onClick={() => setDeleteConfirmId(null)} aria-label="Close dialog">
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-form">
                  <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginBottom: '12px', lineHeight: '1.5' }}>
                    Are you sure you want to delete this food dish from the menu? This action cannot be undone.
                  </p>
                  <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      style={{ backgroundColor: 'var(--danger)', color: 'white' }}
                      onClick={() => {
                        const idToDelete = deleteConfirmId;
                        setDeleteConfirmId(null);
                        executeDeleteItem(idToDelete);
                      }}
                    >
                      Delete Dish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Admin;
