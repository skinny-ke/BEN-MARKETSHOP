const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createOrder, getOrder } = require('../Controllers/orderController');

router.post('/', auth, createOrder);
router.get('/:id', auth, getOrder);

module.exports = router;
