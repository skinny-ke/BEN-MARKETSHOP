const express = require('express');
const User = require('../Models/User');
const router = express.Router();

// ✅ Clerk webhook handler for user events
router.post('/clerk/webhook', async (req, res) => {
  try {
    // Verify webhook signature in production
    const event = req.body;
    
    console.log(`📨 Received Clerk webhook: ${event.type}`);
    
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
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Clerk webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// Handle new user creation
async function handleUserCreated(userData) {
  try {
    const existingUser = await User.findOne({ clerkId: userData.id });
    
    if (!existingUser) {
      const newUser = await User.create({
        clerkId: userData.id,
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username || 'User',
        email: userData.email_addresses[0]?.email_address,
        role: 'user',
        profileImage: userData.image_url || '',
        isActive: true
      });
      
      console.log(`✅ User created via webhook: ${newUser.name}`);
    }
  } catch (error) {
    console.error('Error creating user from webhook:', error);
  }
}

// Handle user updates
async function handleUserUpdated(userData) {
  try {
    const user = await User.findOne({ clerkId: userData.id });
    
    if (user) {
      user.name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || user.name;
      user.email = userData.email_addresses[0]?.email_address || user.email;
      user.profileImage = userData.image_url || user.profileImage;
      await user.save();
      
      console.log(`✅ User updated via webhook: ${user.name}`);
    }
  } catch (error) {
    console.error('Error updating user from webhook:', error);
  }
}

// Handle user deletion
async function handleUserDeleted(clerkId) {
  try {
    const user = await User.findOne({ clerkId });
    
    if (user) {
      user.isActive = false;
      await user.save();
      
      console.log(`✅ User deactivated: ${clerkId}`);
    }
  } catch (error) {
    console.error('Error deleting user from webhook:', error);
  }
}

// Handle organization membership
async function handleOrgMembership(data, isActive) {
  try {
    const clerkId = data.public_user_data?.user_id;
    const orgId = data.organization?.id;
    
    if (clerkId && orgId) {
      const user = await User.findOne({ clerkId });
      
      if (user) {
        user.orgId = isActive ? orgId : null;
        await user.save();
        
        console.log(`✅ User org membership updated: ${clerkId} → ${orgId}`);
      }
    }
  } catch (error) {
    console.error('Error updating org membership:', error);
  }
}

module.exports = router;
