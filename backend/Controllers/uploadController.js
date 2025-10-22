// backend/Controllers/uploadController.js
// NOTE: This controller uses `cloudinary` package. Install it locally:
// npm install cloudinary multer
const cloudinary = require('cloudinary').v2;

// configure from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Returns a signed cloudinary upload preset or upload URL (client-side direct upload)
exports.getSignedUploadUrl = async (req, res, next) => {
  try {
    // For many Cloudinary setups you can use unsigned upload presets.
    // Here we return basic cloud info; for production use a secure signed endpoint or server-side upload.
    res.json({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY
    });
  } catch (err) {
    next(err);
  }
};

// Server-side upload (accepts base64 or file path)
exports.uploadImage = async (req, res, next) => {
  try {
    // Expect: req.body.image -> base64 dataURL (optional) or temporary file path via multer
    const image = req.body.image;
    if (!image) return res.status(400).json({ message: 'No image provided' });

    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: process.env.CLOUDINARY_FOLDER || 'ben-market',
      resource_type: 'image'
    });

    res.json({ url: uploadResult.secure_url, id: uploadResult.public_id });
  } catch (err) {
    next(err);
  }
};
