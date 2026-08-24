import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Footer from '../components/footer';
import Navbar from '../components/navbar';
import { Shield, AlertCircle } from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isFarmer = user?.role === 'farmer' || user?.role === 'seller';
  const isPendingSeller = isFarmer && user?.status !== 'verified';

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
              {user ? (
                isAdmin ? (
                  <>Welcome, <span className="text-purple-600">Admin {user.name?.split(' ')[0]}</span>!</>
                ) : isPendingSeller ? (
                  <>Welcome, <span className="text-yellow-600">{user.name?.split(' ')[0]}</span>!</>
                ) : (
                  <>Welcome back, <span className="text-green-600">{user.name?.split(' ')[0]}</span>!</>
                )
              ) : (
                <>Fresh from Syrian farms<br /><span className="text-green-600">directly to your table</span></>
              )}
            </h1>
            
            {/* Pending Seller Message */}
            {user && isPendingSeller && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-left">
                    <p className="font-semibold text-yellow-800">Account Pending Verification</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your seller account is waiting for admin approval. Once verified, you'll be able to add products and start selling.
                    </p>
                    <p className="text-sm text-yellow-700 mt-2">
                      📧 For questions, contact the admin at: <a href="mailto:aldaioubkahtan@gmail.com" className="underline font-medium">aldaioubkahtan@gmail.com</a>
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto md:mx-0">
              {user 
                ? isAdmin
                  ? "Manage seller verifications, monitor platform activity, and keep the marketplace safe."
                  : isPendingSeller
                  ? "Thank you for registering as a seller. Our admin will review your application shortly."
                  : "Continue exploring fresh organic products and chat with farmers – all in one place."
                : "An open marketplace connecting you with local farmers. No middlemen – just pure, organic, and affordable produce. Chat directly, negotiate prices, and support Syrian agriculture."
              }
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              {user ? (
                isAdmin ? (
                  <>
                    <Link to="/admin" className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition shadow-md text-center flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5" />
                      Go to Admin Dashboard
                    </Link>
                    <Link to="/products" className="px-8 py-3 border-2 border-green-600 text-green-600 font-semibold rounded-xl hover:bg-green-50 transition text-center">
                      Browse Products
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/products" className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition shadow-md text-center">
                      Browse Products
                    </Link>
                    {/* Removed Dashboard link for buyers/sellers */}
                  </>
                )
              ) : (
                <>
                  <Link to="/register" className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition shadow-md text-center">
                    Join as a Buyer
                  </Link>
                  <Link to="/register?role=farmer" className="px-8 py-3 border-2 border-green-600 text-green-600 font-semibold rounded-xl hover:bg-green-50 transition text-center">
                    Join as a Farmer
                  </Link>
                </>
              )}
            </div>
            {!user && (
              <p className="mt-4 text-sm text-gray-500">✓ Free to join   ✓ No commission   ✓ Direct chat</p>
            )}
          </div>
          <div className="flex-1">
            <img 
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop" 
              alt="Syrian farmer harvesting vegetables" 
              className="rounded-2xl shadow-2xl object-cover w-full h-80 md:h-96"
              onError={(e) => { e.target.src = 'https://placehold.co/600x400/e2f0e2/2d6a4f?text=Farm+Fresh' }}
            />
          </div>
        </div>
      </section>

      {/* Features Section (same for all) */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Why choose our marketplace?</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">We're building a transparent, fair, and sustainable food system in Syria.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Built‑in Chat</h3>
              <p className="mt-2 text-gray-600">Talk directly with farmers. Ask about harvest dates, negotiate prices, and arrange delivery – all within the platform.</p>
            </div>
            <div className="rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">100% Fresh & Organic</h3>
              <p className="mt-2 text-gray-600">All products come directly from Syrian farms – no preservatives, no chemicals, just nature.</p>
            </div>
            <div className="rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Fair Prices</h3>
              <p className="mt-2 text-gray-600">No middlemen markups. Farmers earn more, you pay less – a win‑win for everyone.</p>
            </div>
            <div className="rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Support Local Communities</h3>
              <p className="mt-2 text-gray-600">Every purchase strengthens Syrian rural economies and helps small family farms thrive.</p>
            </div>
            <div className="rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Local Delivery</h3>
              <p className="mt-2 text-gray-600">Flexible delivery options across all 14 Syrian governorates – from rural farms to city centers.</p>
            </div>
            <div className="rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Trust & Transparency</h3>
              <p className="mt-2 text-gray-600">Farmer profiles, ratings, and reviews. Know exactly where your food comes from.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">How it works</h2>
            <p className="mt-4 text-gray-600">Get fresh, organic produce in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-700">1</span>
              </div>
              <h3 className="text-xl font-semibold">Create an account</h3>
              <p className="mt-2 text-gray-500">Sign up as a buyer or farmer – it's free and takes less than a minute.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-700">2</span>
              </div>
              <h3 className="text-xl font-semibold">Browse & chat</h3>
              <p className="mt-2 text-gray-500">Explore products, message farmers directly, and negotiate prices.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-700">3</span>
              </div>
              <h3 className="text-xl font-semibold">Order & enjoy</h3>
              <p className="mt-2 text-gray-500">Arrange delivery, pay securely, and enjoy the freshest Syrian produce.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-linear-to-r from-green-700 to-green-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div><div className="text-4xl md:text-5xl font-bold">500+</div><div className="mt-2 text-green-100">Registered Farmers</div></div>
            <div><div className="text-4xl md:text-5xl font-bold">14</div><div className="mt-2 text-green-100">Syrian Governorates</div></div>
            <div><div className="text-4xl md:text-5xl font-bold">4.8★</div><div className="mt-2 text-green-100">User Rating</div></div>
            <div><div className="text-4xl md:text-5xl font-bold">2k+</div><div className="mt-2 text-green-100">Happy Customers</div></div>
          </div>
        </div>
      </section>

      {/* Call to Action – only for non‑logged‑in users */}
      {!user && (
        <section className="py-20">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Ready to taste the difference?</h2>
            <p className="mt-4 text-lg text-gray-600">Join the movement towards fresh, fair, and local food in Syria.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition shadow-md">Sign up for free</Link>
              <Link to="/login" className="px-8 py-3 border-2 border-green-600 text-green-600 font-semibold rounded-xl hover:bg-green-50 transition">Log in</Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">✓ No credit card required   ✓ Cancel anytime   ✓ Free support</p>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default LandingPage;