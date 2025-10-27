const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const { Webhook } = require('svix');
const crypto = require('crypto');

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const payload = req.body;
  const headers = req.headers;
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  try {
    // Verify webhook signature
    const wh = new Webhook(secret);
    const evt = wh.verify(payload, headers);

    console.log(`📨 Clerk event: ${evt.type}`);

    if (evt.type === 'user.created') {
      const data = evt.data;
      const existing = await User.findOne({ email: data.email_addresses[0].email_address });

      if (!existing) {
        const newUser = new User({
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          email: data.email_addresses[0].email_address,
          image: data.image_url,
          clerkId: data.id,
          role: 'user',
        });
        await newUser.save();
        console.log(`✅ Saved new user ${newUser.email}`);
      }
    }

    if (evt.type === 'user.deleted') {
      await User.findOneAndDelete({ clerkId: evt.data.id });
      console.log(`🗑 Deleted user ${evt.data.id}`);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Clerk webhook error:', err.message);
    res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }
});

module.exports = router;
