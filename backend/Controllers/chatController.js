const Chat = require('../Models/Chat');
const Message = require('../Models/Message');
const User = require('../Models/User');

// Get or create chat between users
const getOrCreateChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.auth.userId;

    // Find existing chat between users
    let chat = await Chat.findOne({
      users: { $all: [currentUserId, userId] }
    }).populate('users', 'name email profileImage role');

    if (!chat) {
      // Create new chat
      chat = new Chat({
        users: [currentUserId, userId]
      });
      await chat.save();
      await chat.populate('users', 'name email profileImage role');
    }

    res.json({
      success: true,
      chat
    });
  } catch (error) {
    console.error('Error getting/creating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get or create chat'
    });
  }
};

// Get user's chats
const getUserChats = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const chats = await Chat.find({
      users: userId,
      isActive: true
    })
    .populate('users', 'name email profileImage role')
    .sort({ lastMessageTime: -1 });

    res.json({
      success: true,
      chats
    });
  } catch (error) {
    console.error('Error getting user chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chats'
    });
  }
};

// Get chat messages
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.auth.userId;

    // Verify user is part of this chat
    const chat = await Chat.findOne({
      _id: chatId,
      users: userId
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    const messages = await Message.find({ chatId })
      .populate('senderId', 'name email profileImage role')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { chatId, content, receiverId } = req.body;
    const senderId = req.auth.userId;

    // Verify user is part of this chat
    const chat = await Chat.findOne({
      _id: chatId,
      users: senderId
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    // Create message
    const message = new Message({
      chatId,
      senderId,
      content,
      messageType: 'text'
    });

    await message.save();
    await message.populate('senderId', 'name email profileImage role');

    // Update chat's last message
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: content,
      lastMessageTime: new Date()
    });

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.auth.userId;

    await Message.updateMany(
      { 
        chatId, 
        senderId: { $ne: userId },
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
};

// Get all chats (admin only)
const getAllChats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const chats = await Chat.find({ isActive: true })
      .populate('users', 'name email profileImage role')
      .sort({ lastMessageTime: -1 });

    res.json({
      success: true,
      chats
    });
  } catch (error) {
    console.error('Error getting all chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get all chats'
    });
  }
};

module.exports = {
  getOrCreateChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  markAsRead,
  getAllChats
};
