import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return;

  const user = JSON.parse(storedUser);
  const newSocket = io("http://localhost:5000");
  newSocket.emit("join", user.id); // critical
  setSocket(newSocket);

  newSocket.on("receiveMessage", (msg) => {
    console.log("📩 Received message", msg);
    setNotifications((prev) => [...prev, msg]);
  });

  return () => newSocket.disconnect();
}, []);


  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
