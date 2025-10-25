const express = require('express');
const crypto = require('crypto');
const User = require('../Models/User');
const router = express.Router();

// Simple webhook verification
const verifyWebhook = (payload, signature, secret) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

// Clerk webhook endpoint
router.post('/clerk/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // For development, skip webhook verification
    const payload = JSON.parse(req.body.toString());
    
    const { type, data } = payload;
    
    console.log(`Received Clerk webhook: ${type}`);
    
    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      default:
        console.log(`Unhandled webhook event: ${type}`);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Clerk webhook error:', error);
    res.status(400).json({ error: 'Webhook verification failed' });
  }
});

// Handle user creation
async function handleUserCreated(userData) {
  try {
    const { id, email_addresses, first_name, last_name, image_url } = userData;
    
    // Check if user already exists
    const existingUser = await User.findOne({ clerkId: id });
    if (existingUser) {
      console.log(`User ${id} already exists`);
      return;
    }
    
    // Create new user with default role
    const newUser = new User({
      clerkId: id,
      email: email_addresses[0]?.email_address,
      firstName: first_name,
      lastName: last_name,
      imageUrl: image_url,
      role: 'user', // Default role
      isActive: true,
      createdAt: new Date()
    });
    
    await newUser.save();
    console.log(`User created: ${id} with role: user`);
    
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

// Handle user updates
async function handleUserUpdated(userData) {
  try {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = userData;
    
    const user = await User.findOne({ clerkId: id });
    if (!user) {
      console.log(`User ${id} not found for update`);
      return;
    }
    
    // Update user data
    user.email = email_addresses[0]?.email_address;
    user.firstName = first_name;
    user.lastName = last_name;
    user.imageUrl = image_url;
    
    // Update role from public metadata if provided
    if (public_metadata?.role) {
      user.role = public_metadata.role;
    }
    
    await user.save();
    console.log(`User updated: ${id}`);
    
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

// Handle user deletion
async function handleUserDeleted(userData) {
  try {
    const { id } = userData;
    
    await User.findOneAndDelete({ clerkId: id });
    console.log(`User deleted: ${id}`);
    
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

module.exports = router;
