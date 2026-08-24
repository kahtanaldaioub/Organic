import React, { useState } from 'react';
import { useAuth } from '../AuthContext'; // Ensure correct import path

const RegisterPage = () => {
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',        // 'buyer' or 'seller' (backend expects 'seller')
    termsAccepted: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the Terms of Service';
    if (!['buyer', 'seller'].includes(formData.role)) newErrors.role = 'Please select a valid role';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setServerError('');
    
    try {
      // Send 'seller' for farmer role (backend expects 'seller')
      const roleToSend = formData.role === 'farmer' ? 'seller' : formData.role;
      const success = await register(
        formData.name.trim(),
        formData.email.trim().toLowerCase(),
        formData.password,
        roleToSend
      );
      
      if (success) {
        setIsSuccess(true);
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'buyer',
          termsAccepted: false,
        });
      } else {
        setServerError('Registration failed. Please try again.');
      }
    } catch (err) {
      setServerError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Organic!</h2>
          <p className="text-gray-600 mb-6">Your account has been successfully created.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Column - Form Section */}
          <div className="flex-1 p-6 md:p-8 lg:p-10">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <span>
                  <img src="/logo1.svg" alt="Organic Logo" className="h-8 w-auto md:h-10" />
                </span>
                <span className="text-2xl font-bold text-gray-800">Organic</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Syria</span>
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Create an account</h1>
            <p className="text-gray-500 mb-6">Join Organic. Chat directly with farmers, buy fresh produce, or sell your harvest.</p>
            
            {serverError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {serverError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-green-500 focus:border-green-500 focus:outline-none focus:ring-2"
                  placeholder="Ahmed Mohammad"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-green-500 focus:border-green-500 focus:outline-none focus:ring-2"
                  placeholder="ahmed@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              
              {/* Role Selection - Buyer / Farmer (sends 'buyer' or 'seller') */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I want to join as a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'buyer' }))}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                      formData.role === 'buyer'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Buyer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'seller' }))}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                      formData.role === 'seller'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="font-medium">Farmer / Seller</span>
                  </button>
                </div>
                {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
              </div>
              
              {/* Password fields - unchanged */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-green-500 focus:border-green-500"
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-green-500 focus:border-green-500"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
              
              {/* Terms and submit - unchanged */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-green-600 hover:text-green-700">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-green-600 hover:text-green-700">Privacy Policy</a>
                </label>
              </div>
              {errors.termsAccepted && <p className="text-sm text-red-600">{errors.termsAccepted}</p>}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
              
              <p className="text-center text-gray-600 text-sm">
                Already have an account?{' '}
                <a href="/login" className="text-green-600 font-semibold">Sign in</a>
              </p>
            </form>
          </div>
          
          {/* Right Column - unchanged */}
          <div className="md:w-96 bg-gradient-to-br from-green-700 to-green-800 p-6 md:p-8 text-white flex flex-col justify-between">
            {/* ... same as before ... */}
            <div>
              <div className="mb-8">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-3">Syrian Farmers' Market</h2>
                <p className="text-green-100 text-sm leading-relaxed">An open platform connecting Syrian farmers directly with consumers.</p>
              </div>
              <div className="space-y-5">
                <div className="flex items-start gap-3 bg-white/10 p-3 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div><h3 className="font-semibold">Built-in Chat</h3><p className="text-green-100 text-sm">Direct messaging between buyers and farmers.</p></div>
                </div>
                <div className="flex items-start gap-3"><div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div><div><h3 className="font-semibold">100% Fresh & Organic</h3><p className="text-green-100 text-sm">Straight from Syrian farms.</p></div></div>
                <div className="flex items-start gap-3"><div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><div><h3 className="font-semibold">Support Local Communities</h3><p className="text-green-100 text-sm">Empower Syrian rural economies.</p></div></div>
                <div className="flex items-start gap-3"><div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></div><div><h3 className="font-semibold">Local Delivery</h3><p className="text-green-100 text-sm">Flexible delivery across Syria.</p></div></div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/20"><div className="flex items-center gap-4 justify-between"><div className="text-center"><div className="text-2xl font-bold">500+</div><div className="text-xs text-green-100">Registered farmers</div></div><div className="text-center"><div className="text-2xl font-bold">14</div><div className="text-xs text-green-100">Syrian governorates</div></div><div className="text-center"><div className="text-2xl font-bold">4.8★</div><div className="text-xs text-green-100">User rating</div></div></div></div>
          </div>
        </div>
        <p className="text-center text-gray-500 text-xs mt-6">Organic – an open marketplace with direct farmer-to-consumer chat. All products come from trusted Syrian farms.</p>
      </div>
    </div>
  );
};

export default RegisterPage;