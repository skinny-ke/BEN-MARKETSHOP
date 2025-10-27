const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
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
  orgId: {
    type: String,
    default: null,
    index: true
  },
  profileImage: {
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
  }
}, { timestamps: true });

// Index for better query performance
UserSchema.index({ clerkId: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// Static method to find or create user from Clerk data
UserSchema.statics.findOrCreateFromClerk = async function(clerkUser) {
  try {
    let user = await this.findOne({ clerkId: clerkUser.id });
    
    if (!user) {
      user = new this({
        clerkId: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName + ' ' + clerkUser.lastName,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        profileImage: clerkUser.imageUrl || '',
        role: 'user' // Default role, can be updated by admin
      });
      await user.save();
    } else {
      // Update existing user data from Clerk
      user.name = clerkUser.fullName || clerkUser.firstName + ' ' + clerkUser.lastName;
      user.email = clerkUser.emailAddresses[0]?.emailAddress;
      user.profileImage = clerkUser.imageUrl || '';
      user.lastLogin = new Date();
      await user.save();
    }
    
    return user;
  } catch (error) {
    console.error('Error finding or creating user from Clerk:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema);
