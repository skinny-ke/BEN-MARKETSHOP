const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const { clerkAuth } = require('../middleware/clerkAuth');

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:admin@benmarket.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Store subscriptions (in production, use database)
let subscriptions = [];

// ✅ Get VAPID public key
router.get('/vapid-public-key', (req, res) => {
  res.json({
    success: true,
    publicKey: process.env.VAPID_PUBLIC_KEY
  });
});

// ✅ Subscribe to push notifications
router.post('/subscribe', clerkAuth, async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.auth.userId;

    // Add user ID to subscription
    const subscriptionWithUser = {
      ...subscription,
      userId
    };

    // Check if already subscribed
    const existingIndex = subscriptions.findIndex(sub =>
      sub.endpoint === subscription.endpoint
    );

    if (existingIndex >= 0) {
      subscriptions[existingIndex] = subscriptionWithUser;
    } else {
      subscriptions.push(subscriptionWithUser);
    }

    console.log(`User ${userId} subscribed to push notifications`);

    res.json({
      success: true,
      message: 'Successfully subscribed to push notifications'
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to push notifications'
    });
  }
});

// ✅ Unsubscribe from push notifications
router.post('/unsubscribe', clerkAuth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    const userId = req.auth.userId;

    subscriptions = subscriptions.filter(sub =>
      !(sub.endpoint === endpoint && sub.userId === userId)
    );

    console.log(`User ${userId} unsubscribed from push notifications`);

    res.json({
      success: true,
      message: 'Successfully unsubscribed from push notifications'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from push notifications'
    });
  }
});

// ✅ Send test notification (admin only)
router.post('/test', clerkAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;

    // Find user's subscription
    const userSubscription = subscriptions.find(sub => sub.userId === userId);

    if (!userSubscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found for this user'
      });
    }

    // Send test notification
    const payload = JSON.stringify({
      title: 'BenMarket Test Notification',
      body: 'This is a test push notification from BenMarket!',
      icon: '/logo.png',
      badge: '/favicon-32x32.png',
      data: {
        url: '/'
      }
    });

    await webpush.sendNotification(userSubscription, payload);

    res.json({
      success: true,
      message: 'Test notification sent successfully'
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
});

// ✅ Send notification to specific user (admin only)
router.post('/send/:userId', clerkAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, body, icon, url } = req.body;

    // Find user's subscription
    const userSubscription = subscriptions.find(sub => sub.userId === userId);

    if (!userSubscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found for this user'
      });
    }

    // Send notification
    const payload = JSON.stringify({
      title: title || 'BenMarket Notification',
      body: body || 'You have a new notification',
      icon: icon || '/logo.png',
      badge: '/favicon-32x32.png',
      data: {
        url: url || '/'
      }
    });

    await webpush.sendNotification(userSubscription, payload);

    res.json({
      success: true,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
});

// ✅ Send notification to all subscribers (admin only)
router.post('/broadcast', clerkAuth, async (req, res) => {
  try {
    const { title, body, icon, url } = req.body;

    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No subscribers found'
      });
    }

    const payload = JSON.stringify({
      title: title || 'BenMarket Notification',
      body: body || 'You have a new notification',
      icon: icon || '/logo.png',
      badge: '/favicon-32x32.png',
      data: {
        url: url || '/'
      }
    });

    let successCount = 0;
    let failCount = 0;

    // Send to all subscribers
    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(subscription, payload);
        successCount++;
      } catch (error) {
        console.error(`Failed to send to ${subscription.userId}:`, error);
        failCount++;
        // Remove invalid subscriptions
        subscriptions = subscriptions.filter(sub => sub !== subscription);
      }
    }

    res.json({
      success: true,
      message: `Notification sent to ${successCount} subscribers, ${failCount} failed`,
      results: { success: successCount, failed: failCount }
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to broadcast notification'
    });
  }
});

// ✅ Get subscription stats (admin only)
router.get('/stats', clerkAuth, async (req, res) => {
  try {
    const totalSubscriptions = subscriptions.length;
    const uniqueUsers = new Set(subscriptions.map(sub => sub.userId)).size;

    res.json({
      success: true,
      data: {
        totalSubscriptions,
        uniqueUsers,
        subscriptions: subscriptions.map(sub => ({
          userId: sub.userId,
          endpoint: sub.endpoint.substring(0, 50) + '...'
        }))
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification stats'
    });
  }
});

module.exports = router;