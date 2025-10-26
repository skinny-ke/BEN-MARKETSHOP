// filepath: /Models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['private', 'group'],
      default: 'private', // ✅ Future-proof for group chats
    },
    groupName: {
      type: String,
      default: '',
    },
    groupImage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // ✅ Automatically adds createdAt & updatedAt
  }
);

// ✅ Indexes for better performance
chatSchema.index({ users: 1 });
chatSchema.index({ lastMessageTime: -1 });

// ✅ Optional virtual for latest message (no conflict)
chatSchema.virtual('latestMessage', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'chatId',
  options: { sort: { createdAt: -1 }, limit: 1 },
});

module.exports = mongoose.model('Chat', chatSchema);
