import mongoose from 'mongoose';
import { getDbMode, readMockData, writeMockData } from '../config/db.js';
import FoodItem from '../models/FoodItem.js';

// Get all food items
export const getFoodItems = async (req, res) => {
  try {
    const dbMode = getDbMode();
    let foodItems = [];

    if (dbMode === 'mock') {
      foodItems = readMockData('fooditems');
    } else {
      foodItems = await FoodItem.find({});
    }

    res.json(foodItems);
  } catch (error) {
    console.error('Fetch foods error:', error);
    res.status(500).json({ message: 'Server error fetching food items' });
  }
};

// Get single food item
export const getFoodItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const dbMode = getDbMode();

    if (dbMode === 'mock') {
      const foodItems = readMockData('fooditems');
      const item = foodItems.find((f) => f._id === id);
      if (!item) return res.status(404).json({ message: 'Food item not found' });
      return res.json(item);
    } else {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Food item not found (Invalid ID format)' });
      }
      const item = await FoodItem.findById(id);
      if (!item) return res.status(404).json({ message: 'Food item not found' });
      return res.json(item);
    }
  } catch (error) {
    console.error('Fetch single food error:', error);
    res.status(500).json({ message: 'Server error fetching food item' });
  }
};

// Create a food item (Admin)
export const createFoodItem = async (req, res) => {
  const { name, description, price, image, category, rating } = req.body;

  if (!name || !description || !price || !image || !category) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const dbMode = getDbMode();

    if (dbMode === 'mock') {
      const foodItems = readMockData('fooditems');
      const newItem = {
        _id: Date.now().toString(),
        name,
        description,
        price: parseFloat(price),
        image,
        category,
        rating: rating ? parseFloat(rating) : 4.5,
        isAvailable: true,
        createdAt: new Date().toISOString(),
      };

      foodItems.push(newItem);
      writeMockData('fooditems', foodItems);
      res.status(201).json(newItem);
    } else {
      const item = await FoodItem.create({
        name,
        description,
        price: parseFloat(price),
        image,
        category,
        rating: rating ? parseFloat(rating) : 4.5,
      });
      res.status(201).json(item);
    }
  } catch (error) {
    console.error('Create food error:', error);
    res.status(500).json({ message: 'Server error creating food item' });
  }
};

// Update a food item (Admin)
export const updateFoodItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, category, rating, isAvailable } = req.body;

  try {
    const dbMode = getDbMode();

    if (dbMode === 'mock') {
      const foodItems = readMockData('fooditems');
      const index = foodItems.findIndex((f) => f._id === id);

      if (index === -1) {
        return res.status(404).json({ message: 'Food item not found' });
      }

      if (name) foodItems[index].name = name;
      if (description) foodItems[index].description = description;
      if (price !== undefined) foodItems[index].price = parseFloat(price);
      if (image) foodItems[index].image = image;
      if (category) foodItems[index].category = category;
      if (rating !== undefined) foodItems[index].rating = parseFloat(rating);
      if (isAvailable !== undefined) foodItems[index].isAvailable = isAvailable;

      writeMockData('fooditems', foodItems);
      res.json(foodItems[index]);
    } else {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Food item not found (Invalid ID format)' });
      }
      const item = await FoodItem.findById(id);

      if (!item) {
        return res.status(404).json({ message: 'Food item not found' });
      }

      if (name) item.name = name;
      if (description) item.description = description;
      if (price !== undefined) item.price = parseFloat(price);
      if (image) item.image = image;
      if (category) item.category = category;
      if (rating !== undefined) item.rating = parseFloat(rating);
      if (isAvailable !== undefined) item.isAvailable = isAvailable;

      const updatedItem = await item.save();
      res.json(updatedItem);
    }
  } catch (error) {
    console.error('Update food error:', error);
    res.status(500).json({ message: 'Server error updating food item' });
  }
};

// Delete a food item (Admin)
export const deleteFoodItem = async (req, res) => {
  const { id } = req.params;

  try {
    const dbMode = getDbMode();

    if (dbMode === 'mock') {
      const foodItems = readMockData('fooditems');
      const filteredItems = foodItems.filter((f) => f._id !== id);

      if (foodItems.length === filteredItems.length) {
        return res.status(404).json({ message: 'Food item not found' });
      }

      writeMockData('fooditems', filteredItems);
      res.json({ message: 'Food item removed successfully' });
    } else {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Food item not found (Invalid ID format)' });
      }
      const item = await FoodItem.findById(id);

      if (!item) {
        return res.status(404).json({ message: 'Food item not found' });
      }

      await item.deleteOne();
      res.json({ message: 'Food item removed successfully' });
    }
  } catch (error) {
    console.error('Delete food error:', error);
    res.status(500).json({ message: 'Server error deleting food item' });
  }
};

// Add a review to a food item
export const addFoodReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (rating === undefined || !comment) {
    return res.status(400).json({ message: 'Please provide rating and comment' });
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
  }

  try {
    const dbMode = getDbMode();

    if (dbMode === 'mock') {
      const foodItems = readMockData('fooditems');
      const index = foodItems.findIndex((f) => f._id === id);

      if (index === -1) {
        return res.status(404).json({ message: 'Food item not found' });
      }

      foodItems[index].reviews = foodItems[index].reviews || [];
      
      // Check if user already reviewed
      const userIdStr = (req.user._id || req.user.id).toString();
      const alreadyReviewed = foodItems[index].reviews.find(
        (r) => r.userId.toString() === userIdStr
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'You have already reviewed this dish' });
      }

      const newReview = {
        _id: Date.now().toString(),
        userId: req.user._id || req.user.id,
        userName: req.user.name,
        rating: numRating,
        comment,
        createdAt: new Date().toISOString(),
      };

      foodItems[index].reviews.push(newReview);
      
      // Update average rating
      const totalRating = foodItems[index].reviews.reduce((sum, r) => sum + r.rating, 0);
      foodItems[index].rating = parseFloat((totalRating / foodItems[index].reviews.length).toFixed(1));

      writeMockData('fooditems', foodItems);
      res.status(201).json(foodItems[index]);
    } else {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Food item not found (Invalid ID format)' });
      }
      const item = await FoodItem.findById(id);

      if (!item) {
        return res.status(404).json({ message: 'Food item not found' });
      }

      item.reviews = item.reviews || [];

      // Check if user already reviewed
      const userIdStr = req.user._id.toString();
      const alreadyReviewed = item.reviews.find(
        (r) => r.userId.toString() === userIdStr
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'You have already reviewed this dish' });
      }

      const review = {
        userId: req.user._id,
        userName: req.user.name,
        rating: numRating,
        comment,
      };

      item.reviews.push(review);
      
      const totalRating = item.reviews.reduce((sum, r) => sum + r.rating, 0);
      item.rating = parseFloat((totalRating / item.reviews.length).toFixed(1));

      const updatedItem = await item.save();
      res.status(201).json(updatedItem);
    }
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error adding review' });
  }
};
