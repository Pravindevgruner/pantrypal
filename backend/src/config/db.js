const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pantrypal';
    
    // Try connecting to specified MongoDB server
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`[Database] Connected to external MongoDB: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.log('[Database] External MongoDB connection failed or not available. Starting MongoMemoryServer fallback...');
    }

    // Fallback to MongoMemoryServer for standalone zero-config runtime
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
