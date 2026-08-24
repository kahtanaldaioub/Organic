// controllers/adminController.js
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
export const verifySeller = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "verified";
    await user.save();

    res.json({ message: "Seller verified successfully", user });
  } catch (err) {
    console.error("Error verifying seller:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// Get all sellers
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" }).select("name email status createdAt");
    res.json(sellers);
  } catch (err) {
    console.error("Error fetching sellers:", err);
    res.status(500).json({ message: "Server error" });
  }
};



export const getSellerStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Fetch all completed orders in the date range, populated with product
    const orders = await Order.find({
      status: "completed",
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate("productId").populate("sellerId", "name email");

    // Group by seller
    const sellerMap = new Map();
    for (const order of orders) {
      const sellerId = order.sellerId?._id.toString();
      if (!sellerId) continue;
      if (!sellerMap.has(sellerId)) {
        sellerMap.set(sellerId, {
          sellerId,
          sellerName: order.sellerId?.name || "Unknown",
          sellerEmail: order.sellerId?.email || "",
          totalRevenue: 0,
          totalOrders: 0,
          productsSold: 0
        });
      }
      const stat = sellerMap.get(sellerId);
      stat.totalRevenue += order.productId?.price || 0;
      stat.totalOrders += 1;
      stat.productsSold += 1;
    }

    const result = Array.from(sellerMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
    res.json(result);
  } catch (err) {
    console.error("Error in getSellerStats:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getTopBuyers = async (req, res) => {
  try {
    const { month, year, limit = 10 } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Fetch all completed orders in the date range, populated with product and buyer
    const orders = await Order.find({
      status: "completed",
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate("productId").populate("buyerId", "name email");

    // Group by buyer
    const buyerMap = new Map();
    for (const order of orders) {
      const buyerId = order.buyerId?._id.toString();
      if (!buyerId) continue;
      if (!buyerMap.has(buyerId)) {
        buyerMap.set(buyerId, {
          buyerId,
          buyerName: order.buyerId?.name || "Unknown",
          buyerEmail: order.buyerId?.email || "",
          totalSpent: 0,
          orderCount: 0
        });
      }
      const stat = buyerMap.get(buyerId);
      stat.totalSpent += order.productId?.price || 0;
      stat.orderCount += 1;
    }

    const result = Array.from(buyerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, parseInt(limit));
    res.json(result);
  } catch (err) {
    console.error("Error in getTopBuyers:", err);
    res.status(500).json({ message: err.message });
  }
};