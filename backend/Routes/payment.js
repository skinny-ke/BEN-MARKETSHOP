// backend/Routes/payment.js
const express = require('express');
const router = express.Router();
const { updateOrderStatus } = require('../Controllers/paymentController');
const { clerkAuth, requireAdmin } = require('../middleware/clerkAuth');
// Admin-only manual status updates
router.post('/order/status', clerkAuth, requireAdmin, updateOrderStatus);
module.exports = router;
