import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  StarIcon,
  UserIcon,
  CalendarIcon,
  ThumbUpIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const ProductReviews = ({ productId, reviews = [], onAddReview }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: '',
    name: '',
    email: ''
  });
  const [filterRating, setFilterRating] = useState(0);

  // Use passed reviews or mock data
  const mockReviews = [
    {
      id: 1,
      user: 'John Doe',
      rating: 5,
      title: 'Excellent quality!',
      comment: 'Really happy with this purchase. The quality is outstanding and delivery was fast.',
      date: '2025-10-20',
      helpful: 12,
      verified: true
    },
    {
      id: 2,
      user: 'Sarah Wilson',
      rating: 4,
      title: 'Good product',
      comment: 'Good quality for the price. Would recommend to others.',
      date: '2025-10-18',
      helpful: 8,
      verified: true
    },
    {
      id: 3,
      user: 'Mike Johnson',
      rating: 5,
      title: 'Perfect!',
      comment: 'Exactly what I was looking for. Great value for money.',
      date: '2025-10-15',
      helpful: 15,
      verified: false
    },
    {
      id: 4,
      user: 'Emma Brown',
      rating: 3,
      title: 'Average quality',
      comment: 'It\'s okay, but could be better. The material feels a bit cheap.',
      date: '2025-10-12',
      helpful: 3,
      verified: true
    },
    {
      id: 5,
      user: 'David Lee',
      rating: 5,
      title: 'Amazing!',
      comment: 'Exceeded my expectations. Will definitely buy again.',
      date: '2025-10-10',
      helpful: 20,
      verified: true
    }
  ];

  const allReviews = reviews.length ? reviews : mockReviews;
  const filteredReviews = filterRating > 0 
    ? allReviews.filter(r => r.rating === filterRating) 
    : allReviews;

  const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = allReviews.filter(r => r.rating === rating).length;
    return { rating, count, percentage: (count / allReviews.length) * 100 };
  });

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (newReview.rating === 0) return alert('Please select a rating');
    if (!newReview.title || !newReview.comment) return alert('Please fill in all required fields');

    onAddReview?.(newReview);
    setNewReview({ rating: 0, title: '', comment: '', name: '', email: '' });
    setShowReviewForm(false);
  };

  const StarRating = ({ rating, onRatingChange, interactive = false, size = 'w-5 h-5' }) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          onClick={() => interactive && onRatingChange(star)}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'} ${size} ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          {star <= rating ? <StarIconSolid className="w-full h-full fill-current" /> : <StarIcon className="w-full h-full" />}
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h3>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <div>
              <StarRating rating={Math.round(averageRating)} size="w-6 h-6" />
              <p className="text-sm text-gray-600 mt-1">Based on {allReviews.length} reviews</p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-8">{rating}</span>
                <StarIcon className="w-4 h-4 text-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Filter by Rating</h4>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setFilterRating(0)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                filterRating === 0 ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'
              }`}
            >
              All Reviews ({allReviews.length})
            </button>
            {[5, 4, 3, 2, 1].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setFilterRating(r)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  filterRating === r ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'
                }`}
              >
                <StarRating rating={r} size="w-4 h-4" />
                <span>({allReviews.filter(rv => rv.rating === r).length})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Review Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Write a Review
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8 p-6 bg-gray-50 rounded-lg"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Write Your Review</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
              <StarRating
                rating={newReview.rating}
                onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                interactive
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Title *</label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Summarize your review"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review *</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Tell us about your experience with this product"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  value={newReview.name}
                  onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newReview.email}
                  onChange={(e) => setNewReview(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No reviews found for this rating</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-gray-200 pb-6 last:border-b-0"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{review.user}</h4>
                      {review.verified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <StarRating rating={review.rating} size="w-4 h-4" />
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
              <p className="text-gray-700 mb-3">{review.comment}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <button type="button" className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                  <ThumbUpIcon className="w-4 h-4" />
                  Helpful ({review.helpful})
                </button>
                <button type="button" className="hover:text-gray-700 transition-colors">
                  Reply
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
