// backend/Routes/upload.js
const express = require('express');
const router = express.Router();
const { getSignedUploadUrl, uploadImage } = require('../Controllers/uploadController');
const { clerkAuth, requireAdmin } = require('../middleware/clerkAuth');
const { requireAuth } = require('@clerk/express');
const { body } = require('express-validator');

// Returns Cloudinary signed upload data if you prefer direct client uploads
router.get('/signed', clerkAuth, requireAuth, getSignedUploadUrl);

// Server-side upload endpoint (accepts base64 or multipart form)
router.post(
  '/image',
  clerkAuth,
  requireAuth,
  [body('image').isString().isLength({ min: 10 })],
  uploadImage
);

module.exports = router;
