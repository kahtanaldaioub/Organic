
import User from "../models/User.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("name email role");
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};



export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching profile for user ID:", id); // Debug log

    // Get the seller info
    const seller = await User.findById(id).select("-password");
    if (!seller) {
      console.log("Seller not found with ID:", id);
      return res.status(404).json({ message: "Seller not found" });
    }

    console.log("Seller found:", seller.name);

    // Get their products
    const products = await Product.find({ seller: id }).sort({ createdAt: -1 });
    console.log(`Found ${products.length} products`);

    // Calculate rating stats
    const reviews = await Review.find({ seller: id });
    const avgRating = reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

    const stats = {
      productCount: products.length,
      reviewCount: reviews.length,
      avgRating: Number(avgRating.toFixed(2)),
    };

    res.json({ seller, products, stats });
  } catch (err) {
    console.error("❌ Error fetching seller profile:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
};