import express from "express";
import { register, login } from "../Controllers/authController.js";
import { getMe } from "../Controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";
const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.post("/register", register);
router.post("/login", login);

export default router;
