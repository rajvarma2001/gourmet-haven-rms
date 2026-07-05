import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDbMode } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Load environmental variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to Database (falls back to mock if offline)
connectDB();

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    databaseMode: getDbMode(),
    message: 'Restaurant Management System API is running smoothly.'
  });
});

// Route mapping
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${getDbMode()} mode`);
});
