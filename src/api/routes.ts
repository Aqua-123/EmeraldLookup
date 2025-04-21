import { Router } from "express";
import { getMessages, getMessageById, getStats } from "./controllers.js";

const router = Router();

// Message endpoints
router.get("/messages", getMessages);
router.get("/messages/:id", getMessageById);
router.get("/stats", getStats);

// Add additional routes as needed
// e.g., router.get("/users", getUsers);

export default router;
