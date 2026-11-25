// src/pages/Products.jsx
import React, { useEffect, useState } from "react";
import API from "../api";
import { useAuth } from "../AuthContext";
import { useCart } from "../CartContext";
import { useToast } from "../ToastContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/navbar";
import { ShoppingBag, Filter, PlusCircle, Loader2 } from "lucide-react";
import Footer from "../components/footer";
import AdsSection from "../components/AdsSection";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(category && { category }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
      });
      const res = await API.get(`/products?${params.toString()}`);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products:", err);
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const handleAddToCart = (product) => {
    if (!user) {
      showToast("Please login to add items to cart", "warning");
      return;
    }
    if (user.role !== "buyer") {
      showToast("Only buyers can add to cart", "warning");
      return;
    }
    addToCart(product, 1);
    showToast(`🛒 ${product.name} added to cart!`, "success");
  };

  const getFarmer = (product) => product.farmer || product.seller || null;

  const isAdmin = user?.role === "admin";
  const isFarmer = user && (user.role === "farmer" || user.role === "seller");

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await API.delete(`/products/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
      showToast("✅ Product deleted successfully!", "success");
    } catch (err) {
      console.error("Failed to delete product:", err);
      showToast("Failed to delete product", "error");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8 flex-wrap gap-4"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="text-green-700" size={36} />
              <h2 className="text-4xl font-extrabold text-gray-800">
                Fresh from Syrian Farms
              </h2>
            </div>
            {isFarmer && (
              <Link
                to="/add-product"
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg hover:bg-green-700 transition font-semibold"
              >
                <PlusCircle size={20} /> Add Product
              </Link>
            )}
          </motion.div>

          {/* Filters */}
          <motion.form
            onSubmit={handleFilter}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-20 z-10 flex flex-wrap gap-3 bg-white/80 backdrop-blur-sm border border-gray-200 p-4 rounded-2xl shadow-lg mb-10"
          >
            <input
              type="text"
              placeholder="🔎 Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-45 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">All Categories</option>
              <option value="Vegetables">🥬 Vegetables</option>
              <option value="Fruits">🍎 Fruits</option>
              <option value="Dairy">🥛 Dairy</option>
              <option value="Grains">🌾 Grains & Pulses</option>
              <option value="Honey">🍯 Honey</option>
              <option value="Herbs">🌿 Herbs & Spices</option>
              <option value="Olive Oil">🍈 Olive Oil</option>
              <option value="Other">📦 Other</option>
            </select>
            <input
              type="number"
              placeholder="Min SYP"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-28 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />
            <input
              type="number"
              placeholder="Max SYP"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-28 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-xl font-semibold shadow-md hover:bg-green-700 transition"
            >
              <Filter size={18} /> Filter
            </motion.button>
          </motion.form>

          {/* Ads Section */}
          <AdsSection />

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center mt-20">
              <Loader2 className="animate-spin text-green-600" size={40} />
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.length > 0 ? (
                products.map((p) => {
                  const farmer = getFarmer(p);
                  const canDelete = isAdmin || (isFarmer && farmer?._id === user?._id);
                  return (
                    <motion.div
                      key={p._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition p-4 flex flex-col"
                    >
                      <img
                        src={p.images?.[0] || "/placeholder.png"}
                        alt={p.name}
                        className="w-full h-48 object-cover rounded-xl shadow-sm"
                      />
                      <h3 className="font-bold mt-3 text-lg text-gray-800">{p.name}</h3>
                      <p className="text-gray-500 text-sm mb-1">{p.category}</p>
                      <p className="font-bold text-green-700 text-xl">
                        {p.price.toLocaleString()} SYP
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Farmer:{" "}
                        {farmer?.name ? (
                          <Link
                            to={`/seller/${farmer._id}`}
                            className="text-green-700 font-medium hover:underline"
                          >
                            {farmer.name}
                          </Link>
                        ) : (
                          "Unknown"
                        )}
                      </p>

                      {user && user.role === "buyer" && (
                        <div className="mt-4 flex gap-2">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAddToCart(p)}
                            className="flex-1 bg-green-600 text-white py-2 rounded-xl font-medium hover:bg-green-700 shadow-md transition"
                          >
                            🛒 Add to Cart
                          </motion.button>
                          {farmer?._id && (
                            <Link
                              to={`/chat/${farmer._id}`}
                              className="flex-1 bg-emerald-700 text-white text-center py-2 rounded-xl font-medium hover:bg-emerald-800 shadow-md transition"
                            >
                              💬 Chat
                            </Link>
                          )}
                        </div>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="mt-3 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-medium transition"
                        >
                          🗑️ {isAdmin ? "Delete (Admin)" : "Delete"}
                        </button>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center col-span-full text-lg font-medium">
                  No products found. Try adjusting your filters.
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Products;