import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true, // URL or base64 placeholder
  },
  category: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  reviews: [reviewSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
export default FoodItem;
