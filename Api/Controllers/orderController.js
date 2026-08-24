import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    const { productId } = req.body;
    const buyerId = req.user.id;

    const product = await Product.findById(productId).populate("seller");
    if (!product) return res.status(404).json({ message: "Product not found" });

    const order = await Order.create({
      productId: product._id,
      buyerId,
      sellerId: product.seller._id,
      status: "pending",
      statusHistory: [{ status: "pending", date: new Date() }],
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(400).json({ error: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    let orders;
    const userId = req.user._id; // Use consistent field

    // Admin sees all orders
    if (req.user.role === "admin") {
      orders = await Order.find()
        .populate("productId", "name price category unit")
        .populate("buyerId", "name email")
        .populate("sellerId", "name email")
        .sort({ createdAt: -1 });
    }
    // Seller sees their received orders
    else if (req.user.role === "seller") {
      orders = await Order.find({ sellerId: userId })
        .populate("productId", "name price category unit")
        .populate("buyerId", "name email")
        .populate("sellerId", "name email")
        .sort({ createdAt: -1 });
    }
    // Buyer sees their purchased orders
    else {
      orders = await Order.find({ buyerId: userId })
        .populate("productId", "name price category unit")
        .populate("buyerId", "name email")
        .populate("sellerId", "name email")
        .sort({ createdAt: -1 });
    }

    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.status = status;
    order.statusHistory.push({ status });
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Error updating order status", error: err.message });
  }
};

