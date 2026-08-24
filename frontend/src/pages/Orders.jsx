// src/pages/Orders.jsx
import { useEffect, useState } from "react";
import API from "../api";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";
import { useToast } from "../ToastContext";
import { Loader2, Package, CheckCircle } from "lucide-react";
import Navbar from "../components/navbar";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/orders");
      let ordersData = res.data;

      // Populate product details if not already populated
      for (let order of ordersData) {
        if (order.productId && typeof order.productId === 'string') {
          try {
            const productRes = await API.get(`/products/${order.productId}`);
            order.productDetails = productRes.data;
          } catch (err) {
            console.error(`Failed to fetch product ${order.productId}:`, err);
          }
        } else if (order.productId && typeof order.productId === 'object') {
          order.productDetails = order.productId;
        }
      }
      setOrders(ordersData);
    } catch (err) {
      console.error("Failed to load orders:", err);
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.patch(`/orders/${orderId}/status`, { status: newStatus });
      await loadOrders();
      showToast(`✅ Order status updated to ${newStatus}`, "success");
    } catch (err) {
      console.error("Failed to update order status:", err);
      showToast("Failed to update order status. Please try again.", "error");
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    completed: "bg-emerald-100 text-emerald-800",
  };

  const isFarmer = user?.role === "farmer" || user?.role === "seller";

  const getProductInfo = (order) => {
    const prod = order.productDetails || order.productId;
    return {
      name: prod?.name || "Unknown Product",
      category: prod?.category || "Not specified",
      price: prod?.price || 0,
    };
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex items-center justify-between mb-10"
          >
            <div className="flex items-center gap-3 text-gray-800">
              <Package size={36} className="text-green-700" />
              <h2 className="text-4xl font-extrabold">
                {isFarmer ? "📦 Orders Received" : "🛒 My Orders"}
              </h2>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex justify-center mt-20">
              <Loader2 size={40} className="animate-spin text-green-600" />
            </div>
          ) : orders.length === 0 ? (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-center text-lg mt-20"
            >
              No orders found yet.
            </motion.p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {orders.map((order, index) => {
                const product = getProductInfo(order);
                return (
                  <motion.div 
                    key={order._id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border rounded-2xl shadow-md hover:shadow-xl transition p-5 flex flex-col"
                  >
                    {/* Product Info */}
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-500">Category: {product.category}</p>
                      <p className="font-bold text-green-700 text-xl mt-1">{product.price.toLocaleString()} SYP</p>
                    </div>
                    
                    {/* Buyer/Seller Info */}
                    <div className="text-sm text-gray-700 mb-4 space-y-1">
                      <p><b>Buyer:</b> {order.buyerId?.name || "Unknown"}</p>
                      <p><b>Seller:</b> {order.sellerId?.name || "Unknown"}</p>
                    </div>
                    
                    {/* Status Section */}
                    <div className="mt-auto">
                      {isFarmer ? (
                        <select 
                          value={order.status} 
                          onChange={(e) => handleStatusChange(order._id, e.target.value)} 
                          className={`w-full px-3 py-2 rounded-xl border font-medium focus:ring-2 focus:ring-green-500 transition ${statusColors[order.status] || "bg-gray-100"}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <div>
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>
                            <CheckCircle size={16} /> 
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                          </div>
                          <div className="mt-3">
                            <h4 className="font-semibold text-gray-700 mb-1">Status History:</h4>
                            <ul className="text-sm text-gray-600 pl-3 list-disc space-y-1">
                              <li>Order placed — {new Date(order.createdAt).toLocaleString()}</li>
                              {order.statusHistory?.map((h, idx) => (
                                <li key={idx}>{h.status} — {new Date(h.date).toLocaleString()}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}