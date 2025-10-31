const express = require('express');
const router = express.Router();
const {
  getOrCreateChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  markAsRead,
  getAllChats,
} = require('../Controllers/chatController');
const { clerkAuth, requireAdmin } = require('../middleware/clerkAuth');
const { body } = require('express-validator');

/**
 * 🧠 ROUTE STRUCTURE & AUTH:
 * - clerkAuth ensures each request includes a valid Clerk JWT
 * - requireAdmin verifies that the MongoDB user has the "admin" role
 * - Route order matters: static routes go before dynamic ones
 */

// ✅ Admin: Get all chats
router.get('/admin/all', clerkAuth, requireAdmin, getAllChats);

// ✅ Authenticated user: Get or create a chat with another user
router.get('/:userId', clerkAuth, getOrCreateChat);

// ✅ Authenticated user: Get their chat list
router.get('/', clerkAuth, getUserChats);

// ✅ Authenticated user: Get messages from a specific chat
router.get('/messages/:chatId', clerkAuth, getChatMessages);

// ✅ Authenticated user: Send a new message
router.post(
  '/messages',
  clerkAuth,
  [
    body('chatId').isString().isLength({ min: 8 }),
    body('message').isString().isLength({ min: 1, max: 2000 }),
  ],
  sendMessage
);

// ✅ Authenticated user: Mark messages as read
router.put('/messages/:chatId/read', clerkAuth, markAsRead);

module.exports = router;
