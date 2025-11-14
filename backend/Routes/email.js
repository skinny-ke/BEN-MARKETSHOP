const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const { clerkAuth, requireAdmin } = require('../middleware/clerkAuth');
const { body } = require('express-validator');

// ✅ Send welcome email (admin only - for testing)
router.post('/welcome', clerkAuth, requireAdmin, [
  body('email').isEmail(),
  body('name').isString().isLength({ min: 1 })
], async (req, res) => {
  try {
    const { email, name } = req.body;
    const result = await emailService.sendWelcomeEmail(email, name);

    if (result.success) {
      res.json({
        success: true,
        message: 'Welcome email sent successfully',
        emailId: result.id
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send welcome email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Send welcome email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send welcome email'
    });
  }
});

// ✅ Send order confirmation (admin only - for testing)
router.post('/order-confirmation', clerkAuth, requireAdmin, [
  body('orderId').isString(),
  body('userEmail').isEmail(),
  body('userName').isString().isLength({ min: 1 })
], async (req, res) => {
  try {
    const { orderId, userEmail, userName } = req.body;

    // Mock order object for testing
    const mockOrder = {
      _id: orderId,
      items: [
        {
          product: { name: 'Test Product', image: '/placeholder.png' },
          quantity: 1,
          price: 1000
        }
      ],
      totalAmount: 1000,
      createdAt: new Date()
    };

    const result = await emailService.sendOrderConfirmation(mockOrder, userEmail, userName);

    if (result.success) {
      res.json({
        success: true,
        message: 'Order confirmation email sent successfully',
        emailId: result.id
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send order confirmation email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Send order confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send order confirmation email'
    });
  }
});

// ✅ Send newsletter (admin only)
router.post('/newsletter', clerkAuth, requireAdmin, [
  body('subject').isString().isLength({ min: 1 }),
  body('body').isString().isLength({ min: 1 }),
  body('recipients').isArray(),
  body('recipients.*').isEmail()
], async (req, res) => {
  try {
    const { subject, body, recipients } = req.body;
    const content = { subject, body };

    const results = [];
    for (const email of recipients) {
      const result = await emailService.sendNewsletter(email, 'Valued Customer', content);
      results.push({ email, success: result.success, id: result.id || null, error: result.error });
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `Newsletter sent to ${successful} recipients, ${failed} failed`,
      results
    });
  } catch (error) {
    console.error('Send newsletter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send newsletter'
    });
  }
});

// ✅ Send abandoned cart reminder (admin only - for testing)
router.post('/abandoned-cart', clerkAuth, requireAdmin, [
  body('userEmail').isEmail(),
  body('userName').isString().isLength({ min: 1 }),
  body('cartItems').isArray()
], async (req, res) => {
  try {
    const { userEmail, userName, cartItems } = req.body;
    const result = await emailService.sendAbandonedCartReminder(userEmail, userName, cartItems);

    if (result.success) {
      res.json({
        success: true,
        message: 'Abandoned cart email sent successfully',
        emailId: result.id
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send abandoned cart email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Send abandoned cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send abandoned cart email'
    });
  }
});

// ✅ Test email configuration (admin only)
router.get('/test', clerkAuth, requireAdmin, async (req, res) => {
  try {
    // Send a test email to the admin
    const result = await emailService.sendWelcomeEmail(
      req.user.email || req.auth.userId + '@test.com',
      req.user.name || 'Test User'
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        emailId: result.id
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email'
    });
  }
});

module.exports = router;