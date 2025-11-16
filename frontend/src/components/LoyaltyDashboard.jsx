import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StarIcon, GiftIcon, TrophyIcon, ClockIcon, UsersIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useTranslation } from '../context/LanguageContext';
import { toast } from 'sonner';
import api from '../api/axios';

const LoyaltyDashboard = () => {
  const { t } = useTranslation();
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/loyalty');
      if (response.data.success) {
        setLoyaltyData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      toast.error('Failed to load loyalty information');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemPoints = async (points) => {
    if (!loyaltyData?.loyalty || points > loyaltyData.loyalty.availablePoints) {
      toast.error('Insufficient points');
      return;
    }

    setRedeeming(true);
    try {
      const response = await api.post('/api/loyalty/redeem', {
        points,
        reason: 'Points redeemed for discount'
      });

      if (response.data.success) {
        toast.success(`Successfully redeemed ${points} points!`);
        fetchLoyaltyData(); // Refresh data
      }
    } catch (error) {
      console.error('Error redeeming points:', error);
      toast.error(error.response?.data?.message || 'Failed to redeem points');
    } finally {
      setRedeeming(false);
    }
  };

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return 'text-purple-600 bg-purple-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      default: return 'text-orange-600 bg-orange-100';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return '👑';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      default: return '🥉';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!loyaltyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Unable to load loyalty information</p>
        </div>
      </div>
    );
  }

  const { loyalty, program, tierBenefits } = loyaltyData;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green to-green-light text-white rounded-xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{t('loyaltyPoints', 'Loyalty Points')}</h1>
                <p className="text-green-100">{t('earnPoints', 'Earn points with every purchase')}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{loyalty?.availablePoints || 0}</div>
                <div className="text-green-100">{t('pointsBalance', 'Points Balance')}</div>
              </div>
            </div>
          </div>

          {/* Current Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-surface-dark rounded-xl shadow-lg p-6 mb-6 border border-border-light dark:border-border-dark"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${getTierColor(loyalty?.currentTier)}`}>
                  <span className="text-2xl">{getTierIcon(loyalty?.currentTier)}</span>
                </div>
                <div>
                <h3 className="text-xl font-semibold text-text dark:text-text-dark">{loyalty?.currentTier || 'Bronze'} Member</h3>
                <p className="text-gray-600 dark:text-gray-400">Current Tier</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-text dark:text-text-dark">{loyalty?.totalPoints || 0}</div>
                <div className="text-gray-600 dark:text-gray-400">Total Points Earned</div>
              </div>
            </div>

            {/* Tier Benefits */}
            {tierBenefits && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {tierBenefits.discountPercentage > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                    <span>{tierBenefits.discountPercentage}% discount on all purchases</span>
                  </div>
                )}
                {tierBenefits.freeShipping && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <GiftIcon className="w-6 h-6 text-blue-600" />
                    <span>Free shipping on all orders</span>
                  </div>
                )}
                {tierBenefits.prioritySupport && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <UsersIcon className="w-6 h-6 text-purple-600" />
                    <span>Priority customer support</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Points Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-surface-dark rounded-xl shadow-lg p-6 border border-border-light dark:border-border-dark"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <StarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-text dark:text-text-dark">{loyalty?.availablePoints || 0}</div>
                  <div className="text-gray-600 dark:text-gray-400">Available Points</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-surface-dark rounded-xl shadow-lg p-6 border border-border-light dark:border-border-dark"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrophyIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-text dark:text-text-dark">{loyalty?.lifetimeEarned || loyalty?.totalPoints || 0}</div>
                  <div className="text-gray-600 dark:text-gray-400">Lifetime Earned</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-surface-dark rounded-xl shadow-lg p-6 border border-border-light dark:border-border-dark"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-full">
                  <GiftIcon className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-text dark:text-text-dark">{loyalty?.lifetimeRedeemed || (loyalty?.totalPoints - loyalty?.availablePoints) || 0}</div>
                  <div className="text-gray-600 dark:text-gray-400">Lifetime Redeemed</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* How to Earn Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-surface-dark rounded-xl shadow-lg p-6 mb-6 border border-border-light dark:border-border-dark"
          >
            <h3 className="text-xl font-semibold mb-4 text-text dark:text-text-dark">How to Earn Points</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Make Purchases</h4>
                  <p className="text-sm text-gray-600">
                    Earn {program?.pointsPerDollar || 1} point{program?.pointsPerDollar !== 1 ? 's' : ''} per KSh spent
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <StarIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Write Reviews</h4>
                  <p className="text-sm text-gray-600">
                    Earn {program?.pointsForReview || 50} points for each product review
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-purple-100 rounded-full">
                  <UsersIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Refer Friends</h4>
                  <p className="text-sm text-gray-600">
                    Earn {program?.pointsForReferral || 200} points when friends join
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <TrophyIcon className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium">Welcome Bonus</h4>
                  <p className="text-sm text-gray-600">
                    Get {program?.pointsForRegistration || 100} points when you join
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Redeem Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-surface-dark rounded-xl shadow-lg p-6 mb-6 border border-border-light dark:border-border-dark"
          >
            <h3 className="text-xl font-semibold mb-4 text-text dark:text-text-dark">{t('redeemPoints', 'Redeem Points')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleRedeemPoints(100)}
                disabled={redeeming || (loyalty?.availablePoints || 0) < 100}
                className="p-4 border-2 border-green-200 rounded-lg hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">100</div>
                  <div className="text-sm text-gray-600">Points</div>
                  <div className="text-xs text-gray-500 mt-1">KSh 10 discount</div>
                </div>
              </button>

              <button
                onClick={() => handleRedeemPoints(250)}
                disabled={redeeming || (loyalty?.availablePoints || 0) < 250}
                className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">250</div>
                  <div className="text-sm text-gray-600">Points</div>
                  <div className="text-xs text-gray-500 mt-1">KSh 25 discount</div>
                </div>
              </button>

              <button
                onClick={() => handleRedeemPoints(500)}
                disabled={redeeming || (loyalty?.availablePoints || 0) < 500}
                className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">500</div>
                  <div className="text-sm text-gray-600">Points</div>
                  <div className="text-xs text-gray-500 mt-1">KSh 50 discount</div>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Recent Transactions */}
          {loyalty?.transactions && loyalty.transactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-surface-dark rounded-xl shadow-lg p-6 border border-border-light dark:border-border-dark"
            >
              <h3 className="text-xl font-semibold mb-4 text-text dark:text-text-dark">Recent Activity</h3>
              <div className="space-y-3">
                {loyalty.transactions.slice(0, 10).map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'earned' ? 'bg-green-100' :
                        transaction.type === 'redeemed' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        {transaction.type === 'earned' ? (
                          <StarIcon className="w-4 h-4 text-green-600" />
                        ) : transaction.type === 'redeemed' ? (
                          <GiftIcon className="w-4 h-4 text-red-600" />
                        ) : (
                          <ClockIcon className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.reason}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'earned' ? 'text-green-600' :
                      transaction.type === 'redeemed' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {transaction.type === 'earned' ? '+' : '-'}{Math.abs(transaction.points)} points
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoyaltyDashboard;