// routes/userRoutes.js
import express from "express";
import { getAllUsers ,getUserProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/auth.js";



const router = express.Router();

router.get("/", authMiddleware, getAllUsers);
router.get("/:id/profile", getUserProfile);


export default router;
