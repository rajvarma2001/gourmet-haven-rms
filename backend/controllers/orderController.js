import { getDbMode, readMockData, writeMockData } from '../config/db.js';
import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';

// Create new order
export const createOrder = async (req, res) => {
  const { items, totalAmount, deliveryAddress, contactNumber, paymentMethod } = req.body;
  const userId = req.user._id || req.user.id;
  const userName = req.user.name;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in order' });
  }
  if (!deliveryAddress || !contactNumber) {
    return res.status(400).json({ message: 'Delivery address and contact number are required' });
  }

  try {
    const dbMode = getDbMode();

    if (dbMode === 'mock') {
      const orders = readMockData('orders');
      const newOrder = {
        _id: Date.now().toString(),
        userId,
        userName,
        items,
        totalAmount: parseFloat(totalAmount),
        deliveryAddress,
        contactNumber,
        status: 'Placed',
        paymentMethod: paymentMethod || 'Cash on Delivery',
        createdAt: new Date().toISOString(),
      };

      orders.push(newOrder);
      writeMockData('orders', orders);
      res.status(201).json(newOrder);
    } else {
      const order = await Order.create({
        user: userId,
        userId,
        userName,
        items,
        totalAmount: parseFloat(totalAmount),
        deliveryAddress,
        contactNumber,
        paymentMethod: paymentMethod || 'Cash on Delivery',
      });
      res.status(201).json(order);
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error placing order' });
  }
};

// Get logged-in user's orders
export const getMyOrders = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    const dbMode = getDbMode();
    let orders = [];

    if (dbMode === 'mock') {
      const allOrders = readMockData('orders');
      orders = allOrders.filter((o) => o.userId === userId);
    } else {
      orders = await Order.find({ userId }).sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (error) {
    console.error('Fetch user orders error:', error);
    res.status(500).json({ message: 'Server error fetching your orders' });
  }
};

// Get all orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const dbMode = getDbMode();
    let orders = [];

    if (dbMode === 'mock') {
      orders = readMockData('orders');
      // Sort mock orders descending by creation date
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      orders = await Order.find({}).sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (error) {
    console.error('Fetch all orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// Update order status (Admin)
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  try {
    const dbMode = getDbMode();

    if (dbMode === 'mock') {
      const orders = readMockData('orders');
      const index = orders.findIndex((o) => o._id === id);

      if (index === -1) {
        return res.status(404).json({ message: 'Order not found' });
      }

      orders[index].status = status;
      writeMockData('orders', orders);
      res.json(orders[index]);
    } else {
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      order.status = status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    }
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
};

// Get admin dashboard analytics
export const getAdminAnalytics = async (req, res) => {
  try {
    const dbMode = getDbMode();
    let orders = [];
    let foods = [];

    if (dbMode === 'mock') {
      orders = readMockData('orders');
      foods = readMockData('fooditems');
    } else {
      orders = await Order.find({});
      foods = await FoodItem.find({});
    }

    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderVal = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calculate status counts
    const statusCounts = {
      Placed: 0,
      Preparing: 0,
      'Out for Delivery': 0,
      Delivered: 0,
    };
    orders.forEach((o) => {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }
    });

    // Calculate popular items
    const itemSales = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        itemSales[item.name] = (itemSales[item.name] || 0) + item.quantity;
      });
    });

    const popularItems = Object.entries(itemSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.json({
      totalOrders,
      totalSales,
      avgOrderValue: parseFloat(avgOrderVal.toFixed(2)),
      statusCounts,
      popularItems,
      dbMode,
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ message: 'Server error compiling dashboard analytics' });
  }
};
