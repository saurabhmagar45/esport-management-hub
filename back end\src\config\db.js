import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (uri && !uri.includes('localhost') && !uri.includes('127.0.0.1')) {
    try {
      console.log('Connecting to external MongoDB...');
      await mongoose.connect(uri);
      console.log('✅ Connected to MongoDB via MONGODB_URI');
      return;
    } catch (err) {
      console.warn('⚠️ External MongoDB connection failed, falling back to embedded database...');
    }
  }

  // Attempt local connection first if specified
  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log('✅ Connected to local MongoDB at', uri);
      return;
    } catch (err) {
      console.log('Local MongoDB not running. Initializing embedded memory database for seamless local execution...');
    }
  }

  // Fallback to MongoMemoryServer for instant zero-dependency demonstration
  try {
    mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log('✅ Connected to Embedded In-Memory MongoDB at', memoryUri);
  } catch (err) {
    console.error('❌ Failed to initialize MongoDB:', err.message);
    throw err;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}
