const express = require('express');
const { Webhook } = require('svix'); // Clerk webhooks use Svix
const User = require('../Models/User');

const router = express.Router();

/**
 * 🛡️ Secure Clerk Webhook
 * Must be mounted BEFORE express.json() middleware (see server.js)
 */
router.post(
  '/',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET;

    if (!secret) {
      console.error('❌ Missing CLERK_WEBHOOK_SECRET in .env');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    try {
      // Verify signature
      const wh = new Webhook(secret);
      const event = wh.verify(req.body, req.headers);

      console.log(`📨 Verified Clerk event: ${event.type}`);

      // Handle Clerk events
      switch (event.type) {
        case 'user.created':
          await handleUserCreated(event.data);
          break;
        case 'user.updated':
          await handleUserUpdated(event.data);
          break;
        case 'user.deleted':
          await handleUserDeleted(event.data.id);
          break;
        case 'organizationMembership.created':
          await handleOrgMembership(event.data, true);
          break;
        case 'organizationMembership.deleted':
          await handleOrgMembership(event.data, false);
          break;
        default:
          console.log(`⚙️ Unhandled Clerk event type: ${event.type}`);
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error('❌ Clerk webhook verification failed:', err.message);
      res.status(400).json({ error: 'Invalid signature or event' });
    }
  }
);

/* ==========================
   🧩 EVENT HANDLERS
========================== */

async function handleUserCreated(data) {
  const existing = await User.findOne({ clerkId: data.id });
  if (existing) {
    console.log(`⚠️ User already exists: ${existing.email}`);
    return;
  }

  const newUser = await User.create({
    clerkId: data.id,
    name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User',
    email: data.email_addresses?.[0]?.email_address,
    profileImage: data.image_url || '',
    role: 'user',
    isActive: true,
  });

  console.log(`✅ User created via Clerk: ${newUser.email}`);
}

async function handleUserUpdated(data) {
  const user = await User.findOne({ clerkId: data.id });
  if (!user) return;

  user.name = `${data.first_name || ''} ${data.last_name || ''}`.trim() || user.name;
  user.email = data.email_addresses?.[0]?.email_address || user.email;
  user.profileImage = data.image_url || user.profileImage;
  await user.save();

  console.log(`🔄 User updated: ${user.email}`);
}

async function handleUserDeleted(clerkId) {
  const user = await User.findOne({ clerkId });
  if (!user) return;

  user.isActive = false;
  await user.save();
  console.log(`🗑️ User deactivated: ${clerkId}`);
}

async function handleOrgMembership(data, isActive) {
  const clerkId = data.public_user_data?.user_id;
  const orgId = data.organization?.id;
  if (!clerkId || !orgId) return;

  const user = await User.findOne({ clerkId });
  if (user) {
    user.orgId = isActive ? orgId : null;
    await user.save();
    console.log(`🏢 Org membership ${isActive ? 'added' : 'removed'} for ${clerkId}`);
  }
}

module.exports = router;
