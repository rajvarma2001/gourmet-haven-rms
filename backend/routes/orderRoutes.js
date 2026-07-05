import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getAdminAnalytics,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, adminOnly, getAllOrders);

router.get('/myorders', protect, getMyOrders);
router.get('/analytics', protect, adminOnly, getAdminAnalytics);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
