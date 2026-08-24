import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "shipped", "completed"], 
    default: "pending" 
  },
  statusHistory: [
    {
      status: String,
      date: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order; 
