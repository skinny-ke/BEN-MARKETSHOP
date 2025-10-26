/* filepath: /home/skinny-ke/Desktop/BEN-MARKET/lib/socketClient.js */

// ✅ Usage:
// import initSocket from "../lib/socketClient";
// const socket = initSocket();

import { io } from "socket.io-client";

export default function initSocket() {
  // ✅ Get socket URL from environment or fallback to deployed backend
  const envUrl =
    (typeof window !== "undefined" &&
      window?.__NEXT_DATA__?.props?.pageProps?.env?.NEXT_PUBLIC_SOCKET_URL) ||
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    "https://ben-market-shop.onrender.com"; // fallback for Render backend

  // ✅ Ensure it's using the correct protocol
  const url = envUrl.replace(/^http/, "ws");

  // ✅ Warn if not found
  if (!url) {
    console.warn(
      "⚠️ Socket URL not set. Define NEXT_PUBLIC_SOCKET_URL in your .env file."
    );
    return null;
  }

  // ✅ Initialize socket connection
  const socket = io(envUrl, {
    path: "/socket.io",
    transports: ["websocket", "polling"], // render-safe
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 20000,
  });

  // ✅ Log connection events
  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.warn("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("🚫 Socket connection error:", err.message);
  });

  return socket;
}
