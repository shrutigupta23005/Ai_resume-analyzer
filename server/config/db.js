const mongoose = require('mongoose');

const connectDB = async () => {
  const uri =
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/resume-analyzer';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    setupConnectionHandlers();

    return conn;

  } catch (error) {

    console.error("=================================");
    console.error("MongoDB Atlas Connection Error:");
    console.error(error);
    console.error("=================================");

    console.warn(`⚠️ Could not connect to MongoDB at ${uri}`);
    console.log('🔄 Starting in-memory MongoDB server...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');

      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();

      const conn = await mongoose.connect(memoryUri);

      console.log('✅ In-memory MongoDB started successfully');
      setupConnectionHandlers();

      return conn;

    } catch (memError) {

      console.error(
        `\n❌ Failed to start in-memory MongoDB: ${memError.message}`
      );

      process.exit(1);
    }
  }
};

function setupConnectionHandlers() {
  mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully');
  });
}

module.exports = connectDB;