const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is required. Copy .env.example to .env and set your MongoDB Atlas connection string.');
  }

  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000,
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 10,
    minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 1,
    retryWrites: true,
    retryReads: true
  });

  return connection;
};

module.exports = connectDB;
