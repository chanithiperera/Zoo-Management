const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.error('MONGODB_URI is empty after validation; check backend/.env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20_000,
    });
    console.log(`MongoDB connected: ${conn.connection.host} (db: ${conn.connection.name})`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('');
    console.error('Fix:');
    console.error('  • Atlas: MongoDB Atlas → Network Access → add your current IP (or 0.0.0.0/0 for dev only).');
    console.error('  • Check: ensure MONGODB_URI in backend/.env is a valid connection string from Atlas.');
    console.error('');
    process.exit(1);
  }
};

module.exports = connectDB;
