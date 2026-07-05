import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isMock = false;

// Ensure mock data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant-ms';
  try {
    // Attempt Mongoose connection with a 3 second timeout
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('MongoDB Connected Successfully:', mongoURI);
    isMock = false;
  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message);
    console.log('--- FALLING BACK TO LOCAL JSON DATABASE ---');
    isMock = true;
    initializeMockData();
  }
};

export const getDbMode = () => {
  return isMock ? 'mock' : 'mongodb';
};

// Initialize empty JSON files if they don't exist
const initializeMockData = () => {
  const files = {
    'users.json': '[]',
    'fooditems.json': '[]',
    'orders.json': '[]'
  };

  Object.entries(files).forEach(([file, defaultContent]) => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, defaultContent, 'utf-8');
      console.log(`Initialized mock store: ${file}`);
    }
  });
};

// Generic read/write functions for local JSON DB
export const readMockData = (collection) => {
  const filePath = path.join(dataDir, `${collection}.json`);
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const writeMockData = (collection, data) => {
  const filePath = path.join(dataDir, `${collection}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};
