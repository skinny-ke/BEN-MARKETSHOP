# BEN-MARKET Frontend-Backend Connection Guide

## 🎯 Overview
This guide explains how the frontend and backend are connected in the BEN-MARKET application.

## 🔧 Configuration Changes Made

### Backend Configuration
1. **Fixed Database Connection**: Created `backend/db.js` with proper MongoDB connection
2. **Updated Server**: Fixed import path in `server.js` to use the correct database file
3. **Environment Variables**: Backend uses environment variables for configuration

### Frontend Configuration
1. **Vite Proxy**: Added proxy configuration in `vite.config.js` for development
2. **API Configuration**: Frontend uses `VITE_API_URL` environment variable
3. **Axios Setup**: Properly configured with interceptors for authentication

### Docker Configuration
1. **Service Communication**: Updated Docker Compose for proper inter-service communication
2. **Environment Variables**: Configured for both development and production

## 🚀 How to Run

### Option 1: Quick Start (Recommended)
```bash
# Make the script executable and run
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Manual Start

#### Start Backend
```bash
cd backend
npm install  # if first time
npm run dev
```

#### Start Frontend (in another terminal)
```bash
cd frontend
npm install  # if first time
npm run dev
```

### Option 3: Docker (Production-like)
```bash
docker-compose up --build
```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Backend Health**: http://localhost:5000/health
- **API Documentation**: http://localhost:5000/api/products

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (protected)
- `PUT /api/products/:id` - Update product (protected)
- `DELETE /api/products/:id` - Delete product (protected)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order

### M-Pesa
- `POST /api/mpesa/stkpush` - M-Pesa payment

## 🧪 Testing Connection

Run the connection test:
```bash
node test-connection.js
```

## 🔧 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb://admin:password123@localhost:27017/benmarket?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Ben Market
VITE_APP_VERSION=1.0.0
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check if MongoDB is running
   - Verify environment variables
   - Check port 5000 is available

2. **Frontend can't connect to backend**
   - Ensure backend is running on port 5000
   - Check CORS configuration
   - Verify VITE_API_URL is correct

3. **Database connection issues**
   - Check MongoDB is running
   - Verify MONGO_URI is correct
   - Check database credentials

### Debug Commands
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :5000

# Check MongoDB status
sudo systemctl status mongod

# Test API endpoints
curl http://localhost:5000/health
curl http://localhost:5000/api/products
```

## 📁 File Structure
```
BEN-MARKET/
├── backend/
│   ├── db.js                 # Database connection
│   ├── server.js            # Main server file
│   ├── app.js               # Express app for testing
│   └── Routes/              # API routes
├── frontend/
│   ├── vite.config.js       # Vite configuration with proxy
│   └── src/api/             # API service files
├── docker-compose.yml       # Docker configuration
├── start-dev.sh            # Development startup script
└── test-connection.js      # Connection test script
```

## ✅ Connection Status
- ✅ Backend API endpoints configured
- ✅ Frontend API services configured
- ✅ Database connection established
- ✅ CORS configured for development
- ✅ Docker configuration updated
- ✅ Development scripts created
- ✅ Environment variables configured

The frontend and backend are now properly connected and ready for development!
