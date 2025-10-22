const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../Controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.get('/health', (req, res) => res.json({ ok: true }));

module.exports = router;
