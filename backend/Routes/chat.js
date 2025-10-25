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
const { clerkAuth, requireAdmin, requireAuth } = require('../middleware/clerkAuth');

// Get or create chat with specific user
router.get('/:userId', clerkAuth, getOrCreateChat);

// Get current user's chats
router.get('/', clerkAuth, getUserChats);

// Get all chats (admin only)
router.get('/admin/all', clerkAuth, requireAdmin, getAllChats);

// Get messages for a specific chat
router.get('/messages/:chatId', clerkAuth, getChatMessages);

// Send a message
router.post('/messages', clerkAuth, sendMessage);

// Mark messages as read
router.put('/messages/:chatId/read', clerkAuth, markAsRead);

module.exports = router;
