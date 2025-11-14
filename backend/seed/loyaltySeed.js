const { LoyaltyProgram } = require('../Models/Loyalty');

const seedLoyaltyProgram = async () => {
  try {
    console.log('🌟 Seeding loyalty program...');

    // Check if program already exists
    const existingProgram = await LoyaltyProgram.findOne();
    if (existingProgram) {
      console.log('⚠️  Loyalty program already exists. Skipping...');
      return;
    }

    // Create default loyalty program
    const loyaltyProgram = new LoyaltyProgram({
      name: 'BenMarket Rewards',
      description: 'Earn points with every purchase and unlock exclusive benefits',
      pointsPerDollar: 1, // 1 point per KSh spent
      pointsForRegistration: 100, // Welcome bonus
      pointsForReview: 50, // Points for reviews
      pointsForReferral: 200, // Points for referrals
      isActive: true,
      tiers: [
        {
          name: 'Bronze',
          minPoints: 0,
          benefits: {
            discountPercentage: 0,
            freeShipping: false,
            earlyAccess: false,
            prioritySupport: false
          }
        },
        {
          name: 'Silver',
          minPoints: 500,
          benefits: {
            discountPercentage: 5,
            freeShipping: false,
            earlyAccess: false,
            prioritySupport: false
          }
        },
        {
          name: 'Gold',
          minPoints: 1500,
          benefits: {
            discountPercentage: 10,
            freeShipping: true,
            earlyAccess: true,
            prioritySupport: false
          }
        },
        {
          name: 'Platinum',
          minPoints: 5000,
          benefits: {
            discountPercentage: 15,
            freeShipping: true,
            earlyAccess: true,
            prioritySupport: true
          }
        }
      ],
      expiryMonths: 24 // Points expire after 2 years
    });

    await loyaltyProgram.save();
    console.log('✅ Loyalty program seeded successfully');

  } catch (error) {
    console.error('❌ Error seeding loyalty program:', error);
  }
};

module.exports = seedLoyaltyProgram;