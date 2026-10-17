import { useCallback, useEffect } from "react";
import { io } from "socket.io-client";
import SocketContext from "./SocketContext.js";

const socket = io(
  import.meta.env.VITE_BASE_URL || "http://localhost:3000",
  {
    autoConnect: false,
    withCredentials: true
  }
);

const SocketProvider = ({ children }) => {
  useEffect(() => {
    const handleConnectionError = (error) => {
      console.error("Socket connection failed:", error);
    };

    socket.on("connect_error", handleConnectionError);
    socket.connect();

    return () => {
      socket.off("connect_error", handleConnectionError);
      socket.disconnect();
    };
  }, []);

  const sendMessage = useCallback((eventName, data) => {
    socket.emit(eventName, data);
  }, []);

  const receiveMessage = useCallback((eventName, handler) => {
    socket.on(eventName, handler);
    return () => socket.off(eventName, handler);
  }, []);

  return (
    <SocketContext.Provider value={{ sendMessage, receiveMessage }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
