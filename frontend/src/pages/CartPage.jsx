import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useCart } from "../CartContext";
import { useToast } from "../ToastContext";
import API from "../api";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const { user } = useAuth();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);

  if (!user || user.role !== "buyer") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Please login as a buyer to view cart.</p>
          <Link to="/login" className="mt-4 inline-block text-green-600 hover:underline">Login</Link>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast("Your cart is empty", "warning");
      return;
    }
    setCheckoutLoading(true);
    try {
      for (const item of cart) {
        await API.post("/orders", {
          productId: item.product._id,
          farmerId: item.product.seller?._id || item.product.farmer?._id,
          quantity: item.quantity
        });
      }
      showToast(`✅ ${cart.length} order(s) placed successfully!`, "success");
      clearCart();
      navigate("/orders");
    } catch (err) {
      console.error("Checkout failed:", err);
      showToast("Failed to place orders. Please try again.", "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleRemoveItem = (productId, productName) => {
    removeFromCart(productId);
    showToast(`Removed ${productName} from cart`, "warning");
  };

  const handleUpdateQuantity = (productId, newQuantity, productName) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      showToast(`Removed ${productName} from cart`, "warning");
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const total = getCartTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6 transition"
        >
          <ArrowLeft size={20} /> Continue Shopping
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <ShoppingBag /> Your Cart ({cart.length} items)
        </h1>

        {cart.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-12 text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">Your cart is empty.</p>
            <p className="text-sm text-gray-400 mt-1">Browse products and add items you love!</p>
            <Link to="/products" className="mt-4 inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {cart.map((item, index) => (
              <motion.div 
                key={item.product._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row justify-between items-center gap-4 hover:shadow-md transition"
              >
                <img 
                  src={item.product.images?.[0] || "/placeholder.png"} 
                  alt={item.product.name} 
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => e.target.src = "/placeholder.png"}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">{item.product.category}</p>
                  <p className="text-green-600 font-medium">{item.product.price.toLocaleString()} SYP</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1, item.product.name)} 
                    className="p-1 rounded-full hover:bg-gray-100 transition"
                  >
                    <Minus size={18} className="text-gray-600" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1, item.product.name)} 
                    className="p-1 rounded-full hover:bg-gray-100 transition"
                  >
                    <Plus size={18} className="text-gray-600" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{(item.product.price * item.quantity).toLocaleString()} SYP</p>
                  <button 
                    onClick={() => handleRemoveItem(item.product._id, item.product.name)} 
                    className="text-red-500 text-sm flex items-center gap-1 mt-1 hover:text-red-700 transition"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-4 mt-6 border border-gray-100"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-800">Total:</span>
                <span className="text-2xl font-bold text-green-700">{total.toLocaleString()} SYP</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checkoutLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Proceed to Checkout"
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}