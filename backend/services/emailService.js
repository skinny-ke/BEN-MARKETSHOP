const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Send order confirmation email
async function sendOrderConfirmation(order, user) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'BenMarket <noreply@benmarket.com>',
      to: [user.email],
      subject: `Order Confirmation - #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">BenMarket</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Order Confirmation</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Thank you for your order!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #374151; margin-bottom: 15px;">Order Details</h3>
              <p><strong>Order ID:</strong> #${order._id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> KSh ${order.totalAmount.toLocaleString()}</p>
              <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">${order.status}</span></p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #374151; margin-bottom: 15px;">Delivery Information</h3>
              <p><strong>Address:</strong> ${order.shippingAddress}</p>
              <p><strong>Phone:</strong> ${order.phoneNumber || 'Not provided'}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #374151; margin-bottom: 15px;">Order Items</h3>
              ${order.items.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                  <div>
                    <p style="margin: 0; font-weight: bold;">${item.product.name}</p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Qty: ${item.quantity}</p>
                  </div>
                  <p style="margin: 0; font-weight: bold;">KSh ${(item.product.price * item.quantity).toLocaleString()}</p>
                </div>
              `).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/track-order" 
                 style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Track Your Order
              </a>
            </div>
          </div>
          
          <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; opacity: 0.8;">© 2024 BenMarket. All rights reserved.</p>
            <p style="margin: 5px 0 0 0; opacity: 0.6; font-size: 14px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Email sending error:', error);
      return false;
    }

    console.log('Order confirmation email sent:', data);
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

// Send payment success notification
async function sendPaymentSuccess(order, user) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'BenMarket <noreply@benmarket.com>',
      to: [user.email],
      subject: `Payment Successful - Order #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">BenMarket</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Payment Successful</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: #10b981; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px;">
                ✓
              </div>
              <h2 style="color: #1f2937; margin: 20px 0 10px 0;">Payment Received!</h2>
              <p style="color: #6b7280; margin: 0;">Your payment has been successfully processed.</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #374151; margin-bottom: 15px;">Payment Details</h3>
              <p><strong>Order ID:</strong> #${order._id}</p>
              <p><strong>Amount Paid:</strong> KSh ${order.totalAmount.toLocaleString()}</p>
              <p><strong>Payment Method:</strong> M-Pesa</p>
              <p><strong>Payment Reference:</strong> ${order.paymentReference || 'N/A'}</p>
              <p><strong>Paid At:</strong> ${new Date(order.paidAt).toLocaleString()}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/track-order" 
                 style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Track Your Order
              </a>
            </div>
          </div>
          
          <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; opacity: 0.8;">© 2024 BenMarket. All rights reserved.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Payment success email error:', error);
      return false;
    }

    console.log('Payment success email sent:', data);
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

// Send welcome email to new users
async function sendWelcomeEmail(user) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'BenMarket <noreply@benmarket.com>',
      to: [user.email],
      subject: 'Welcome to BenMarket!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to BenMarket!</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Your account has been created successfully</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${user.firstName}!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Welcome to BenMarket! We're excited to have you as part of our community. 
              You can now browse our products, add items to your cart, and enjoy a seamless shopping experience.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #374151; margin-bottom: 15px;">What you can do:</h3>
              <ul style="color: #6b7280; line-height: 1.8;">
                <li>Browse our wide selection of products</li>
                <li>Add items to your wishlist</li>
                <li>Track your orders in real-time</li>
                <li>Pay securely with M-Pesa</li>
                <li>Manage your profile and preferences</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}" 
                 style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Start Shopping
              </a>
            </div>
          </div>
          
          <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; opacity: 0.8;">© 2024 BenMarket. All rights reserved.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Welcome email error:', error);
      return false;
    }

    console.log('Welcome email sent:', data);
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

module.exports = {
  sendOrderConfirmation,
  sendPaymentSuccess,
  sendWelcomeEmail
};
