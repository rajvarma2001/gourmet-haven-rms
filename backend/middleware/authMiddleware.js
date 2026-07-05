import jwt from 'jsonwebtoken';
import { getDbMode, readMockData } from '../config/db.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'restaurant_secret_key_123');

      // Fetch user from DB or Mock data
      if (getDbMode() === 'mock') {
        const users = readMockData('users');
        const user = users.find((u) => u._id === decoded.id);
        if (!user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        // Remove password from user object
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      } else {
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
      }

      next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
