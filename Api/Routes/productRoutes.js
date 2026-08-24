import express from "express";
import { createProduct, getProducts } from "../controllers/productController.js";
import { authMiddleware } from "../middleware/auth.js";
import { deleteProduct } from "../controllers/productController.js";

const router = express.Router();

router.post("/", authMiddleware, createProduct);   // Seller adds product
router.get("/", getProducts); 
router.delete("/:id", authMiddleware, deleteProduct);  
// Get single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // If you have a seller field, populate it
    if (product.seller) {
      await product.populate("seller", "name email");
    }
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;
