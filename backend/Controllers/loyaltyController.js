const { LoyaltyProgram, UserLoyalty } = require('../Models/Loyalty');
const User = require('../Models/User');
const Order = require('../Models/Order');

// ✅ Get loyalty program details
const getLoyaltyProgram = async (req, res) => {
  try {
    const program = await LoyaltyProgram.findOne({ isActive: true });
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'No active loyalty program found'
      });
    }

    res.json({
      success: true,
      data: program
    });
  } catch (error) {
    console.error('Get loyalty program error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty program'
    });
  }
};

// ✅ Get user's loyalty status
const getUserLoyalty = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    let userLoyalty = await UserLoyalty.findOne({ clerkId }).populate('user', 'name email');
    const program = await LoyaltyProgram.findOne({ isActive: true });

    if (!userLoyalty) {
      // Create loyalty account for new user
      const dbUser = await User.findOne({ clerkId });
      if (dbUser) {
        userLoyalty = new UserLoyalty({
          user: dbUser._id,
          clerkId
        });

        // Award registration points
        if (program && program.pointsForRegistration > 0) {
          await userLoyalty.addPoints(
            program.pointsForRegistration,
            'Welcome bonus for registration'
          );
        }

        await userLoyalty.save();
      }
    }

    // Clean up expired points
    if (userLoyalty) {
      await userLoyalty.cleanupExpiredPoints();
      if (program) {
        await userLoyalty.updateTier(program);
      }
    }

    res.json({
      success: true,
      data: {
        loyalty: userLoyalty,
        program,
        tierBenefits: userLoyalty && program ? userLoyalty.getTierBenefits(program) : {}
      }
    });
  } catch (error) {
    console.error('Get user loyalty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty information'
    });
  }
};

// ✅ Award points for purchase
const awardPurchasePoints = async (userId, orderAmount, orderId) => {
  try {
    const program = await LoyaltyProgram.findOne({ isActive: true });
    if (!program || program.pointsPerDollar <= 0) return;

    const points = Math.floor(orderAmount * program.pointsPerDollar);

    let userLoyalty = await UserLoyalty.findOne({ clerkId: userId });
    if (!userLoyalty) {
      const dbUser = await User.findOne({ clerkId: userId });
      if (dbUser) {
        userLoyalty = new UserLoyalty({
          user: dbUser._id,
          clerkId: userId
        });
        await userLoyalty.save();
      }
    }

    if (userLoyalty && points > 0) {
      await userLoyalty.addPoints(
        points,
        `Points earned from purchase #${orderId}`,
        orderId
      );

      await userLoyalty.updateTier(program);

      console.log(`Awarded ${points} points to user ${userId} for order ${orderId}`);
    }
  } catch (error) {
    console.error('Award purchase points error:', error);
  }
};

// ✅ Award points for review
const awardReviewPoints = async (userId) => {
  try {
    const program = await LoyaltyProgram.findOne({ isActive: true });
    if (!program || program.pointsForReview <= 0) return;

    let userLoyalty = await UserLoyalty.findOne({ clerkId: userId });
    if (!userLoyalty) {
      const dbUser = await User.findOne({ clerkId: userId });
      if (dbUser) {
        userLoyalty = new UserLoyalty({
          user: dbUser._id,
          clerkId: userId
        });
        await userLoyalty.save();
      }
    }

    if (userLoyalty) {
      await userLoyalty.addPoints(
        program.pointsForReview,
        'Points earned for writing a product review'
      );

      await userLoyalty.updateTier(program);

      console.log(`Awarded ${program.pointsForReview} review points to user ${userId}`);
    }
  } catch (error) {
    console.error('Award review points error:', error);
  }
};

// ✅ Redeem points
const redeemPoints = async (req, res) => {
  try {
    const { points, reason } = req.body;
    const clerkId = req.auth.userId;

    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid points amount'
      });
    }

    const userLoyalty = await UserLoyalty.findOne({ clerkId });
    if (!userLoyalty) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty account not found'
      });
    }

    await userLoyalty.redeemPoints(points, reason || 'Points redeemed');

    res.json({
      success: true,
      message: `${points} points redeemed successfully`,
      data: {
        availablePoints: userLoyalty.availablePoints,
        totalPoints: userLoyalty.totalPoints
      }
    });
  } catch (error) {
    console.error('Redeem points error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to redeem points'
    });
  }
};

