import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  foodId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // For mock mode we store userId as a string, but for Mongoose ref is fine
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'],
    default: 'Placed',
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'Credit Card', 'UPI'],
    default: 'Cash on Delivery',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
