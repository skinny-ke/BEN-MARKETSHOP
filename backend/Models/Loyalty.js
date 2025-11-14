const mongoose = require('mongoose');

const loyaltyProgramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  pointsPerDollar: {
    type: Number,
    default: 1,
    min: 0
  },
  pointsForRegistration: {
    type: Number,
    default: 100
  },
  pointsForReview: {
    type: Number,
    default: 50
  },
  pointsForReferral: {
    type: Number,
    default: 200
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tiers: [{
    name: {
      type: String,
      required: true
    },
    minPoints: {
      type: Number,
      required: true,
      min: 0
    },
    benefits: {
      discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      freeShipping: {
        type: Boolean,
        default: false
      },
      earlyAccess: {
        type: Boolean,
        default: false
      },
      prioritySupport: {
        type: Boolean,
        default: false
      }
    }
  }],
  expiryMonths: {
    type: Number,
    default: 24, // Points expire after 24 months
    min: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
loyaltyProgramSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const userLoyaltySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  availablePoints: {
    type: Number,
    default: 0,
    min: 0
  },
  currentTier: {
    type: String,
    default: 'Bronze'
  },
  lifetimeEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  lifetimeRedeemed: {
    type: Number,
    default: 0,
    min: 0
  },
  transactions: [{
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'expired', 'adjusted'],
      required: true
    },
    points: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    expiresAt: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  referrals: [{
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    referralCode: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'expired'],
      default: 'pending'
    },
    pointsAwarded: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

// Virtual for calculating points expiry
userLoyaltySchema.virtual('expiredPoints').get(function() {
  const now = new Date();
  return this.transactions
    .filter(t => t.type === 'earned' && t.expiresAt && t.expiresAt < now)
    .reduce((sum, t) => sum + t.points, 0);
});

// Method to add points
userLoyaltySchema.methods.addPoints = function(points, reason, orderId = null, expiryMonths = 24) {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + expiryMonths);

  this.totalPoints += points;
  this.availablePoints += points;
  this.lifetimeEarned += points;
  this.lastActivity = new Date();

  this.transactions.push({
    type: 'earned',
    points,
    reason,
    orderId,
    expiresAt
  });

  return this.save();
};

// Method to redeem points
userLoyaltySchema.methods.redeemPoints = function(points, reason, orderId = null) {
  if (this.availablePoints < points) {
    throw new Error('Insufficient points');
  }

  this.availablePoints -= points;
  this.lifetimeRedeemed += points;
  this.lastActivity = new Date();

  this.transactions.push({
    type: 'redeemed',
    points: -points,
    reason,
    orderId
  });

  return this.save();
};

// Method to update tier based on total points
userLoyaltySchema.methods.updateTier = function(program) {
  const tiers = program.tiers.sort((a, b) => b.minPoints - a.minPoints);
  const newTier = tiers.find(tier => this.totalPoints >= tier.minPoints)?.name || 'Bronze';

  if (this.currentTier !== newTier) {
    this.currentTier = newTier;
    return this.save();
  }

  return this;
};

// Method to get tier benefits
userLoyaltySchema.methods.getTierBenefits = function(program) {
  const tier = program.tiers.find(t => t.name === this.currentTier);
  return tier?.benefits || {};
};

// Method to clean up expired points
userLoyaltySchema.methods.cleanupExpiredPoints = function() {
  const now = new Date();
  let expiredPoints = 0;

  this.transactions.forEach(transaction => {
    if (transaction.type === 'earned' && transaction.expiresAt && transaction.expiresAt < now) {
      expiredPoints += transaction.points;
      transaction.type = 'expired';
    }
  });

  if (expiredPoints > 0) {
    this.availablePoints = Math.max(0, this.availablePoints - expiredPoints);
    this.transactions.push({
      type: 'expired',
      points: -expiredPoints,
      reason: 'Points expired',
      expiresAt: now
    });
  }

  return this.save();
};

module.exports = {
  LoyaltyProgram: mongoose.model('LoyaltyProgram', loyaltyProgramSchema),
  UserLoyalty: mongoose.model('UserLoyalty', userLoyaltySchema)
};