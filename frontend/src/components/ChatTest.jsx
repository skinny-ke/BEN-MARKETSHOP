/* filepath: /components/ChatTest.jsx */
import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useUser, useAuth } from "@clerk/clerk-react";
import { setClerkTokenGetter } from "../api/axios";

const ChatTest = () => {
  const { socket, isConnected, joinChat } = useSocket();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [testMessage, setTestMessage] = useState("");
  const [logs, setLogs] = useState([]);

  /** 🧩 Utility for adding logs */
  const addLog = (message) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  /** ✅ Ensure Clerk token is injected for all Axios calls */
  useEffect(() => {
    if (getToken) {
      setClerkTokenGetter(() => getToken);
      addLog("🔐 Clerk token getter registered");
    }
  }, [getToken]);

  /** ✅ Setup socket event listeners */
  useEffect(() => {
    if (!socket) return;
    addLog("⚙️ Socket instance ready");

    socket.on("connect", () => addLog("✅ Socket connected"));
    socket.on("disconnect", () => addLog("❌ Socket disconnected"));
    socket.on("connected", (data) =>
      addLog(`🔗 Server confirmation: ${data.message}`)
    );
    socket.on("joinedRoom", (data) =>
      addLog(`🏠 Joined room: ${data.message}`)
    );
    socket.on("receiveMessage", (msg) =>
      addLog(`💬 Received: ${msg?.content || "(empty message)"}`)
    );

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connected");
      socket.off("joinedRoom");
      socket.off("receiveMessage");
    };
  }, [socket]);

  /** 🟢 Auto join a test room once connected */
  useEffect(() => {
    if (socket && isConnected) {
      joinChat("test-chat");
      addLog("🏠 Auto-joined test-chat room");
    }
  }, [socket, isConnected]);

  /** 🧪 Send a test message */
  const sendTestMessage = () => {
    if (!socket || !isConnected) {
      addLog("⚠️ Cannot send — socket not connected");
      return;
    }

    const messageData = {
      chatId: "test-chat",
      senderId: user?.id || "guest",
      receiverId: "admin",
      content: testMessage,
    };

    socket.emit("sendMessage", messageData);
    addLog(`🚀 Sent: "${testMessage}"`);
    setTestMessage("");
  };

  return (
    <div className="fixed top-4 right-4 w-96 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        🧪 Chat Debug Panel
      </h3>

      {/* Status Info */}
      <div className="mb-3 text-sm">
        <p>
          <span
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          Status:{" "}
          <strong>{isConnected ? "Connected" : "Disconnected"}</strong>
        </p>
        <p>User ID: {user?.id || "Not logged in"}</p>
        <p>Socket ID: {socket?.id || "N/A"}</p>
      </div>

      {/* Input & Send Button */}
      <div className="mb-4">
        <input
          type="text"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Type a test message..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <button
          onClick={sendTestMessage}
          disabled={!isConnected || !testMessage.trim()}
          className="mt-2 w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          Send Test Message
        </button>
      </div>

      {/* Logs */}
      <div className="max-h-48 overflow-y-auto bg-gray-50 p-2 rounded">
        <h4 className="font-semibold text-sm mb-2">Logs:</h4>
        {logs.length === 0 ? (
          <p className="text-xs text-gray-500">No logs yet...</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="text-xs text-gray-700 mb-1">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatTest;
