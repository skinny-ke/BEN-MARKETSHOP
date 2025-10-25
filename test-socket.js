const { io } = require('socket.io-client');

// Test Socket.io connection
const socket = io('http://localhost:5001', {
  autoConnect: false,
  withCredentials: true,
});

socket.on('connect', () => {
  console.log('✅ Connected to server');
  console.log('Socket ID:', socket.id);
  
  // Test joining a chat
  socket.emit('joinChat', 'test-user-123');
  console.log('📤 Sent joinChat event');
  
  // Test sending a message
  setTimeout(() => {
    socket.emit('sendMessage', {
      chatId: 'test-chat-123',
      senderId: 'test-user-123',
      content: 'Hello from test!',
      receiverId: 'admin'
    });
    console.log('📤 Sent test message');
  }, 1000);
});

socket.on('receiveMessage', (message) => {
  console.log('📥 Received message:', message);
});

socket.on('messageSent', (message) => {
  console.log('✅ Message sent confirmation:', message);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

// Connect to server
console.log('🔌 Attempting to connect to Socket.io server...');
socket.connect();

// Disconnect after 5 seconds
setTimeout(() => {
  console.log('🔌 Disconnecting...');
  socket.disconnect();
  process.exit(0);
}, 5000);
