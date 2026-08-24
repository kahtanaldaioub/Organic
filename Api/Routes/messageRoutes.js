import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  sendMessage,
  getMessages,
  getConversations,
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/", authMiddleware, sendMessage);
router.get("/:userId", authMiddleware, getMessages);
router.get("/", authMiddleware, getConversations);

export default router;
