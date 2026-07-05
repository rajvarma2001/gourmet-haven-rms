import express from 'express';
import {
  getFoodItems,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  addFoodReview,
} from '../controllers/foodController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getFoodItems)
  .post(protect, adminOnly, createFoodItem);

router.route('/:id')
  .get(getFoodItemById)
  .put(protect, adminOnly, updateFoodItem)
  .delete(protect, adminOnly, deleteFoodItem);

router.route('/:id/reviews')
  .post(protect, addFoodReview);

export default router;
