const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Clerk user ID - required for all users now
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please enter your name'],
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// 🔍 Indexes
UserSchema.index({ clerkId: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// ✅ Static method to sync or create Clerk user
UserSchema.statics.findOrCreateFromClerk = async function(clerkUser) {
  try {
    let user = await this.findOne({ clerkId: clerkUser.id });

    if (!user) {
      user = new this({
        clerkId: clerkUser.id,
        name:
          clerkUser.fullName ||
          `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        email: clerkUser.emailAddresses[0]?.emailAddress,
        image: clerkUser.imageUrl || '',
        role: 'user',
      });
      await user.save();
    } else {
      user.name =
        clerkUser.fullName ||
        `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      user.email = clerkUser.emailAddresses[0]?.emailAddress;
      user.image = clerkUser.imageUrl || '';
      user.lastLogin = new Date();
      await user.save();
    }

    return user;
  } catch (error) {
    console.error('Error syncing Clerk user:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema);
