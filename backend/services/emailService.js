const { Resend } = require('resend');
const winston = require('winston');

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}] ${message}`
    )
  ),
  transports: [new winston.transports.Console()],
});

class EmailService {
  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(userEmail, userName) {
    try {
      const data = await resend.emails.send({
        from: 'BenMarket <welcome@benmarket.com>',
        to: [userEmail],
        subject: 'Welcome to BenMarket! 🎉',
        html: this.getWelcomeEmailTemplate(userName),
      });

      logger.info(`Welcome email sent to ${userEmail}: ${data.id}`);
      return { success: true, id: data.id };
    } catch (error) {
      logger.error(`Failed to send welcome email to ${userEmail}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(order, userEmail, userName) {
    try {
      const data = await resend.emails.send({
        from: 'BenMarket <orders@benmarket.com>',
        to: [userEmail],
        subject: `Order Confirmation - #${order._id}`,
        html: this.getOrderConfirmationTemplate(order, userName),
      });

      logger.info(`Order confirmation email sent to ${userEmail}: ${data.id}`);
      return { success: true, id: data.id };
    } catch (error) {
      logger.error(`Failed to send order confirmation to ${userEmail}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(order, userEmail, userName) {
    try {
      const data = await resend.emails.send({
        from: 'BenMarket <orders@benmarket.com>',
        to: [userEmail],
        subject: `Order Update - #${order._id}`,
        html: this.getOrderStatusTemplate(order, userName),
      });

      logger.info(`Order status update email sent to ${userEmail}: ${data.id}`);
      return { success: true, id: data.id };
    } catch (error) {
      logger.error(`Failed to send order status update to ${userEmail}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send abandoned cart reminder
   */
  async sendAbandonedCartReminder(userEmail, userName, cartItems) {
    try {
      const data = await resend.emails.send({
        from: 'BenMarket <cart@benmarket.com>',
        to: [userEmail],
        subject: 'Your cart is waiting! 🛒',
        html: this.getAbandonedCartTemplate(userName, cartItems),
      });

      logger.info(`Abandoned cart email sent to ${userEmail}: ${data.id}`);
      return { success: true, id: data.id };
    } catch (error) {
      logger.error(`Failed to send abandoned cart email to ${userEmail}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send promotional newsletter
   */
  async sendNewsletter(userEmail, userName, content) {
    try {
      const data = await resend.emails.send({
        from: 'BenMarket <newsletter@benmarket.com>',
        to: [userEmail],
        subject: content.subject,
        html: this.getNewsletterTemplate(userName, content),
      });

      logger.info(`Newsletter sent to ${userEmail}: ${data.id}`);
      return { success: true, id: data.id };
    } catch (error) {
      logger.error(`Failed to send newsletter to ${userEmail}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(userEmail, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const data = await resend.emails.send({
        from: 'BenMarket <security@benmarket.com>',
        to: [userEmail],
        subject: 'Reset Your Password',
        html: this.getPasswordResetTemplate(resetUrl),
      });

      logger.info(`Password reset email sent to ${userEmail}: ${data.id}`);
      return { success: true, id: data.id };
    } catch (error) {
      logger.error(`Failed to send password reset email to ${userEmail}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Email Templates
  getWelcomeEmailTemplate(userName) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to BenMarket</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22c55e;">Welcome to BenMarket! 🎉</h1>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2>Hello ${userName}!</h2>
              <p>Thank you for joining BenMarket. We're excited to have you as part of our community!</p>
            </div>

            <div style="margin-bottom: 30px;">
              <h3>What you can do now:</h3>
              <ul>
                <li>🛒 Browse thousands of products</li>
                <li>💳 Secure payments with M-Pesa</li>
                <li>⭐ Leave reviews and ratings</li>
                <li>❤️ Save items to your wishlist</li>
                <li>📦 Track your orders in real-time</li>
              </ul>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.FRONTEND_URL}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Start Shopping</a>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>BenMarket - Your one-stop shop for quality products</p>
              <p>If you have any questions, reply to this email or contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getOrderConfirmationTemplate(order, userName) {
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <img src="${item.product?.image || '/placeholder.png'}" alt="${item.product?.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">KSh ${item.price.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">KSh ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22c55e;">Order Confirmed! ✅</h1>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2>Hello ${userName}!</h2>
              <p>Thank you for your order. We're preparing your items and will notify you when they ship.</p>
              <p><strong>Order ID:</strong> #${order._id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>

            <div style="margin-bottom: 30px;">
              <h3>Order Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Image</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Qty</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Price</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                    <td style="padding: 10px; font-weight: bold;">KSh ${order.totalAmount.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.FRONTEND_URL}/track-order?id=${order._id}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Track Your Order</a>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>BenMarket - Your one-stop shop for quality products</p>
              <p>Questions about your order? Reply to this email or contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getOrderStatusTemplate(order, userName) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Status Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22c55e;">Order Status Update 📦</h1>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2>Hello ${userName}!</h2>
              <p>Your order status has been updated.</p>
              <p><strong>Order ID:</strong> #${order._id}</p>
              <p><strong>Current Status:</strong> ${order.status.replace('_', ' ').toUpperCase()}</p>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.FRONTEND_URL}/track-order?id=${order._id}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Order Details</a>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>BenMarket - Your one-stop shop for quality products</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getAbandonedCartTemplate(userName, cartItems) {
    const itemsHtml = cartItems.slice(0, 3).map(item => `
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <img src="${item.image || '/placeholder.png'}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 10px;">
        <div>
          <p style="margin: 0; font-weight: bold;">${item.name}</p>
          <p style="margin: 0; color: #666;">KSh ${item.price.toLocaleString()}</p>
        </div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Your Cart is Waiting</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22c55e;">Your Cart is Waiting! 🛒</h1>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2>Hello ${userName}!</h2>
              <p>You left some items in your cart. Don't miss out on these great products!</p>
            </div>

            <div style="margin-bottom: 30px;">
              <h3>Items in your cart:</h3>
              ${itemsHtml}
              ${cartItems.length > 3 ? `<p>...and ${cartItems.length - 3} more items</p>` : ''}
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.FRONTEND_URL}/cart" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Complete Your Purchase</a>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>BenMarket - Your one-stop shop for quality products</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getNewsletterTemplate(userName, content) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${content.subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22c55e;">${content.subject}</h1>
            </div>

            <div style="margin-bottom: 30px;">
              <p>Hello ${userName}!</p>
              ${content.body}
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.FRONTEND_URL}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Shop Now</a>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>BenMarket - Your one-stop shop for quality products</p>
              <p><a href="${process.env.FRONTEND_URL}/unsubscribe">Unsubscribe</a></p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getPasswordResetTemplate(resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22c55e;">Reset Your Password 🔒</h1>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p>You requested a password reset for your BenMarket account.</p>
              <p>Click the button below to reset your password:</p>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${resetUrl}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
              <p style="margin: 0; color: #856404;"><strong>Security Note:</strong> This link will expire in 1 hour. If you didn't request this reset, please ignore this email.</p>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>BenMarket - Your one-stop shop for quality products</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
