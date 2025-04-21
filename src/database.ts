import mongoose from "mongoose";

// MongoDB connection URI - use environment variable or default to localhost
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/emeraldchat";

// Connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  socketTimeoutMS: 45000, // Increase socket timeout
  maxPoolSize: 10, // Connection pool size
};

// Connect to MongoDB
export async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    try {
      console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
      await mongoose.connect(MONGODB_URI, mongooseOptions);
      console.log("✅ Successfully connected to MongoDB");

      // Handle connection errors after initial connection
      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
      });

      // Handle disconnection
      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnected, attempting to reconnect...");
        setTimeout(() => {
          connectToDatabase().catch((err) =>
            console.error("Failed to reconnect to MongoDB:", err)
          );
        }, 5000);
      });
    } catch (error) {
      console.error("❌ Failed to connect to MongoDB:", error);
      throw error;
    }
  }
  return mongoose.connection;
}

// Disconnect from MongoDB (for cleanup)
export async function disconnectFromDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}
