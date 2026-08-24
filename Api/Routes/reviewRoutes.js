// backend/routes/reviewRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { createReview, getReviewsForSeller } from "../controllers/reviewController.js";

const router = express.Router();

// create review (buyer)
router.post("/", authMiddleware, createReview);

// list reviews for a seller
router.get("/:sellerId", getReviewsForSeller);

export default router;
