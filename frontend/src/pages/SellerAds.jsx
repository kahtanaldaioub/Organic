// src/pages/SellerAds.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/navbar";
import { useToast } from "../ToastContext";
import { 
  PlusCircle, CreditCard, Trash2, Loader2, AlertCircle, 
  X, CheckCircle, Calendar 
} from "lucide-react";

export default function SellerAds() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [ads, setAds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    title: "",
    description: "",
    image: "",
    endDate: "",
    link: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // ===== Payment modal state =====
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentStep, setPaymentStep] = useState("details");
  const [paymentMethod, setPaymentMethod] = useState("syriatel");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [paymentError, setPaymentError] = useState("");

  // ===== Calculate ad price based on duration =====
  const calculateAdPrice = (endDate) => {
    if (!endDate) return 10000;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Pricing tiers:
    // 1-3 days: 5000 SYP
    // 4-7 days: 10000 SYP
    // 8-14 days: 15000 SYP
    // 15-30 days: 25000 SYP
    // 31+ days: 40000 SYP
    
    if (diffDays <= 0) return 5000;
    if (diffDays <= 3) return 5000;
    if (diffDays <= 7) return 10000;
    if (diffDays <= 14) return 15000;
    if (diffDays <= 30) return 25000;
    return 40000;
  };

  // ===== Calculate days remaining =====
  const getDaysRemaining = (endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // ===== Get price tier label =====
  const getPriceTier = (endDate) => {
    const days = getDaysRemaining(endDate);
    if (days <= 3) return "1-3 days";
    if (days <= 7) return "4-7 days";
    if (days <= 14) return "8-14 days";
    if (days <= 30) return "15-30 days";
    return "31+ days";
  };

  // Redirect if not seller
  useEffect(() => {
    if (!user) return;
    if (user.role !== "seller" && user.role !== "farmer") navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adsRes, productsRes] = await Promise.all([
          API.get("/ads/my-ads"),
          API.get(`/products?sellerId=${user._id}`),
        ]);
        setAds(adsRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        console.error(err);
        showToast("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const createAd = async (e) => {
    e.preventDefault();
    const selectedEndDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedEndDate <= today) {
      showToast("End date must be in the future.", "warning");
      return;
    }
    
    // Check if end date is more than 90 days
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    if (selectedEndDate > maxDate) {
      showToast("Ad cannot run for more than 90 days.", "warning");
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await API.post("/ads/create", formData);
      setAds([res.data, ...ads]);
      setShowForm(false);
      setFormData({ productId: "", title: "", description: "", image: "", endDate: "", link: "" });
      showToast("Ad created! Complete the payment to submit for admin approval.", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create ad", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Open payment modal =====
  const openPaymentModal = (adId, adTitle, endDate) => {
    const price = calculateAdPrice(endDate);
    const days = getDaysRemaining(endDate);
    setPaymentModal({ adId, adTitle, price, days });
    setPaymentStep("details");
    setPaymentMethod("syriatel");
    setPhoneNumber("");
    setPinCode("");
    setPaypalEmail("");
    setProcessingProgress(0);
    setPaymentError("");
  };

  // ===== Close payment modal =====
  const closePaymentModal = () => {
    setPaymentModal(null);
    setPaymentStep("details");
  };

  // ===== Process payment =====
  const processPayment = async () => {
    // Validate based on payment method
    if (paymentMethod === "syriatel") {
      if (!phoneNumber || phoneNumber.length < 10) {
        setPaymentError("Please enter a valid phone number (09xxxxxxxx).");
        return;
      }
    }
    if (paymentMethod === "shamcash") {
      if (!phoneNumber || phoneNumber.length < 10) {
        setPaymentError("Please enter a valid phone number (09xxxxxxxx).");
        return;
      }
      if (!pinCode || pinCode.length < 4) {
        setPaymentError("Please enter a valid 4-digit PIN.");
        return;
      }
    }
    if (paymentMethod === "paypal") {
      if (!paypalEmail || !paypalEmail.includes("@")) {
        setPaymentError("Please enter a valid email address.");
        return;
      }
    }

    setPaymentStep("processing");
    setPaymentError("");
    setProcessingProgress(0);

    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    await new Promise(resolve => setTimeout(resolve, 2200));

    try {
      await API.put(`/ads/${paymentModal.adId}/pay`);
      const res = await API.get("/ads/my-ads");
      setAds(res.data);
      
      setPaymentStep("success");
      showToast("✅ Payment successful! Ad submitted for admin approval.", "success");
      
      setTimeout(() => {
        closePaymentModal();
      }, 2500);
    } catch (err) {
      setPaymentStep("details");
      setPaymentError("Payment failed. Please try again.");
    }
  };

  const deleteAd = async (adId) => {
    if (!window.confirm("Delete this ad?")) return;
    try {
      await API.delete(`/ads/${adId}`);
      setAds(ads.filter((ad) => ad._id !== adId));
      showToast("Ad deleted.", "success");
    } catch (err) {
      showToast("Failed to delete ad", "error");
    }
  };

  if (loading) return <div className="pt-24 flex justify-center"><Loader2 className="animate-spin text-green-600" /></div>;

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Contact info */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            📧 Need help? Contact the admin at{" "}
            <a href="mailto:aldaioubkahtan@gmail.com" className="underline font-medium">
              aldaioubkahtan@gmail.com
            </a>{" "}
            for any questions about your ads or payments.
          </div>
        </div>

        {/* Pricing Info */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 flex items-center gap-2">
            <Calendar size={18} /> Ad Pricing
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
            <div className="bg-white rounded p-2 text-center">
              <span className="font-bold text-green-700">1-3 days</span>
              <span className="block text-gray-600">5,000 SYP</span>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <span className="font-bold text-green-700">4-7 days</span>
              <span className="block text-gray-600">10,000 SYP</span>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <span className="font-bold text-green-700">8-14 days</span>
              <span className="block text-gray-600">15,000 SYP</span>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <span className="font-bold text-green-700">15+ days</span>
              <span className="block text-gray-600">25,000 SYP</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">* Maximum ad duration is 90 days.</p>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-gray-800">My Advertisements</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <PlusCircle size={18} /> {showForm ? "Cancel" : "Create Ad"}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">New Sponsored Ad</h2>
            <form onSubmit={createAd} className="space-y-4">
              <select name="productId" value={formData.productId} onChange={handleChange} required className="w-full p-2 border rounded-lg">
                <option value="">Select Product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name} - {p.price} SYP</option>)}
              </select>
              <input name="title" placeholder="Ad title" value={formData.title} onChange={handleChange} required className="w-full p-2 border rounded-lg" />
              <textarea name="description" placeholder="Short description" rows="2" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-lg" />
              <input name="image" placeholder="Image URL" value={formData.image} onChange={handleChange} required className="w-full p-2 border rounded-lg" />
              <input name="link" placeholder="Optional custom link" value={formData.link} onChange={handleChange} className="w-full p-2 border rounded-lg" />
              <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} className="w-full p-2 border rounded-lg" />
              
              {/* Show estimated price */}
              {formData.endDate && (
                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                  <span className="font-medium">Estimated Price:</span>
                  <span className="font-bold text-blue-600 ml-2">{calculateAdPrice(formData.endDate).toLocaleString()} SYP</span>
                  <span className="text-gray-500 ml-2">
                    ({getDaysRemaining(formData.endDate)} days • {getPriceTier(formData.endDate)})
                  </span>
                </div>
              )}
              
              <button type="submit" disabled={submitting} className="w-full bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Create Ad (will need payment)"}
              </button>
            </form>
          </motion.div>
        )}

        {/* Ads list */}
        {ads.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-500">No ads created yet. Promote your products!</div>
        ) : (
          <div className="space-y-4">
            {ads.map((ad) => {
              const daysRemaining = getDaysRemaining(ad.endDate);
              return (
                <div key={ad._id} className="bg-white rounded-xl shadow-md p-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex gap-3 flex-1">
                    <img src={ad.image} alt={ad.title} className="w-20 h-20 object-cover rounded-lg" />
                    <div>
                      <h3 className="font-semibold">{ad.title}</h3>
                      <p className="text-sm text-gray-500">{ad.description}</p>
                      <p className="text-xs text-gray-400">
                        Product: {ad.product?.name} | 
                        {ad.status === "active" && daysRemaining > 0
                          ? ` ${daysRemaining} days remaining` 
                          : ad.status === "active" && daysRemaining <= 0
                          ? " Expired"
                          : ` Ends: ${new Date(ad.endDate).toLocaleDateString()}`
                        }
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${ad.status === "active" ? "bg-green-100 text-green-700" : ad.status === "pending" ? "bg-yellow-100 text-yellow-700" : ad.status === "draft" ? "bg-gray-100 text-gray-500" : "bg-red-100 text-red-700"}`}>
                          {ad.status === "active" ? "Active" : ad.status === "pending" ? "Pending Admin" : ad.status === "draft" ? "Unpaid" : "Rejected"}
                        </span>
                        {ad.status === "active" && daysRemaining > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {daysRemaining} days left
                          </span>
                        )}
                        {ad.status === "active" && daysRemaining <= 0 && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            Expired
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {ad.status === "draft" && (
                      <button
                        onClick={() => openPaymentModal(ad._id, ad.title, ad.endDate)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition"
                      >
                        <CreditCard size={14} /> Pay Now
                      </button>
                    )}
                    <button onClick={() => deleteAd(ad._id)} className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-6 text-xs text-gray-400 text-center border-t pt-4">* Payment simulation: no real money is charged. After payment, your ad will be submitted for admin approval.</p>
      </div>

      {/* ===== PAYMENT MODAL ===== */}
      <AnimatePresence>
        {paymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closePaymentModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <CreditCard className="text-blue-600" size={24} />
                  Complete Payment
                </h2>
                <button
                  onClick={closePaymentModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                  disabled={paymentStep === "processing"}
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Ad Info */}
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Ad: <span className="font-medium text-gray-800">{paymentModal.adTitle}</span></p>
                  <p className="text-sm text-gray-500">Duration: <span className="font-medium text-gray-800">{paymentModal.days} days</span></p>
                  <p className="text-sm text-gray-500">Amount: <span className="font-bold text-blue-600">{paymentModal.price.toLocaleString()} SYP</span></p>
                </div>

                {/* Step: Details */}
                {paymentStep === "details" && (
                  <div>
                    {/* Payment Methods - Syrian */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Syriatel Cash */}
                        <button
                          onClick={() => setPaymentMethod("syriatel")}
                          className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-1 ${
                            paymentMethod === "syriatel"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                            SC
                          </div>
                          <span className="text-xs font-medium">Syriatel Cash</span>
                          <span className="text-[10px] text-gray-400">Mobile</span>
                        </button>

                        {/* Sham Cash */}
                        <button
                          onClick={() => setPaymentMethod("shamcash")}
                          className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-1 ${
                            paymentMethod === "shamcash"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xs">
                            SH
                          </div>
                          <span className="text-xs font-medium">Sham Cash</span>
                          <span className="text-[10px] text-gray-400">Wallet</span>
                        </button>

                        {/* PayPal */}
                        <button
                          onClick={() => setPaymentMethod("paypal")}
                          className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-1 ${
                            paymentMethod === "paypal"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                            PP
                          </div>
                          <span className="text-xs font-medium">PayPal</span>
                          <span className="text-[10px] text-gray-400">International</span>
                        </button>
                      </div>
                    </div>

                    {/* Payment fields based on method */}
                    {paymentMethod === "syriatel" && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Syriatel Phone Number</label>
                          <input
                            type="text"
                            placeholder="09xxxxxxxx"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
                          <p className="flex items-center gap-2"><CheckCircle size={16} /> A payment link will be sent to your phone.</p>
                          <p className="text-xs text-blue-600 mt-1">This is a simulation. No real money will be charged.</p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "shamcash" && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Sham Cash Phone Number</label>
                          <input
                            type="text"
                            placeholder="09xxxxxxxx"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                          <input
                            type="password"
                            placeholder="••••"
                            maxLength="4"
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
                          <p className="flex items-center gap-2"><CheckCircle size={16} /> Payment will be confirmed via Sham Cash.</p>
                          <p className="text-xs text-blue-600 mt-1">This is a simulation. No real money will be charged.</p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "paypal" && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Email</label>
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
                          <p className="flex items-center gap-2"><CheckCircle size={16} /> You will be redirected to PayPal to complete payment.</p>
                          <p className="text-xs text-blue-600 mt-1">This is a simulation. No real money will be charged.</p>
                        </div>
                      </div>
                    )}

                    {paymentError && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                        <AlertCircle size={16} /> {paymentError}
                      </p>
                    )}
                  </div>
                )}

                {/* Step: Processing */}
                {paymentStep === "processing" && (
                  <div className="text-center py-6">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Processing Payment...</h3>
                    <p className="text-sm text-gray-500 mt-1">Please wait while we complete your transaction.</p>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-200 rounded-full"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{processingProgress}%</p>
                  </div>
                )}

                {/* Step: Success */}
                {paymentStep === "success" && (
                  <div className="text-center py-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-700">Payment Successful!</h3>
                    <p className="text-gray-500 mt-1">Your ad has been submitted for admin approval.</p>
                    <p className="text-sm text-gray-400 mt-2">You will be notified once it's approved.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {paymentStep !== "success" && (
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  {paymentStep === "details" && (
                    <>
                      <button
                        onClick={closePaymentModal}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={processPayment}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                      >
                        <CreditCard size={18} /> Pay {paymentModal.price.toLocaleString()} SYP
                      </button>
                    </>
                  )}
                  {paymentStep === "processing" && (
                    <button
                      disabled
                      className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                    >
                      Processing...
                    </button>
                  )}
                </div>
              )}

              {paymentStep === "success" && (
                <div className="p-6 border-t border-gray-100">
                  <button
                    onClick={closePaymentModal}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}