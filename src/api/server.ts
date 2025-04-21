import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { connectToDatabase } from "../database.js";
import apiRoutes from "./routes.js";

// Create Express application
const app = express();
const PORT = process.env.PORT || 4120;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url} at ${new Date().toISOString()}`);
  next();
});

// API Routes
app.use("/api", apiRoutes);

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An internal server error occurred",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    },
  });
});

// Start server
export async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle termination
process.on("SIGINT", () => {
  console.log("API server shutting down...");
  process.exit(0);
});

// Auto-start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
