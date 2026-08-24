import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "./Authcontext.jsx"; 
import { SocketProvider } from "./SocketContext.jsx";
import { CartProvider } from "./CartContext.jsx";
import { ToastProvider } from "./ToastContext.jsx";
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <CartProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </CartProvider>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)