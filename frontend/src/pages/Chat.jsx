import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, User, Store, MessageCircle } from "lucide-react";
import { useAuth } from "../AuthContext";
import { useToast } from "../ToastContext";

export default function Chat() {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherUserName, setOtherUserName] = useState("User");
  const [otherUserRole, setOtherUserRole] = useState("buyer");
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Socket setup
  useEffect(() => {
    const s = io("http://localhost:5000");
    setSocket(s);
    s.on("receiveMessage", (msg) => {
      if ((msg.senderId === userId && msg.receiverId === user?._id) ||
          (msg.senderId === user?._id && msg.receiverId === userId)) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => s.disconnect();
  }, [userId, user]);

  // Fetch messages and try to get user info
  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !user) return;
      try {
        // 1. Fetch messages
        const messagesRes = await API.get(`/messages/${userId}`);
        setMessages(messagesRes.data);

        // 2. Fetch all users to get the correct role and name
        const usersRes = await API.get("/messages/");
        const other = usersRes.data.find(u => u._id === userId);
        if (other) {
          setOtherUserName(other.name);
          setOtherUserRole(other.role);   // should be "seller" for farmers
        } else {
          // Fallback: try to extract name from first message
          if (messagesRes.data.length > 0) {
            const firstMsg = messagesRes.data[0];
            const otherName = firstMsg.senderId === userId ? firstMsg.sender?.name : firstMsg.receiver?.name;
            if (otherName) setOtherUserName(otherName);
          }
        }
      } catch (err) {
        console.error("Failed to load chat data:", err);
        showToast("Failed to load messages", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, user]);

  // Fallback: fetch all users to get the name
  useEffect(() => {
    if (!loading || otherUserName !== "User") return;
    const fetchUserInfo = async () => {
      try {
        const res = await API.get("/messages/");
        const found = res.data.find(u => u._id === userId);
        if (found) {
          setOtherUserName(found.name);
          setOtherUserRole(found.role || "buyer");
        }
      } catch (err) {
        console.warn("Could not fetch user info");
      }
    };
    fetchUserInfo();
  }, [loading, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const res = await API.post("/messages", {
        receiverId: userId,
        content: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      socket.emit("sendMessage", res.data);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
      showToast("Could not send message. Please try again.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-green-600">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/chats" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            {otherUserRole === "farmer" || otherUserRole === "seller" ? (
              <Store className="w-5 h-5 text-green-700" />
            ) : (
              <User className="w-5 h-5 text-green-700" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{otherUserName}</h2>
            <p className="text-xs text-gray-500">
              {otherUserRole === "farmer" || otherUserRole === "seller" ? "Farmer" : "Buyer"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400">Send a message to start the conversation</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, idx) => {
                const isSent = msg.senderId === user._id;
                return (
                  <motion.div
                    key={msg._id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
                        isSent
                          ? "bg-green-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm break-words">{msg.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isSent ? "text-green-100 text-right" : "text-gray-400"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-100 p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}