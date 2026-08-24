// src/pages/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api";
import { useAuth } from "../AuthContext";
import { useCart } from "../CartContext";
import { useToast } from "../ToastContext";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  MessageCircle, 
  ArrowLeft, 
  Star, 
  Truck, 
  Shield,
  Loader2
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      showToast("Please login to add items to cart", "warning");
      navigate("/login");
      return;
    }
    if (user.role !== "buyer") {
      showToast("Only buyers can add to cart", "warning");
      return;
    }
    setAddingToCart(true);
    addToCart(product, 1);
    showToast(`🛒 ${product.name} added to cart!`, "success");
    setTimeout(() => {
      setAddingToCart(false);
      navigate("/cart");
    }, 800);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">{error || "Product not found"}</p>
          <Link to="/products" className="mt-4 inline-block text-green-600 hover:underline">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const farmer = product.seller || product.farmer;
  const mainImage = product.images?.[0] || "/placeholder.png";
  const otherImages = product.images?.slice(1) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6 transition"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-96 object-cover"
                onError={(e) => (e.target.src = "/placeholder.png")}
              />
            </div>
            {otherImages.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {otherImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-gray-500 text-sm mb-1">{product.category}</p>
            <p className="text-3xl font-bold text-green-700 mb-4">{product.price.toLocaleString()} SYP</p>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
              <p className="text-gray-600">{product.description || "No description provided."}</p>
            </div>

            {farmer && (
              <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-2">Sold by</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Link to={`/seller/${farmer._id}`} className="text-green-700 font-medium hover:underline">
                      {farmer.name}
                    </Link>
                    <p className="text-sm text-gray-500">{farmer.email}</p>
                  </div>
                  {user && user.role === "buyer" && (
                    <Link to={`/chat/${farmer._id}`} className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-700 transition">
                      <MessageCircle size={16} /> Contact Farmer
                    </Link>
                  )}
                </div>
              </div>
            )}

            {user && user.role === "buyer" && (
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {addingToCart ? <Loader2 className="animate-spin w-5 h-5" /> : <ShoppingCart size={20} />}
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
            )}

            {!user && (
              <div className="text-center space-y-3">
                <p className="text-gray-500">Please log in to add items to cart.</p>
                <Link to="/login" className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                  Log in to Shop
                </Link>
              </div>
            )}

            <div className="mt-6 flex gap-4 text-xs text-gray-500 justify-center">
              <div className="flex items-center gap-1"><Shield size={14} /> Secure checkout</div>
              <div className="flex items-center gap-1"><Truck size={14} /> Local delivery</div>
              <div className="flex items-center gap-1"><Star size={14} /> 100% organic</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}