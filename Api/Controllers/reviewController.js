import Review from "../models/Review.js";
import User from "../models/User.js";

export const createReview = async (req, res) => {
  try {
    const { sellerId, rating, comment } = req.body;

    // Prevent self-review (optional but good practice)
    if (String(req.user._id) === String(sellerId)) {
      return res.status(400).json({ message: "You cannot review yourself." });
    }

    const review = await Review.create({
      reviewer: req.user._id, 
      seller: sellerId,
      rating,
      comment,
    });

    const populated = await review.populate("reviewer", "name");
    res.status(201).json(populated);
  } catch (err) {
    console.error("❌ Error creating review:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getReviewsForSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // ✅ Fix: Proper find + filter + populate + sort
    const reviews = await Review.find({ seller: sellerId })
      .populate("reviewer", "name email")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("❌ Error fetching reviews:", err);
    res.status(500).json({ message: "Server error" });
  }
};
