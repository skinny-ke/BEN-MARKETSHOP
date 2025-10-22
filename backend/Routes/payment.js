// backend/Routes/payment.js
const express = require('express');
const router = express.Router();
const { updateOrderStatus } = require('../Controllers/paymentController');
router.post('/order/status', updateOrderStatus);
module.exports = router;
