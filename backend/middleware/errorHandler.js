// backend/middleware/errorHandler.js
module.exports = function(err, req, res, next) {
  console.error(`❌ [${req.method}] ${req.originalUrl} - ${err.message}`);
  
  const status = err.statusCode || err.status || 500;
  const isDev = process.env.NODE_ENV !== 'production';
  
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack, error: err })
  });
};
