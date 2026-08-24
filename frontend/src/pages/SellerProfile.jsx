// src/pages/SellerProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Navbar from "../components/navbar";
import API from "../api";
import { motion } from "framer-motion";
import { 
  Store, 
  Star, 
  Mail, 
  Calendar, 
  MessageCircle,
  ThumbsUp,
  User,
  Loader2,
  Send,
  CheckCircle
} from "lucide-react";

export default function SellerProfile() {
  const { id: paramId } = useParams();
  // Fallback: get ID from URL path if param is empty
  const pathId = window.location.pathname.split('/').pop();
  const sellerId = paramId || pathId;
  
  const { user } = useAuth();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ productCount: 0, reviewCount: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  console.log("Param ID:", paramId);
  console.log("Path ID:", pathId);
  console.log("Final seller ID:", sellerId);

  // Fetch seller profile
  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!sellerId) {
          console.error("No seller ID provided");
          setError("No seller ID provided");
          setLoading(false);
          return;
        }
        
        console.log("Fetching profile for seller ID:", sellerId);
        
        // Fetch seller profile
        const res = await API.get(`/users/${sellerId}/profile`);
        console.log("Profile response:", res.data);
        
        const { seller: sellerData, products: productsData, stats: statsData } = res.data;
        
        setSeller(sellerData);
        setProducts(productsData || []);
        setStats(statsData || { productCount: 0, reviewCount: 0, avgRating: 0 });
        
        // Fetch reviews
        try {
          const reviewsRes = await API.get(`/reviews/${sellerId}`);
          console.log("Reviews response:", reviewsRes.data);
          setReviews(reviewsRes.data || []);
        } catch (err) {
          console.log("No reviews found");
          setReviews([]);
        }
        
      } catch (err) {
        console.error("Error fetching seller profile:", err);
        console.error("Error details:", err.response?.data);
        setError(err.response?.data?.message || "Failed to load seller profile");
        setSeller(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (sellerId) {
      fetchSellerProfile();
    } else {
      setLoading(false);
      setError("No seller ID provided");
    }
  }, [sellerId]);

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to leave a review");
      return;
    }
    if (user.role !== "buyer") {
      alert("Only buyers can leave reviews");
      return;
    }
    if (user._id === sellerId) {
      alert("You cannot review yourself");
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/reviews", {
        sellerId: sellerId,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSubmitted(true);
      setReviewComment("");
      setReviewRating(5);
      // Refresh reviews
      const reviewsRes = await API.get(`/reviews/${sellerId}`);
      setReviews(reviewsRes.data);
      setTimeout(() => setReviewSubmitted(false), 3000);
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert(err.response?.data?.message || "Could not submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading seller profile...</p>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">{error || "Seller not found"}</p>
          <p className="text-gray-400 text-sm mb-6">Seller ID: {sellerId}</p>
          <Link to="/products" className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Seller Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
        >
          <div className="bg-linear-to-r from-green-700 to-green-600 px-6 py-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Store className="w-12 h-12 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-white">{seller.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 justify-center md:justify-start">
                  <span className="flex items-center gap-1 text-green-100">
                    <CheckCircle className="w-4 h-4" />
                    {seller.status === "verified" ? "Verified Seller" : "Pending Verification"}
                  </span>
                  {stats.avgRating > 0 && (
                    <span className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-sm">
                      <Star className="w-4 h-4 fill-current" />
                      {stats.avgRating} ★ ({stats.reviewCount} {stats.reviewCount === 1 ? "review" : "reviews"})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{seller.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(seller.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            {/* Stats badges */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="bg-green-50 rounded-lg px-3 py-1">
                <span className="text-sm text-gray-600">Products:</span>
                <span className="ml-1 font-semibold text-green-700">{stats.productCount}</span>
              </div>
              <div className="bg-yellow-50 rounded-lg px-3 py-1">
                <span className="text-sm text-gray-600">Reviews:</span>
                <span className="ml-1 font-semibold text-yellow-700">{stats.reviewCount}</span>
              </div>
            </div>
            
            {/* Chat button for buyers */}
            {user && user.role === "buyer" && user._id !== sellerId && (
              <div className="mt-4">
                <Link
                  to={`/chats/${sellerId}`}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message {seller.name.split(' ')[0]}
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Products Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Store className="w-6 h-6 text-green-700" />
            Products by {seller.name.split(' ')[0]}
          </h2>
          
          {products.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-500">No products listed yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group"
                >
                  <img
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => { e.target.src = "/placeholder.png" }}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                    <p className="text-green-700 font-bold">{product.price.toLocaleString()} SYP</p>
                    <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500 fill-current" />
              Customer Reviews
              {reviews.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              )}
            </h2>
          </div>

          {/* Review Form */}
          {user && user.role === "buyer" && user._id !== sellerId && seller.status === "verified" && (
            <div className="px-6 py-4 bg-green-50 border-b border-green-100">
              <h3 className="font-semibold text-gray-800 mb-3">Leave a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-700">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this seller..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  rows="3"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Review
                </button>
                {reviewSubmitted && (
                  <p className="text-green-600 text-sm">✓ Review submitted! Thank you.</p>
                )}
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="p-6">
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <ThumbsUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, idx) => (
                  <motion.div
                    key={review._id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-100 pb-4 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-green-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <div>
                            <span className="font-semibold text-gray-800">
                              {review.reviewer?.name || "Anonymous"}
                            </span>
                            <div className="flex items-center gap-1 ml-0 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-600 mt-1">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}