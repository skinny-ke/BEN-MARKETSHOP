const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const { Webhook } = require('svix');

router.post('/webhook', express.raw({ type: '*/*' }), async (req, res) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  try {
    const payload = req.body.toString('utf8');
    const headers = req.headers;

    const wh = new Webhook(secret);
    const evt = wh.verify(payload, headers);

    console.log(`📨 Clerk event: ${evt.type}`);

    const data = evt.data;

    if (evt.type === 'user.created') {
      const email = data.email_addresses[0].email_address;
      const isAdmin = email === 'bensonmmaina89@gmail.com';

      const existing = await User.findOne({ email });
      if (!existing) {
        const newUser = new User({
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          email,
          image: data.image_url,
          clerkId: data.id,
          role: isAdmin ? 'admin' : 'user',
        });
        await newUser.save();
        console.log(`✅ Created new ${isAdmin ? 'admin' : 'user'}: ${email}`);
      }
    }

    if (evt.type === 'user.updated') {
      const email = data.email_addresses[0].email_address;
      await User.findOneAndUpdate(
        { clerkId: data.id },
        {
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          email,
          image: data.image_url,
        }
      );
      console.log(`🔄 Updated user ${email}`);
    }

    if (evt.type === 'user.deleted') {
      await User.findOneAndDelete({ clerkId: data.id });
      console.log(`🗑 Deleted user ${data.id}`);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Clerk webhook error:', err.message);
    res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }
});

module.exports = router;
