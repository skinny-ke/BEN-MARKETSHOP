import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, UserIcon, ThumbsUpIcon, FlagIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'sonner';
import api from '../api/axios';
import { useClerkContext } from '../context/ClerkContext';

const ProductReviews = ({ productId }) => {
  const { userData } = useClerkContext();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Fetch reviews
  const fetchReviews = async (pageNum = 1, sort = sortBy) => {
    try {
      setLoading(pageNum === 1);
      const response = await api.get(`/reviews/product/${productId}`, {
        params: { page: pageNum, limit: 10, sort: `-${sort}` }
      });

      if (response.data.success) {
        const { reviews: newReviews, stats: newStats, pagination } = response.data.data;
        setStats(newStats);
        setReviews(pageNum === 1 ? newReviews : [...reviews, ...newReviews]);
        setHasMore(pagination.page < pagination.pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  // Submit review
  const submitReview = async () => {
    if (!userData?.id) {
      toast.error('Please log in to submit a review');
      return;
    }

    if (!newReview.title.trim() || !newReview.comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/reviews', {
        productId,
        ...newReview
      });

      if (response.data.success) {
        toast.success('Review submitted successfully!');
        setNewReview({ rating: 5, title: '', comment: '' });
        setShowReviewForm(false);
        fetchReviews(1); // Refresh reviews
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Mark review as helpful
  const markHelpful = async (reviewId) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/helpful`);
      if (response.data.success) {
        // Update local state
        setReviews(reviews.map(review =>
          review._id === reviewId
            ? { ...review, helpfulCount: response.data.data.helpfulCount }
            : review
        ));
        toast.success('Marked as helpful');
      }
    } catch (error) {
      console.error('Error marking helpful:', error);
      toast.error('Failed to mark as helpful');
    }
  };

  // Report review
  const reportReview = async (reviewId) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/report`, {
        reason: 'Inappropriate content'
      });
      if (response.data.success) {
        toast.success('Review reported');
      }
    } catch (error) {
      console.error('Error reporting review:', error);
      toast.error('Failed to report review');
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(star)}
            className={`w-5 h-5 ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {star <= rating ? (
              <StarIconSolid className="w-5 h-5 text-yellow-400" />
            ) : (
              <StarIcon className="w-5 h-5 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Customer Reviews</h3>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Write a Review
            </button>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.averageRating}</div>
              <div className="flex justify-center mb-1">
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <div className="text-sm text-gray-600">{stats.totalReviews} reviews</div>
            </div>

            <div className="flex-1">
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map(rating => {
                  const distribution = stats.distribution.find(d => d.rating === rating);
                  return (
                    <div key={rating} className="flex items-center text-sm">
                      <span className="w-3">{rating}</span>
                      <StarIconSolid className="w-3 h-3 text-yellow-400 mx-1" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${distribution?.percentage || 0}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-right">{distribution?.count || 0}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg border p-6 overflow-hidden"
          >
            <h4 className="text-lg font-semibold mb-4">Write Your Review</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                {renderStars(newReview.rating, true, (rating) =>
                  setNewReview({ ...newReview, rating })
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Review Title</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Summarize your experience"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Review</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                  placeholder="Tell others about your experience with this product"
                  maxLength={1000}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  disabled={submitting}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              fetchReviews(1, e.target.value);
            }}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="createdAt">Most Recent</option>
            <option value="rating">Highest Rated</option>
            <option value="helpfulCount">Most Helpful</option>
          </select>
        </div>
        <span className="text-sm text-gray-600">{reviews.length} reviews</span>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={review._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-lg border p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {review.userAvatar ? (
                    <img src={review.userAvatar} alt={review.userName} className="w-10 h-10 rounded-full" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{review.userName}</span>
                    {review.verified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {renderStars(review.rating)}
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => reportReview(review._id)}
                className="text-gray-400 hover:text-red-500 p-1"
                title="Report review"
              >
                <FlagIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">{review.title}</h4>
              <p className="text-gray-700">{review.comment}</p>
            </div>

            {review.images && review.images.length > 0 && (
              <div className="flex space-x-2 mb-4">
                {review.images.map((image, imgIndex) => (
                  <img
                    key={imgIndex}
                    src={image}
                    alt={`Review image ${imgIndex + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => markHelpful(review._id)}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600"
              >
                <ThumbsUpIcon className="w-4 h-4" />
                <span>Helpful ({review.helpfulCount || 0})</span>
              </button>

              {review.response && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Seller Response</span>
                  </div>
                  <p className="text-sm text-blue-700">{review.response.message}</p>
                  <span className="text-xs text-blue-600 mt-1 block">
                    {new Date(review.response.timestamp).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => fetchReviews(page + 1)}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Load More Reviews
          </button>
        </div>
      )}

      {reviews.length === 0 && !loading && (
        <div className="text-center py-8">
          <StarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
