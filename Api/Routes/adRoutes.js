import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import Ad from "../models/Ad.js";
import Product from "../models/Product.js";

const router = express.Router();

// ==================== PUBLIC ====================
router.get("/active", async (req, res) => {
  try {
    const now = new Date();
    const activeAds = await Ad.find({
      status: "active",
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).populate("product", "name price images").limit(10);
    res.json(activeAds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== SELLER (authenticated) ====================
// Get seller's own ads
router.get("/my-ads", authMiddleware, async (req, res) => {
  try {
    const ads = await Ad.find({ seller: req.user._id }).populate("product", "name price");
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new ad (draft, not yet paid)
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { productId, title, description, image, endDate, link } = req.body;
    const seller = req.user._id;

    // verify product belongs to seller
    const product = await Product.findOne({ _id: productId, seller });
    if (!product) {
      return res.status(403).json({ message: "You can only advertise your own products" });
    }

    const ad = new Ad({
      seller,
      product: productId,
      title,
      description,
      image,
      link,
      endDate: new Date(endDate),
      status: "draft", 
    });
    await ad.save();
    res.status(201).json(ad);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Simulate payment
router.put("/:id/pay", authMiddleware, async (req, res) => {
  try {
    const ad = await Ad.findOne({ _id: req.params.id, seller: req.user._id });
    if (!ad) return res.status(404).json({ message: "Ad not found" });
    if (ad.status !== "draft") {
      return res.status(400).json({ message: "Ad already processed" });
    }
    ad.status = "pending"; // now waiting for admin approval
    ad.pricePaid = 1000;
    ad.paymentMethod = "simulated";
    await ad.save();
    res.json({ message: "Payment recorded, ad pending admin approval", ad });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete an ad (only if still draft or pending)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const ad = await Ad.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
    if (!ad) return res.status(404).json({ message: "Ad not found" });
    res.json({ message: "Ad deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== ADMIN ROUTES (add these) ====================
// Get all pending ads (waiting for admin approval)
router.get("/admin/pending", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden. Admin only." });
    }
    const pendingAds = await Ad.find({ status: "pending" })
      .populate("seller", "name email")
      .populate("product", "name price images");
    res.json(pendingAds);
  } catch (err) {
    console.error("Error fetching pending ads:", err);
    res.status(500).json({ message: err.message });
  }
});

// Admin approve ad
router.patch("/admin/:id/approve", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden. Admin only." });
    }
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });
    ad.status = "active";
    ad.startDate = new Date(); // set start date to now
    await ad.save();
    res.json({ message: "Ad approved successfully", ad });
  } catch (err) {
    console.error("Error approving ad:", err);
    res.status(500).json({ message: err.message });
  }
});

// Admin reject ad
router.patch("/admin/:id/reject", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden. Admin only." });
    }
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });
    ad.status = "rejected";
    await ad.save();
    res.json({ message: "Ad rejected", ad });
  } catch (err) {
    console.error("Error rejecting ad:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;