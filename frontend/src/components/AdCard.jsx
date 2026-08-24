// src/components/AdCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink, ShoppingCart } from "lucide-react";
import { useAuth } from "../AuthContext";
import { useCart } from "../CartContext";
import { useToast } from "../ToastContext";

export default function AdCard({ ad }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  const product = ad.product;
  const targetLink = ad.link || `/product/${product?._id}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      showToast("Please login to add items to cart", "warning");
      return;
    }
    if (user.role !== "buyer") {
      showToast("Only buyers can add to cart", "warning");
      return;
    }
    addToCart(product, 1);
    showToast(`🛒 ${product?.name || "Product"} added to cart!`, "success");
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 shadow-md overflow-hidden w-64 flex-shrink-0"
    >
      {/* Sponsored badge */}
      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full z-10">
        Sponsored
      </div>

      {/* Product image */}
      <img
        src={ad.image}
        alt={ad.title}
        className="w-full h-32 object-cover"
      />

      <div className="p-3">
        {/* Ad title */}
        <h4 className="font-semibold text-gray-800 text-sm">{ad.title}</h4>
        
        {/* Product name */}
        {product?.name && (
          <p className="text-xs text-gray-400 mt-0.5">{product.name}</p>
        )}
        
        {/* Description */}
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ad.description}</p>

        {/* Price */}
        {product?.price && (
          <p className="text-green-700 font-bold text-sm mt-1">
            {product.price.toLocaleString()} SYP
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-2 mt-2">
          <Link
            to={targetLink}
            className="flex-1 inline-flex items-center justify-center gap-1 text-green-600 text-xs font-medium hover:underline py-1 px-2 border border-green-200 rounded-lg hover:bg-green-50 transition"
          >
            Learn More <ExternalLink size={12} />
          </Link>
          
          {/* Add to Cart button - only for buyers */}
          {user && user.role === "buyer" && product && (
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded-lg transition flex items-center justify-center gap-1"
            >
              <ShoppingCart size={12} /> Add
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}