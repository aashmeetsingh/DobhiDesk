const mongoose = require('mongoose');
const MONGO_URI="mongodb://localhost:27017/"
async function connectDB() {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');
    }
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