// ✅ Get loyalty statistics (admin)
const getLoyaltyStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPoints,
      activeUsers,
      topEarners,
      recentTransactions
    ] = await Promise.all([
      UserLoyalty.countDocuments(),
      UserLoyalty.aggregate([
        { $group: { _id: null, total: { $sum: '$totalPoints' } } }
      ]),
      UserLoyalty.countDocuments({ availablePoints: { $gt: 0 } }),
      UserLoyalty.find()
        .populate('user', 'name email')
        .sort({ totalPoints: -1 })
        .limit(10),
      UserLoyalty.aggregate([
        { $unwind: '$transactions' },
        { $sort: { 'transactions.createdAt': -1 } },
        { $limit: 50 },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        { $unwind: '$userInfo' },
        {
          $project: {
            userName: '$userInfo.name',
            userEmail: '$userInfo.email',
            type: '$transactions.type',
            points: '$transactions.points',
            reason: '$transactions.reason',
            createdAt: '$transactions.createdAt'
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalPoints: totalPoints[0]?.total || 0,
          activeUsers,
          averagePoints: totalUsers > 0 ? Math.round((totalPoints[0]?.total || 0) / totalUsers) : 0
        },
        topEarners,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Get loyalty stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty statistics'
    });
  }
};

// ✅ Create/update loyalty program (admin)
const manageLoyaltyProgram = async (req, res) => {
  try {
    const programData = req.body;

    let program = await LoyaltyProgram.findOne();
    if (program) {
      Object.assign(program, programData);
      await program.save();
    } else {
      program = new LoyaltyProgram(programData);
      await program.save();
    }

    res.json({
      success: true,
      message: 'Loyalty program updated successfully',
      data: program
    });
  } catch (error) {
    console.error('Manage loyalty program error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update loyalty program'
    });
  }
};

// ✅ Generate referral code
const generateReferralCode = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const referralCode = `BEN${Date.now().toString(36).toUpperCase()}`;

    const userLoyalty = await UserLoyalty.findOne({ clerkId });
    if (!userLoyalty) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty account not found'
      });
    }

    // Add referral entry
    userLoyalty.referrals.push({
      referralCode,
      status: 'pending'
    });

    await userLoyalty.save();

    res.json({
      success: true,
      data: { referralCode }
    });
  } catch (error) {
    console.error('Generate referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate referral code'
    });
  }
};

// ✅ Process referral (when referred user registers)
const processReferral = async (referralCode, newUserId) => {
  try {
    const referrerLoyalty = await UserLoyalty.findOne({
      'referrals.referralCode': referralCode,
      'referrals.status': 'pending'
    });

    if (!referrerLoyalty) return;

    const program = await LoyaltyProgram.findOne({ isActive: true });
    if (!program || program.pointsForReferral <= 0) return;

    // Update referral status
    const referral = referrerLoyalty.referrals.find(r => r.referralCode === referralCode);
    if (referral) {
      referral.status = 'completed';
      referral.pointsAwarded = true;
      referral.referredUser = newUserId;
    }

    // Award points to referrer
    await referrerLoyalty.addPoints(
      program.pointsForReferral,
      `Referral bonus for bringing new user ${newUserId}`
    );

    await referrerLoyalty.save();

    console.log(`Processed referral ${referralCode} for referrer ${referrerLoyalty.clerkId}`);
  } catch (error) {
    console.error('Process referral error:', error);
  }
};

module.exports = {
  getLoyaltyProgram,
  getUserLoyalty,
  awardPurchasePoints,
  awardReviewPoints,
  redeemPoints,
  getLoyaltyStats,
  manageLoyaltyProgram,
  generateReferralCode,
  processReferral
};