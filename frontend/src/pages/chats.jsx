import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { motion } from "framer-motion";
import { MessageCircle, Search, User, Store } from "lucide-react";
import { useAuth } from "../AuthContext";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
export default function Chats() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      try {
        const res = await API.get("/messages/");
        const filtered = res.data.filter((u) => u._id !== user._id);
        setUsers(filtered);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-green-600">Loading conversations...</div>
      </div>
    );
  }

  return (
    <><Navbar/>
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
            <MessageCircle className="w-8 h-8 text-green-700" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Your Messages</h1>
          <p className="text-gray-500 mt-2">Chat directly with farmers and buyers</p>
        </motion.div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Conversation list */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No conversations yet</p>
            <p className="text-sm text-gray-400 mt-1">Start exploring products to connect with farmers</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((other, idx) => (
              <motion.div
                key={other._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => navigate(`/chat/${other._id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition cursor-pointer flex items-center gap-4"
              >
                {/* Avatar */}
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  {other.role === "farmer" || other.role === "seller" ? (
                    <Store className="w-6 h-6 text-green-700" />
                  ) : (
                    <User className="w-6 h-6 text-green-700" />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800">{other.name}</h3>
                </div>
                {/* Chat button */}
                <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm">
                  Message
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
}