import mongoose from "mongoose";

const adSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    link: { type: String, default: "" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ["draft", "pending", "active", "rejected", "expired"], 
      default: "draft" 
    },
    pricePaid: { type: Number, default: 0 },
    paymentMethod: { type: String, default: "cash" },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Ad", adSchema);