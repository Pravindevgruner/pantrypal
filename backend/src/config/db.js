const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pantrypal';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] Connected to external MongoDB: ${conn.connection.host}`);
    return;
  } catch (err) {
    if (isProduction) {
      console.error(`[Database Fatal] Failed to connect to MongoDB at ${mongoUri} in production mode: ${err.message}`);
      console.error('[Database Fatal] In-memory database fallback is strictly disabled in production. Exiting process.');
      process.exit(1);
    }
    console.log('[Database] External MongoDB connection failed or not available. Starting MongoMemoryServer fallback for development...');
  }

  // Fallback to MongoMemoryServer for standalone zero-config runtime in development
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[Database] Connected to In-Memory MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
