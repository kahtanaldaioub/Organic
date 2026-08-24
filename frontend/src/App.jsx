import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/landing'
import Login from './pages/login'
import Register from './pages/register'
import Products from './pages/products'
import AddProduct from './pages/AddProduct'
import Orders from './pages/Orders'
import Chats from './pages/chats'
import Chat from './pages/Chat'
import AdminDashboard from './pages/AdminDashboard'
import SellerProfile from "./pages/SellerProfile";
import SellerAds from "./pages/SellerAds";
import ProductDetail from "./pages/ProductDetail";

import CartPage from "./pages/CartPage";



function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<div className='text-xl text-gray-800 max-w-3xl mb-10 bg-white p-6 '>404 - Page Not Found</div>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/chat/:userId" element={<Chat />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/seller/:sellerId" element={<SellerProfile />} />
          <Route path="/seller/ads" element={<SellerAds />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App