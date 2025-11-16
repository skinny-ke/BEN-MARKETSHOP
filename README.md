# 🛒 BenMarket - E-commerce Platform

A modern, full-stack e-commerce platform built with React, Node.js, Express, and MongoDB. Features M-Pesa payment integration, responsive design, and admin dashboard.

## ✨ Features

### Frontend
- 🎨 Modern, responsive UI with Tailwind CSS & custom brand colors
- ⚡ Fast performance with React 18 and Vite
- 🎭 Smooth animations with Framer Motion
- 📱 Mobile-first design
- 🌓 Full light/dark mode support
- 🛒 Shopping cart with persistent storage
- 💳 M-Pesa payment integration
- 🔍 Product search and filtering
- 📊 Admin dashboard with real-time analytics
- 💬 Real-time chat system
- 📥 CSV import/export for products & orders

### Backend
- 🚀 Express.js REST API
- 🗄️ MongoDB with Mongoose ODM (100% MongoDB)
- 🔐 Clerk authentication (JWT-free)
- 💰 M-Pesa STK Push integration
- 📁 Cloudinary image upload
- 🛡️ Security middleware (Helmet, CORS, Rate Limiting)
- 📝 Request logging with Morgan & Winston
- 🧪 Comprehensive error handling
- 📊 Real-time analytics endpoints
- 📥 CSV import/export APIs

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BEN-MARKET
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` files in both `backend/` and `frontend/` directories:

   **Backend `.env`:**
   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # Database
   MONGO_URI=mongodb://localhost:27017/benmarket

   # Clerk Authentication (REQUIRED)
   CLERK_SECRET_KEY=sk_test_xxxxx
   CLERK_PUBLISHABLE_KEY=pk_test_xxxxx  # Required for @clerk/express middleware
   CLERK_WEBHOOK_SECRET=whsec_xxxxx

   # Frontend URL
   FRONTEND_URL=http://localhost:5173

   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # M-Pesa Configuration (optional)
   MPESA_CONSUMER_KEY=your_mpesa_consumer_key
   MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
   MPESA_SHORTCODE=174379
   MPESA_PASSKEY=your_mpesa_passkey
   MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback
   MPESA_ENVIRONMENT=sandbox
   ```

   **Frontend `.env`:**
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   ```

4. **Seed the database**
   
   **Basic seed (minimal data):**
   ```bash
   cd backend
   npm run seed
   ```
   
   **Enhanced seed (comprehensive test data - recommended for testing):**
   ```bash
   cd backend
   npm run seed:enhanced
   ```
   This will create:
   - 100+ products across 12 categories
   - 50-100 sample orders (if users exist)
   - Loyalty program setup
   - Award loyalty points for existing orders

5. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 📱 Usage

### For Customers
1. **Browse Products**: Visit the homepage to see all available products
2. **Search & Filter**: Use the search bar and category filters to find specific items
3. **View Details**: Click on any product to see detailed information
4. **Add to Cart**: Add items to your cart and adjust quantities
5. **Checkout**: Proceed to checkout and enter your delivery information
6. **Pay with M-Pesa**: Complete payment using M-Pesa STK Push

### For Admins
1. **Login**: Use admin credentials (admin@benmarket.local / AdminPass123!)
2. **Manage Products**: Add, edit, or delete products
3. **View Orders**: Monitor customer orders and payment status
4. **Analytics**: View sales data and insights

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh/refresh` - Refresh access token

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details

### M-Pesa
- `POST /api/mpesa/stkpush` - Initiate STK push
- `POST /api/mpesa/callback` - Handle payment callback

### Upload
- `POST /api/upload/image` - Upload image to Cloudinary
- `GET /api/upload/signed` - Get signed upload URL

## 🛠️ Development

### Project Structure
```
BEN-MARKET/
├── backend/
│   ├── Controllers/     # Route controllers
│   ├── Models/         # Database models
│   ├── Routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── config/         # Configuration files
│   ├── seed/          # Database seeders
│   └── tests/         # Test files
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── context/    # React context
│   │   ├── api/        # API services
│   │   └── assets/     # Static assets
│   └── public/         # Public assets
└── docs/              # Documentation
```

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with basic sample data
- `npm run seed:enhanced` - Seed database with comprehensive test data (100+ products, orders, loyalty points)

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Testing M-Pesa Integration

1. **Sandbox Testing**: Use the provided sandbox credentials
2. **Test Phone Numbers**: Use `254708374149` for testing
3. **Callback URL**: Use ngrok to expose your local server:
   ```bash
   ngrok http 5000
   ```
   Update `MPESA_CALLBACK_URL` in your `.env` file

## 🚀 Deployment

### Backend Deployment (Railway/Render/Heroku)
1. Connect your repository
2. Set environment variables
3. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

### Environment Variables for Production
Make sure to set all required environment variables in your production environment, especially:
- `MONGO_URI` - Production MongoDB connection string
- `MPESA_*` - Production M-Pesa credentials
- `CLOUDINARY_*` - Production Cloudinary credentials

## 🔒 Security Features

- CORS protection
- Rate limiting
- Helmet.js security headers
- Input validation and sanitization
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@benmarket.com or create an issue in the repository.

## ✅ Completed Features

- [x] Admin dashboard with real-time analytics
- [x] CSV import/export for products & orders
- [x] Real-time chat system
- [x] Order tracking
- [x] Product reviews and ratings
- [x] Wishlist functionality
- [x] Clerk authentication (JWT-free)
- [x] Full light/dark mode support
- [x] Professional brand color palette
- [x] Production-ready security

## 🎯 Future Roadmap

- [ ] Email notifications
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced analytics & reporting

---

**Built with ❤️ by the BenMarket Team**