import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import { useState } from 'react';
import { Menu, X, Shield, ShoppingCart } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = getCartCount();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isFarmer = user && (user.role === 'farmer' || user.role === 'seller');
  const isAdmin = user?.role === 'admin';

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
          <img src="/logo1.svg" alt="Organic Logo" className="h-8 w-auto md:h-10" />
          <span className="text-xl font-bold text-gray-800 hidden sm:inline">Organic</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full hidden sm:block">Syria</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link to="/products" className="text-gray-600 hover:text-green-600 transition">Products</Link>
              <Link to="/orders" className="text-gray-600 hover:text-green-600 transition">Orders</Link>
              <Link to="/chats" className="text-gray-600 hover:text-green-600 transition">Chats</Link>
              {isAdmin && (
                <Link to="/admin" className="text-purple-600 hover:text-purple-700 transition flex items-center gap-1">
                  <Shield className="w-4 h-4" /> Admin
                </Link>
              )}
            </>
          ) : (
            <Link to="/products" className="text-gray-600 hover:text-green-600 transition">Products</Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              {/* Cart icon for buyers */}
              {user.role === "buyer" && (
                <Link to="/cart" className="relative text-gray-600 hover:text-green-600 transition">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              )}
              <span className="text-sm text-gray-500">Hi, {user.name?.split(' ')[0]}</span>
              {isFarmer && !isAdmin && (
                <>
                  <Link to="/add-product" className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition">
                    Add Product
                  </Link>
                  <Link to="/seller/ads" className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition">
                    Promote
                  </Link>
                </>
              )}
              {isAdmin && (
                <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Admin</span>
              )}
              <button onClick={handleLogout} className="px-4 py-2 text-red-600 font-semibold hover:text-red-700 transition">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="px-4 py-2 text-green-600 font-semibold hover:text-green-700 transition">Log in</Link>
              <Link to="/register" className="px-5 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition shadow-md">Sign up</Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button onClick={toggleMenu} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition">
          {isMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-3 shadow-lg">
          {user ? (
            <>
              <Link to="/products" className="block py-2 text-gray-700 hover:text-green-600" onClick={closeMenu}>Products</Link>
              <Link to="/orders" className="block py-2 text-gray-700 hover:text-green-600" onClick={closeMenu}>Orders</Link>
              <Link to="/chats" className="block py-2 text-gray-700 hover:text-green-600" onClick={closeMenu}>Chats</Link>
              {user.role === "buyer" && (
                <Link to="/cart" className="block py-2 text-gray-700 hover:text-green-600" onClick={closeMenu}>Cart ({cartCount})</Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="block py-2 text-purple-600 font-medium" onClick={closeMenu}>Admin Dashboard</Link>
              )}
              <hr className="my-2 border-gray-100" />
              <div className="py-2 text-sm text-gray-500">Hi, {user.name}</div>
              {isFarmer && !isAdmin && (
                <>
                  <Link to="/add-product" className="block py-2 text-green-700 font-medium" onClick={closeMenu}>Add Product</Link>
                  <Link to="/seller/ads" className="block py-2 text-purple-700 font-medium" onClick={closeMenu}>Promote</Link>
                </>
              )}
              {isAdmin && (
                <div className="py-2 text-sm bg-purple-100 text-purple-700 px-2 rounded-full inline-block">Admin Account</div>
              )}
              <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600 font-semibold">Log out</button>
            </>
          ) : (
            <>
              <Link to="/products" className="block py-2 text-gray-700 hover:text-green-600" onClick={closeMenu}>Products</Link>
              <hr className="my-2 border-gray-100" />
              <Link to="/login" className="block py-2 text-green-600 font-semibold" onClick={closeMenu}>Log in</Link>
              <Link to="/register" className="block py-2 bg-green-600 text-white text-center rounded-xl px-4 font-semibold" onClick={closeMenu}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;