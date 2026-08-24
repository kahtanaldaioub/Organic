
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import API from "../api";
import { useAuth } from "../AuthContext";
import { PlusCircle, Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
export default function AddProduct() {
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    unit: "kg",
    stock: "",
    images: [""],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Debug: log user role
  useEffect(() => {
    if (!authLoading && user) {
      console.log("Current user role:", user.role);
    }
  }, [user, authLoading]);

  // Allow both "farmer" and "seller" (your backend might return "seller")
  const canAddProduct = user && (user.role === "farmer" || user.role === "seller");

  if (!authLoading && (!user || !canAddProduct)) {
    return <Navigate to="/products" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, value) => {
    const updatedImages = [...form.images];
    updatedImages[index] = value;
    setForm((prev) => ({ ...prev, images: updatedImages }));
  };

  const addImageField = () => {
    setForm((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const filteredImages = form.images.filter((url) => url.trim() !== "");
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        unit: form.unit,
        stock: parseInt(form.stock) || 0,
        images: filteredImages,
      };

      await API.post("/products", payload);
      setMessage("✅ Product added successfully! It will appear in the marketplace.");
      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        unit: "kg",
        stock: "",
        images: [""],
      });
    } catch (err) {
      console.error("Error adding product:", err);
      setMessage(err.response?.data?.message || "❌ Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <><Navbar />
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-6 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <PlusCircle size={36} className="text-green-700" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">
            Add a New Product
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            List your fresh, organic product for Syrian buyers 🌾
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="text"
            name="name"
            placeholder="Product Name (e.g., Fresh Organic Tomatoes)"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />

          <motion.textarea
            whileFocus={{ scale: 1.01 }}
            name="description"
            placeholder="Description (harvest date, quality, etc.)"
            value={form.description}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <motion.input
              whileFocus={{ scale: 1.01 }}
              name="price"
              type="number"
              step="0.01"
              placeholder="Price (SYP)"
              value={form.price}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />

            <motion.select
              whileFocus={{ scale: 1.01 }}
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              <option value="kg">per kg</option>
              <option value="g">per 100g</option>
              <option value="liter">per liter</option>
              <option value="bunch">per bunch</option>
              <option value="piece">per piece</option>
              <option value="box">per box</option>
            </motion.select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <motion.select
              whileFocus={{ scale: 1.01 }}
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            >
              <option value="">Select Category</option>
              <option value="Vegetables">🥬 Vegetables</option>
              <option value="Fruits">🍎 Fruits</option>
              <option value="Dairy">🥛 Dairy</option>
              <option value="Grains">🌾 Grains & Pulses</option>
              <option value="Honey">🍯 Honey</option>
              <option value="Herbs">🌿 Herbs & Spices</option>
              <option value="Olive Oil">🫒 Olive Oil</option>
              <option value="Other">📦 Other</option>
            </motion.select>

            <motion.input
              whileFocus={{ scale: 1.01 }}
              name="stock"
              type="number"
              placeholder="Available stock"
              value={form.stock}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {/* Images section */}
          <div>
            <p className="font-semibold mb-2 text-gray-700">Product Images (URLs)</p>
            {form.images.map((img, idx) => (
              <motion.input
                key={idx}
                whileFocus={{ scale: 1.01 }}
                type="text"
                placeholder={`Image URL ${idx + 1}`}
                value={img}
                onChange={(e) => handleImageChange(idx, e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none mb-2"
              />
            ))}
            <button
              type="button"
              onClick={addImageField}
              className="text-green-600 text-sm hover:underline mt-1"
            >
              + Add another image
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Paste direct image links (e.g., from Imgur, Cloudinary)
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold shadow-md transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Adding...
              </>
            ) : (
              "Add Product"
            )}
          </motion.button>
        </form>

        {message && (
          <p
            className={`mt-5 text-center font-medium ${
              message.startsWith("✅") ? "text-green-700" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </motion.div>
    </div>
    <Footer/>
    </>
  );
}