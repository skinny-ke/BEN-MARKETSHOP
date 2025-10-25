const express = require('express');
const router = express.Router();
const {
  getOrCreateChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  markAsRead,
  getAllChats
} = require('../Controllers/chatController');
const auth = require('../middleware/auth');

// Get or create chat with specific user
router.get('/:userId', auth, getOrCreateChat);

// Get current user's chats
router.get('/', auth, getUserChats);

// Get all chats (admin only)
router.get('/admin/all', auth, getAllChats);

// Get messages for a specific chat
router.get('/messages/:chatId', auth, getChatMessages);

// Send a message
router.post('/messages', auth, sendMessage);

// Mark messages as read
router.put('/messages/:chatId/read', auth, markAsRead);

module.exports = router;
