import { listenToMessages } from "./websocket.js";
import { connectToDatabase, disconnectFromDatabase } from "./database.js";
import { startServer } from "./api/server.js";

/**
 * Main entry point to start the application
 */
async function main() {
  try {
    // Connect to MongoDB first
    await connectToDatabase();

    // Start API server if requested
    if (process.env.START_API === "true") {
      await startServer();
    }

    // Start listening to WebSocket messages
    await listenToMessages();
  } catch (error) {
    console.error("Error in main function:", error);
    // Attempt to close database connection on error
    await disconnectFromDatabase().catch((err) =>
      console.error("Error disconnecting from database:", err)
    );
    process.exit(1);
  }
}

// Handle process termination for clean shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down application...");
  await disconnectFromDatabase().catch((err) =>
    console.error("Error disconnecting from database:", err)
  );
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down application...");
  await disconnectFromDatabase().catch((err) =>
    console.error("Error disconnecting from database:", err)
  );
  process.exit(0);
});

main().catch((err) => {
  console.error("Unhandled error in main process:", err);
  process.exit(1);
});
