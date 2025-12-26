const mongoose = require("mongoose");

// Global connection cache for serverless
let cachedConnection = null;

const connectDB = async () => {
  // Return cached connection if exists (CRITICAL for serverless)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("✅ Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    // Serverless-optimized connection options
    const options = {
      serverSelectionTimeoutMS: 15000, // Increased from default 30s (still reasonable)
      socketTimeoutMS: 45000, // Socket timeout
      maxPoolSize: 10, // Connection pool size for serverless
      minPoolSize: 1, // Keep at least 1 connection alive
      maxIdleTimeMS: 10000, // Close idle connections after 10s
      retryWrites: true
      ,
      retryReads: true,
    };

    console.log("🔄 Connecting to MongoDB...");

    const connection = await mongoose.connect(process.env.MONGO_URI, options);

    cachedConnection = connection;
    console.log("✅ MongoDB Connected Successfully");

    // Connection event listeners
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
      cachedConnection = null;
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      cachedConnection = null;
    });

    return connection;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    cachedConnection = null;
    throw error;
  }
};

// Export the connection function
module.exports = connectDB;