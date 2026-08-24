import Product from "../models/Product.js";
import User from "../models/User.js";

export const createProduct = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "seller")
      return res.status(403).json({ message: "Only sellers can create products" });
    if (user.status !== "verified")
      return res.status(403).json({ message: "Your seller account is pending approval." });

    const product = await Product.create({
      ...req.body,
      seller: req.user._id,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET /api/products?category=Electronics&minPrice=10&maxPrice=200&search=phone

export const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (minPrice || maxPrice)
      query.price = {
        ...(minPrice && { $gte: Number(minPrice) }),
        ...(maxPrice && { $lte: Number(maxPrice) }),
      };
    if (search) query.name = { $regex: search, $options: "i" };

    // ✅ Populating with explicit path and select fields
    const products = await Product.find(query).populate({
      path: "seller",
      select: "name email",
    });

    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // البحث عن المنتج
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // التحقق من الصلاحية: المزارع صاحب المنتج أو المدير
    if (userRole !== "admin" && product.seller.toString() !== userId.toString()) {
      return res.status(403).json({ 
        message: "You are not authorized to delete this product" 
      });
    }

    await Product.findByIdAndDelete(id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: err.message });
  }
};


