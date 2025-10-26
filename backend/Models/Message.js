// filepath: /Models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: 2000, // ⬆️ Slightly higher for flexibility
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    fileUrl: {
      type: String,
      default: '', // ✅ For uploaded files/images
    },
    fileName: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // ✅ Adds createdAt and updatedAt automatically
  }
);

// ✅ Indexes for faster lookups
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ isRead: 1 });

// ✅ Virtual for easy timestamp access (same as before)
messageSchema.virtual('timestamp').get(function () {
  return this.createdAt;
});

// ✅ Ensure virtuals appear in JSON responses
messageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Message', messageSchema);
