import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import FoodItem from '../models/FoodItem.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sampleFoodItems = [
  // Pizzas
  {
    name: 'Truffle Mushroom Pizza',
    description: 'Artisanal sourdough crust topped with wild truffles, creamy porcini mushrooms, fresh mozzarella, and a drizzle of rosemary oil.',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600',
    category: 'Pizzas',
    rating: 4.8,
    isAvailable: true,
  },
  {
    name: 'Spicy Diavola Pizza',
    description: 'Spiced calabrian salami, hot honey, house marinara sauce, fresh basil, and fresh mozzarella cheese.',
    price: 16.49,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=600',
    category: 'Pizzas',
    rating: 4.6,
    isAvailable: true,
  },
  {
    name: 'Classic Margherita',
    description: 'San marzano tomato sauce, fresh buffalo mozzarella, fresh basil leaves, and cold-pressed extra virgin olive oil.',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&q=80&w=600',
    category: 'Pizzas',
    rating: 4.7,
    isAvailable: true,
  },
  // Burgers
  {
    name: 'The Wagyu Signature Burger',
    description: 'Premium double wagyu beef patty, sharp melted cheddar, caramelized onions, crisp butter lettuce, and truffle mayo on a toasted brioche bun.',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600',
    category: 'Burgers',
    rating: 4.9,
    isAvailable: true,
  },
  {
    name: 'Crispy Avocado Chicken Burger',
    description: 'Crispy golden buttermilk chicken breast, sliced hass avocado, spicy chipotle aioli, and tangly red cabbage slaw.',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&q=80&w=600',
    category: 'Burgers',
    rating: 4.5,
    isAvailable: true,
  },
  {
    name: 'Ultimate Garden Burger',
    description: 'Flame-grilled plant-based patty, melted Swiss cheese, sweet heirloom tomato, pickles, and smokehouse BBQ sauce.',
    price: 14.49,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=600',
    category: 'Burgers',
    rating: 4.4,
    isAvailable: true,
  },
  // Pastas
  {
    name: 'Slow-Cooked Beef Bolognese',
    description: 'Rich, 6-hour simmered beef ragù tossed with fresh handmade pappardelle pasta and topped with aged Parmigiano-Reggiano.',
    price: 17.99,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600',
    category: 'Pastas',
    rating: 4.7,
    isAvailable: true,
  },
  {
    name: 'Pesto Genovese Penne',
    description: 'Librant house-made sweet basil pesto, roasted pine nuts, sundried tomatoes, and fresh baby spinach tossed with penne pasta.',
    price: 15.49,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=600',
    category: 'Pastas',
    rating: 4.6,
    isAvailable: true,
  },
  // Desserts
  {
    name: 'Classic Espresso Tiramisu',
    description: 'Fluffy layers of imported mascarpone cheese cream and espresso-soaked Italian ladyfingers, dusted with dark cocoa powder.',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=600',
    category: 'Desserts',
    rating: 4.9,
    isAvailable: true,
  },
  {
    name: 'Molten Lava Cake',
    description: 'Decadent dark chocolate cake with a rich liquid warm chocolate center, served with a scoop of organic vanilla bean gelato.',
    price: 9.49,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600',
    category: 'Desserts',
    rating: 4.8,
    isAvailable: true,
  },
  // Drinks
  {
    name: 'Fresh Mint Mojito',
    description: 'Refreshing blend of muddled garden mint leaves, fresh lime juice, cane sugar syrup, and sparkling soda water over crushed ice.',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600',
    category: 'Drinks',
    rating: 4.5,
    isAvailable: true,
  },
  {
    name: 'Matcha Iced Latte',
    description: 'Premium ceremonial grade Japanese green tea matcha whisked with organic oat milk and a touch of organic agave nectar.',
    price: 6.49,
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600',
    category: 'Drinks',
    rating: 4.7,
    isAvailable: true,
  }
];

const seedData = async () => {
  console.log('--- Database Seeding Started ---');

  // Load passwords and hash them
  const adminSalt = await bcrypt.genSalt(10);
  const hashedAdminPassword = await bcrypt.hash('admin123', adminSalt);

  const customerSalt = await bcrypt.genSalt(10);
  const hashedCustomerPassword = await bcrypt.hash('cust123', customerSalt);

  // We use valid 24-character hexadecimal ObjectIds for seeding users
  const defaultUsers = [
    {
      _id: '65da1a2b3c4d5e6f7a8b9c01',
      name: 'Admin User',
      email: 'admin@haven.com',
      password: hashedAdminPassword,
      role: 'admin',
      phone: '+1 (555) 000-1111',
      address: '100 Restaurant Row, Suite A, Food City',
      createdAt: new Date().toISOString()
    },
    {
      _id: '65da1a2b3c4d5e6f7a8b9c02',
      name: 'Jane Doe',
      email: 'customer@haven.com',
      password: hashedCustomerPassword,
      role: 'customer',
      phone: '+1 (555) 999-8888',
      address: '742 Evergreen Terrace, Springfield',
      createdAt: new Date().toISOString()
    }
  ];

  // 1. Seed mock JSON files
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write foods
  const mockFoods = sampleFoodItems.map((item, idx) => ({
    _id: `seed_food_${idx + 1}`,
    ...item,
    createdAt: new Date().toISOString()
  }));

  fs.writeFileSync(
    path.join(dataDir, 'fooditems.json'),
    JSON.stringify(mockFoods, null, 2),
    'utf-8'
  );
  console.log('Seeded local mock JSON fooditems.json.');

  // Write default users
  fs.writeFileSync(
    path.join(dataDir, 'users.json'),
    JSON.stringify(defaultUsers, null, 2),
    'utf-8'
  );
  console.log('Seeded local mock JSON users.json.');

  // Initialize empty orders
  fs.writeFileSync(
    path.join(dataDir, 'orders.json'),
    '[]',
    'utf-8'
  );
  console.log('Cleared local mock JSON orders.json.');

  // 2. Seed MongoDB
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant-ms';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
    
    // Clear & seed foods
    await FoodItem.deleteMany({});
    await FoodItem.insertMany(sampleFoodItems);
    console.log('Seeded MongoDB Food Items successfully!');

    // Clear & seed users
    await User.deleteMany({});
    await User.insertMany(defaultUsers);
    console.log('Seeded MongoDB Users successfully!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.log('Could not seed MongoDB:', error.message);
    console.log('Local JSON data was seeded successfully. The app is ready to run in fallback mock mode.');
  }

  console.log('--- Database Seeding Completed ---');
};

seedData();
