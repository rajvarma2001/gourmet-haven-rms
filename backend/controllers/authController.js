import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDbMode, readMockData, writeMockData } from '../config/db.js';
import User from '../models/User.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'restaurant_secret_key_123', {
    expiresIn: '30d',
  });
};

// Register User
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const dbMode = getDbMode();

    if (dbMode === 'mock') {
      const users = readMockData('users');
      const userExists = users.some((u) => u.email === normalizedEmail);

      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: Date.now().toString(),
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: role || 'customer',
        phone: '',
        address: '',
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      writeMockData('users', users);

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
        token: generateToken(newUser._id),
      });
    } else {
      const userExists = await User.findOne({ email: normalizedEmail });

      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: role || 'customer',
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          token: generateToken(user._id),
        });
      } else {
        res.status(400).json({ message: 'Invalid user data' });
      }
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const dbMode = getDbMode();

    if (dbMode === 'mock') {
      const users = readMockData('users');
      const user = users.find((u) => u.email === normalizedEmail);

      if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      const user = await User.findOne({ email: normalizedEmail });

      if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  // req.user is already populated by authMiddleware
  res.json(req.user);
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  const { name, phone, address, password } = req.body;
  const userId = req.user._id || req.user.id;

  try {
    const dbMode = getDbMode();

    if (dbMode === 'mock') {
      const users = readMockData('users');
      const index = users.findIndex((u) => u._id === userId);

      if (index === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (name) users[index].name = name;
      if (phone !== undefined) users[index].phone = phone;
      if (address !== undefined) users[index].address = address;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        users[index].password = await bcrypt.hash(password, salt);
      }

      writeMockData('users', users);

      // Return updated profile (excluding password)
      const { password: _, ...updatedUser } = users[index];
      res.json(updatedUser);
    } else {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
      });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};
