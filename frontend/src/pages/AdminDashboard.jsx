import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { motion } from "framer-motion";
import { useToast } from "../ToastContext";
import Navbar from "../components/navbar";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Users,
  Store,
  Clock,
  Megaphone,
  TrendingUp,
  Crown
} from "lucide-react";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // ---------- State for sellers & ads ----------
  const [sellers, setSellers] = useState([]);
  const [pendingAds, setPendingAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [adActionLoading, setAdActionLoading] = useState(null);
  const [filter, setFilter] = useState("pending"); // "pending", "verified", "ads"

  // ---------- State for analytics ----------
  const [sellerStats, setSellerStats] = useState([]);
  const [topBuyers, setTopBuyers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statsLoading, setStatsLoading] = useState(false);

  // ---------- Redirect if not admin ----------
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  // ---------- Fetch sellers & pending ads ----------
  const fetchSellers = async () => {
    try {
      const res = await API.get("/admin/sellers");
      setSellers(res.data);
    } catch (err) {
      console.error("Failed to fetch sellers:", err);
      showToast("Failed to fetch sellers", "error");
    }
  };

  const fetchPendingAds = async () => {
    try {
      const res = await API.get("/ads/admin/pending");
      setPendingAds(res.data);
    } catch (err) {
      console.error("Failed to fetch pending ads:", err);
      // Don't show error toast for 404 - it might just mean no ads
      if (err.response?.status !== 404) {
        showToast("Failed to fetch pending ads", "error");
      }
      setPendingAds([]);
    }
  };

  // ---------- Fetch analytics (seller stats & top buyers) ----------
  const fetchAnalytics = async () => {
    setStatsLoading(true);
    try {
      const [sellerRes, buyerRes] = await Promise.all([
        API.get(`/admin/seller-stats?month=${selectedMonth}&year=${selectedYear}`),
        API.get(`/admin/top-buyers?month=${selectedMonth}&year=${selectedYear}`)
      ]);
      setSellerStats(sellerRes.data);
      setTopBuyers(buyerRes.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      showToast("Failed to fetch analytics", "error");
    } finally {
      setStatsLoading(false);
    }
  };

  // ---------- Initial data load ----------
  useEffect(() => {
    if (user?.role === "admin") {
      Promise.all([fetchSellers(), fetchPendingAds()]).finally(() => setLoading(false));
    }
  }, [user]);

  // Reload analytics when month/year changes
  useEffect(() => {
    if (user?.role === "admin") {
      fetchAnalytics();
    }
  }, [selectedMonth, selectedYear, user]);

  // ---------- Action handlers ----------
  const verifySeller = async (sellerId) => {
    setActionLoading(sellerId);
    try {
      await API.patch(`/admin/verify-seller/${sellerId}`);
      await fetchSellers();
      showToast("✅ Seller verified successfully!", "success");
    } catch (err) {
      console.error("Failed to verify seller:", err);
      showToast("Could not verify seller. Please try again.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const approveAd = async (adId) => {
    setAdActionLoading(adId);
    try {
      await API.patch(`/ads/admin/${adId}/approve`);
      await fetchPendingAds();
      showToast("✅ Ad approved and will appear on the marketplace.", "success");
    } catch (err) {
      console.error("Failed to approve ad:", err);
      showToast("Failed to approve ad", "error");
    } finally {
      setAdActionLoading(null);
    }
  };

  const rejectAd = async (adId) => {
    setAdActionLoading(adId);
    try {
      await API.patch(`/ads/admin/${adId}/reject`);
      await fetchPendingAds();
      showToast("Ad rejected.", "success");
    } catch (err) {
      console.error("Failed to reject ad:", err);
      showToast("Failed to reject ad", "error");
    } finally {
      setAdActionLoading(null);
    }
  };

  // Filter sellers by status
  const filteredSellers = sellers.filter((seller) => {
    if (filter === "pending") return seller.status === "pending";
    if (filter === "verified") return seller.status === "verified";
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-green-700" />
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            </div>
            <p className="text-gray-500">Manage sellers, ads, and view platform analytics</p>
          </motion.div>

          {/* Month / Year Picker for Statistics */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-green-700" />
              <h2 className="font-semibold text-gray-700">Monthly Analytics</h2>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-1 border rounded-lg bg-white"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1, 1).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-1 border rounded-lg bg-white"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchAnalytics}
                className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700 transition"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Seller Performance Table */}
          <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Store size={20} /> Seller Performance (Month)
              </h2>
            </div>
            {statsLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="animate-spin mx-auto text-green-600" />
              </div>
            ) : sellerStats.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No completed orders this month.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue (SYP)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sellerStats.map((stat) => (
                      <tr key={stat.sellerId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{stat.sellerName}</div>
                          <div className="text-sm text-gray-500">{stat.sellerEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{stat.totalOrders}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{stat.productsSold}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">
                          {stat.totalRevenue.toLocaleString()} SYP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Buyers Table */}
          
          <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Crown size={20} className="text-yellow-500" /> Top Customers (Month)
              </h2>
            </div>
            {statsLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="animate-spin mx-auto text-green-600" />
              </div>
            ) : topBuyers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No buyers this month.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent (SYP)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topBuyers.map((buyer, idx) => (
                      <tr key={buyer.buyerId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{buyer.buyerName}</div>
                          <div className="text-sm text-gray-500">{buyer.buyerEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{buyer.orderCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">
                          {buyer.totalSpent.toLocaleString()} SYP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tabs for Seller Management and Ad Approval */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 font-medium transition whitespace-nowrap ${
                filter === "pending"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Clock className="w-4 h-4 inline mr-1" />
              Pending Sellers ({sellers.filter((s) => s.status === "pending").length})
            </button>
            <button
              onClick={() => setFilter("verified")}
              className={`px-4 py-2 font-medium transition whitespace-nowrap ${
                filter === "verified"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Verified Sellers ({sellers.filter((s) => s.status === "verified").length})
            </button>
            <button
              onClick={() => setFilter("ads")}
              className={`px-4 py-2 font-medium transition whitespace-nowrap ${
                filter === "ads"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Megaphone className="w-4 h-4 inline mr-1" />
              Pending Ads ({pendingAds.length})
            </button>
          </div>

          {/* Sellers List (pending / verified) */}
          {filter !== "ads" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSellers.length === 0 ? (
                <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
                  {filter === "pending" ? (
                    <>
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No pending sellers</p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No verified sellers yet</p>
                    </>
                  )}
                </div>
              ) : (
                filteredSellers.map((seller) => (
                  <div
                    key={seller._id}
                    className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Store className="w-6 h-6 text-green-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{seller.name}</h3>
                        <p className="text-sm text-gray-500">{seller.email}</p>
                      </div>
                    </div>
                    <div className="mb-4 text-sm text-gray-600">
                      <p>📅 Joined: {new Date(seller.createdAt).toLocaleDateString()}</p>
                      <p>
                        Status:{" "}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                            seller.status === "verified"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {seller.status === "verified" ? "✓ Verified" : "⏳ Pending"}
                        </span>
                      </p>
                    </div>
                    {seller.status === "pending" && (
                      <button
                        onClick={() => verifySeller(seller._id)}
                        disabled={actionLoading === seller._id}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center gap-1 transition"
                      >
                        {actionLoading === seller._id ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Verify Seller
                      </button>
                    )}
                    {seller.status === "verified" && (
                      <div className="text-center text-sm text-green-600">✓ Verified seller</div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pending Ads List */}
          {filter === "ads" && (
            <div className="space-y-4">
              {pendingAds.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center text-gray-500">No pending ads</div>
              ) : (
                pendingAds.map((ad) => (
                  <div
                    key={ad._id}
                    className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center flex-wrap gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={ad.image}
                        alt={ad.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-semibold">{ad.title}</p>
                        <p className="text-sm text-gray-500">
                          Seller: {ad.seller?.name} | Product: {ad.product?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Created: {new Date(ad.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveAd(ad._id)}
                        disabled={adActionLoading === ad._id}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition"
                      >
                        {adActionLoading === ad._id ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => rejectAd(ad._id)}
                        disabled={adActionLoading === ad._id}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}