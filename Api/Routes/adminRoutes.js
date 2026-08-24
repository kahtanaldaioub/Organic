// routes/adminRoutes.js
import express from "express";
import { verifySeller ,getAllSellers } from "../controllers/adminContoller.js";
import { authMiddleware ,adminOnly } from "../middleware/auth.js";
import { getSellerStats, getTopBuyers } from "../controllers/adminContoller.js";
import Ad from "../models/Ad.js";

const router = express.Router();

router.patch("/verify-seller/:id", authMiddleware,adminOnly, verifySeller);
router.get("/sellers", authMiddleware,adminOnly, getAllSellers);


router.get("/seller-stats", authMiddleware, adminOnly, getSellerStats);
router.get("/top-buyers", authMiddleware, adminOnly, getTopBuyers);

router.get("/admin/pending", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  const pendingAds = await Ad.find({ status: "pending" })
    .populate("seller", "name email")
    .populate("product", "name price images");
  res.json(pendingAds);
});

router.patch("/admin/:id/approve", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  const ad = await Ad.findById(req.params.id);
  if (!ad) return res.status(404).json({ message: "Ad not found" });
  ad.status = "active";
  await ad.save();
  res.json({ message: "Ad approved" });
});

router.patch("/admin/:id/reject", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  const ad = await Ad.findById(req.params.id);
  if (!ad) return res.status(404).json({ message: "Ad not found" });
  ad.status = "rejected";
  await ad.save();
  res.json({ message: "Ad rejected" });
});
export default router;
