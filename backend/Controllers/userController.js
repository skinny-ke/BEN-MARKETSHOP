const User = require('../Models/User');

// 🧩 Get all active users (admin only)
const getAllUsers = async (req, res) => {
  try {
    // Verify admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const users = await User.find({ isActive: true })
      .select('-__v -password') // never return passwords
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('❌ Error getting all users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
};

// 🛠 Update a user's role (admin only)
const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent demoting the last admin
    if (user.role === 'admin' && role === 'user') {
      const otherAdmins = await User.countDocuments({ role: 'admin', isActive: true });
      if (otherAdmins <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove the last admin'
        });
      }
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
};

// 🚫 Deactivate user (admin only)
const deactivateUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-deactivation
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot deactivate themselves'
      });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('❌ Error deactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user'
    });
  }
};

// 📊 Get user statistics (admin only)
const getUserStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [totalUsers, adminUsers, regularUsers] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin', isActive: true }),
      User.countDocuments({ role: 'user', isActive: true }),
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true,
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        adminUsers,
        regularUsers,
        recentUsers,
      },
    });
  } catch (error) {
    console.error('❌ Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  deactivateUser,
  getUserStats,
};
