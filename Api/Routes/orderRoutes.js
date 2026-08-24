import express from "express";
import { createOrder, getAllOrders ,updateOrderStatus  } from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getAllOrders);
router.patch("/:id/status", authMiddleware, updateOrderStatus);

export default router;
