/* filepath: /home/skinny-ke/Desktop/BEN-MARKET/lib/socketClient.js */
// Usage: import initSocket from '../lib/socketClient'
// const socket = initSocket();
import { io } from "socket.io-client";

export default function initSocket() {
  const envUrl = typeof window !== "undefined" && window?.__NEXT_DATA__?.props?.pageProps?.env?.NEXT_PUBLIC_SOCKET_URL
    || process.env.NEXT_PUBLIC_SOCKET_URL;
  const fallback = (typeof window !== "undefined") ? window.location.origin.replace(/^http/, "ws") : undefined;
  const url = envUrl || fallback || "";
  if (!url) {
    console.warn("Socket URL not set. Set NEXT_PUBLIC_SOCKET_URL to wss://your-socket-host");
    return null;
  }
  return io(url, {
    path: "/socket.io",
    transports: ["websocket"],
    secure: url.startsWith("wss"),
  });
}
