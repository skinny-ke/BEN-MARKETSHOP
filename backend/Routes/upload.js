// backend/Routes/upload.js
const express = require('express');
const router = express.Router();
const { getSignedUploadUrl, uploadImage } = require('../Controllers/uploadController');
const auth = require('../middleware/auth');

// Returns Cloudinary signed upload data if you prefer direct client uploads
router.get('/signed', auth, getSignedUploadUrl);

// Server-side upload endpoint (accepts base64 or multipart form)
router.post('/image', auth, uploadImage);

module.exports = router;
