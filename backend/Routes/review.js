const express = require('express');
const Review = require('../Models/Review');
const Order = require('../Models/Order');
const { clerkAuth, requireAuth } = require('../middleware/clerkAuth');

const router = express.Router();

// ✅ Get all reviews for a product (public)
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || '-createdAt'; // -createdAt, rating, helpfulCount

    const reviews = await Review.find({ product: productId, reported: false })
      .populate('user', 'name avatar')
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Review.countDocuments({ product: productId, reported: false });

    // Calculate average rating
    const ratingStats = await Review.aggregate([
      { $match: { product: require('mongoose').Types.ObjectId(productId), reported: false } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    const stats = ratingStats[0] || { averageRating: 0, totalReviews: 0, ratingDistribution: [] };

    // Calculate rating distribution
    const distribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: stats.ratingDistribution.filter(r => r === rating).length,
      percentage: stats.totalReviews > 0 ? (stats.ratingDistribution.filter(r => r === rating).length / stats.totalReviews * 100).toFixed(1) : 0
    }));

    res.json({
      success: true,
      data: {
        reviews,
        stats: {
          averageRating: Math.round(stats.averageRating * 10) / 10,
          totalReviews: stats.totalReviews,
          distribution
        },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
});

// ✅ Create a review (authenticated users only)
router.post('/', clerkAuth, async (req, res) => {
  try {
    const { productId, rating, title, comment, images } = req.body;
    const userId = req.auth.userId;
    const userName = req.user.name || req.user.firstName + ' ' + req.user.lastName;
    const userAvatar = req.user.imageUrl || '';

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product: productId, userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Check if user purchased the product (for verified badge)
    const hasPurchased = await Order.findOne({
      user: req.user.dbUser?._id,
      'items.product': productId,
      paymentStatus: 'paid'
    });

    const review = new Review({
      product: productId,
      user: req.user.dbUser?._id,
      userId,
      userName,
      userAvatar,
      rating: parseInt(rating),
      title,
      comment,
      images: images || [],
      verified: !!hasPurchased
    });

    await review.save();

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: 'Error creating review' });
  }
});

// ✅ Update a review (review owner only)
router.put('/:reviewId', clerkAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, images } = req.body;
    const userId = req.auth.userId;

    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to edit it'
      });
    }

    // Update fields
    if (rating) review.rating = parseInt(rating);
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    await review.save();

    res.json({
      success: true,
      data: review,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ success: false, message: 'Error updating review' });
  }
});

// ✅ Delete a review (review owner or admin)
router.delete('/:reviewId', clerkAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.auth.userId;
    const isAdmin = req.user.role === 'admin';

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check permissions
    if (review.userId !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this review'
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Error deleting review' });
  }
});

// ✅ Mark review as helpful (authenticated users)
router.post('/:reviewId/helpful', clerkAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.auth.userId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already marked as helpful
    const alreadyMarked = review.helpful.some(h => h.userId === userId);
    if (alreadyMarked) {
      return res.status(400).json({
        success: false,
        message: 'You have already marked this review as helpful'
      });
    }

    review.helpful.push({ userId, timestamp: new Date() });
    await review.save();

    res.json({
      success: true,
      data: { helpfulCount: review.helpful.length },
      message: 'Review marked as helpful'
    });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({ success: false, message: 'Error marking review as helpful' });
  }
});

// ✅ Report a review (authenticated users)
router.post('/:reviewId/report', clerkAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // In a real app, you'd store the report reason and notify admins
    // For now, we'll just mark as reported
    review.reported = true;
    await review.save();

    res.json({
      success: true,
      message: 'Review reported successfully'
    });
  } catch (error) {
    console.error('Error reporting review:', error);
    res.status(500).json({ success: false, message: 'Error reporting review' });
  }
});

// ✅ Admin: Respond to a review
router.post('/:reviewId/response', clerkAuth, requireAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { message } = req.body;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.response = {
      adminId: req.auth.userId,
      adminName: req.user.name || 'Admin',
      message,
      timestamp: new Date()
    };

    await review.save();

    res.json({
      success: true,
      data: review,
      message: 'Response added successfully'
    });
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({ success: false, message: 'Error adding response' });
  }
});

module.exports = router;