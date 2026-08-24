// @refresh reset
import { createContext, useContext, useEffect, useState } from "react";
import API from './api.js';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user from localStorage on startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("❌ Error restoring auth state:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
      setToken(token);
      return true;
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      return false;
    }
  };

  // ✅ REGISTER
  const register = async (name, email, password, role) => {
    try {
      const res = await API.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
      setToken(token);
      return true;
    } catch (err) {
      console.error("❌ Registration failed:", err.response?.data || err.message);
      return false;
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    delete API.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        loading, 
      }}
    >
      {/* Prevent UI flicker while restoring auth */}
      {loading ? (
        <div className="flex items-center justify-center h-screen text-gray-500">
          Loading...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
