import React, { useState } from 'react';
import { useAuth } from '../Authcontext'; 
const LoginPage = () => {
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  
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
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setServerError('');
    
    try {
      const success = await login(
        formData.email.trim().toLowerCase(),
        formData.password
      );
      
      if (success) {
        // Redirect based on user role (optional)
        window.location.href = '/';
      } else {
        setServerError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      setServerError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const fillDemoCredentials = () => {
    setFormData({
      email: 'AliFarm@gmail.com',
      password: 'ali123',
      rememberMe: false,
    });
  };
  const fillDemoCredentials2 = () => {
    setFormData({
      email: 'aldaioubkahtan@gmail.com',
      password: 'kahtan123',
      rememberMe: false,
    });
  };
  const fillDemoCredentials3 = () => {
    setFormData({
      email: 'buyer@gmail.com',
      password: 'buyer123',
      rememberMe: false,
    });
  };
  
  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Column - Form Section */}
          <div className="flex-1 p-6 md:p-8 lg:p-10">
            {/* Branding – Syrian & farmer focused */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <span>
                <img 
    src="/logo1.svg"           /* use absolute path from public folder */
    alt="organic Logo" 
    className="h-8 w-auto md:h-10"   /* responsive height, auto width */
  /></span>
                <span className="text-2xl font-bold text-gray-800">Organic</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Syria</span>
              </div>
              <p className="text-gray-500 text-sm">An open marketplace connecting farmers directly with consumers – fresh, organic, and fair.</p>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Welcome back</h1>
            <p className="text-gray-500 mb-6">Sign in to chat with farmers, buy fresh produce, or manage your farm listings.</p>
            
            {serverError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {serverError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'} focus:outline-none focus:ring-2 transition duration-200`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'} focus:outline-none focus:ring-2 transition duration-200`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
              
              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Forgot password?
                </a>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
              
              {/* Demo Credentials Button (optional - remove in production) */}
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="w-full text-sm text-gray-500 hover:text-green-600 transition duration-200"
              >
                Use demo credentials (AliFarm@gmail.com / ali123)
              </button>
              <button
                type="button"
                onClick={fillDemoCredentials2}
                className="w-full text-sm text-gray-500 hover:text-green-600 transition duration-200"
              >
                Use demo credentials (aldaioubkahtan@gmail.com / kahtan123)
              </button>
              <button
                type="button"
                onClick={fillDemoCredentials3}
                className="w-full text-sm text-gray-500 hover:text-green-600 transition duration-200"
              >
                Use demo credentials (buyer@gmail.com / buyer123)
              </button>
              
              {/* Register Link */}
              <p className="text-center text-gray-600 text-sm">
                Don't have an account?{' '}
                <a href="/register" className="text-green-600 hover:text-green-700 font-semibold">Create account</a>
              </p>
            </form>
          </div>
          
          {/* Right Column - Trust & Benefits Section (Syria-focused, includes chat) */}
          <div className="md:w-96 bg-linear-to-br from-green-700 to-green-800 p-6 md:p-8 text-white flex flex-col justify-between">
            <div>
              <div className="mb-8">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-3">Your trusted farming marketplace</h2>
                <p className="text-green-100 text-sm leading-relaxed">
                  Access your personalized dashboard, manage orders, chat with farmers or buyers, and discover fresh organic products from across Syria.
                </p>
              </div>
              
              <div className="space-y-5">
                {/* Built-in Chat Feature Highlight */}
                <div className="flex items-start gap-3 bg-white/10 p-3 rounded-xl">
                  <div className="shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Built-in Chat</h3>
                    <p className="text-green-100 text-sm">Direct messaging between buyers and farmers – negotiate prices, ask about products, and arrange delivery.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Personalized dashboard</h3>
                    <p className="text-green-100 text-sm">Track orders, manage listings, and view your chat history.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Order history & tracking</h3>
                    <p className="text-green-100 text-sm">View past purchases and real‑time delivery updates.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Secure wallet & payments</h3>
                    <p className="text-green-100 text-sm">Manage your payment methods and transaction history securely.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Syria-specific stats */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex items-center gap-4 justify-between">
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-xs text-green-100">Registered farmers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">14</div>
                  <div className="text-xs text-green-100">Syrian governorates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">4.8★</div>
                  <div className="text-xs text-green-100">User rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer note */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Secure login protected by SSL encryption. Your data is never shared with third parties. Chat with farmers directly – no middlemen.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;