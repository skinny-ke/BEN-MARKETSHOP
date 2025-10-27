# ✅ Complete Clerk Integration Guide

## 🎯 What Was Implemented

### Backend Implementation

#### 1. **User Model Updated** (`backend/Models/User.js`)
- Added `orgId` field for Clerk organizations support
- Maintains user schema with all required fields:
  ```javascript
  {
    clerkId: String (required, unique),
    name: String (required),
    email: String (required, unique),
    role: 'user' | 'admin' (default: 'user'),
    orgId: String (optional, for organizations),
    isActive: Boolean (default: true),
    profileImage: String,
    lastLogin: Date
  }
  ```

#### 2. **Clerk Authentication Middleware** (`backend/middleware/clerkAuth.js`)
- ✅ Uses `@clerk/backend` SDK for proper token verification
- ✅ Automatically creates users in MongoDB on first login
- ✅ Updates user data from Clerk
- ✅ Extracts organization ID from token
- ✅ Provides `clerkAuth` for authentication
- ✅ Provides `requireAdmin` for admin-only routes
- ✅ Provides `requireAuth` for any authenticated user

#### 3. **Admin Routes** (`backend/Routes/admin.js`)
Endpoints:
- `GET /api/admin/dashboard` - Dashboard stats (admin only)
- `GET /api/admin/users` - List all users (admin only)
- `PUT /api/admin/users/:userId/role` - Update user role (admin only)
- `PUT /api/admin/users/:userId/deactivate` - Deactivate user (admin only)
- `GET /api/admin/orders` - Get all orders (admin only)

#### 4. **User Routes** (`backend/Routes/user.js`)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update current user profile
- `GET /api/users/:userId` - Get user by ID (self or admin)

#### 5. **Clerk Webhook** (`backend/Routes/clerkWebhook.js`)
Handles events:
- `user.created` - Create new user
- `user.updated` - Update existing user
- `user.deleted` - Deactivate user
- `organizationMembership.created` - Add orgId
- `organizationMembership.deleted` - Remove orgId

#### 6. **Socket.io Authentication** (`backend/server.js`)
- Added socket authentication middleware
- Verifies Clerk tokens for socket connections
- Tracks user ID per socket connection

### Frontend Implementation

#### 1. **Clerk Context Enhanced** (`frontend/src/context/ClerkContext.jsx`)
- Fetches user data from backend
- Tracks organization membership
- Provides role and admin status
- Includes orgId for organizations
- Auto-updates user data on login

#### 2. **Admin Hooks** (`frontend/src/hooks/useAdmin.js`)
- `useAdmin()` - Check if user is admin
- `useCurrentUser()` - Get current user and role
- `withAdminProtection()` - HOC for admin-only pages

#### 3. **Organization Support** (`frontend/src/App.jsx`)
- Added `` wrapper
- Supports multi-organization workflows

## 🔐 Authentication Flow

### 1. User Login
1. User signs in via Clerk
2. Frontend gets Clerk JWT token
3. Token sent to backend with every API request
4. Backend verifies token using Clerk SDK
5. Backend auto-creates/updates user in MongoDB
6. User data returned to frontend

### 2. Admin Access
1. Admin routes protected with `requireAdmin` middleware
2. Only users with `role: 'admin'` can access
3. Frontend checks role before showing admin UI
4. Automatic redirect if unauthorized

### 3. Organization Support
1. If user belongs to organization, `orgId` is tracked
2. Multi-tenant support for organizations
3. Users can switch between organizations
4. Admin features work per organization

## 📝 Environment Variables Required

### Backend (`.env` in `backend/`)
```env
# Clerk Configuration
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx

# MongoDB
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/benmarket

# JWT (optional, legacy)
JWT_SECRET=your_jwt_secret

# Server
PORT=5000
NODE_ENV=development
```

### Frontend (`.env` in `frontend/`)
```env
VITE_API_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install @clerk/backend @clerk/clerk-sdk-node
```

### 2. Create Environment Files
```bash
# Backend
cd backend
echo "CLERK_SECRET_KEY=sk_test_your_key" >> .env
echo "MONGO_URI=your_mongodb_uri" >> .env

# Frontend
cd frontend
echo "VITE_API_URL=http://localhost:5000" >> .env
echo "VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key" >> .env
```

### 3. Setup Clerk Webhook
1. Go to Clerk Dashboard → Webhooks
2. Add webhook: `https://your-backend-url.com/api/clerk/webhook`
3. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
   - `organizationMembership.created`
   - `organizationMembership.deleted`
4. Copy webhook signing secret (optional, for verification)

### 4. Start Services
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

## 📖 Usage Examples

### Backend: Protect Admin Route
```javascript
const { clerkAuth, requireAdmin } = require('../middleware/clerkAuth');

router.get('/admin/dashboard', 
  clerkAuth,      // Require authentication
  requireAdmin,   // Require admin role
  async (req, res) => {
    // Only admins can access this
    res.json({ data: 'Admin data' });
  }
);
```

### Frontend: Check Admin Status
```javascript
import { useClerkContext } from './context/ClerkContext';
import { useAdmin } from './hooks/useAdmin';

function MyComponent() {
  const { isAdmin, userRole } = useClerkContext();
  const { isAdmin: adminStatus } = useAdmin();
  
  if (!isAdmin) {
    return <div>Access Denied</div>;
  }
  
  return <AdminDashboard />;
}
```

### Frontend: Get Current User
```javascript
import { useCurrentUser } from './hooks/useAdmin';

function Profile() {
  const { user, role, isAdmin, orgId } = useCurrentUser();
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Role: {role}</p>
      {orgId && <p>Organization: {orgId}</p>}
    </div>
  );
}
```

### Frontend: Protect Admin Page
```javascript
import { withAdminProtection } from './hooks/useAdmin';

function AdminDashboard() {
  return <div>Admin Content</div>;
}

// Export with admin protection
export default withAdminProtection(AdminDashboard);
```

## 🔧 API Endpoints

### Admin Endpoints (Require Admin Role)
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:userId/role` - Update user role
- `PUT /api/admin/users/:userId/deactivate` - Deactivate user
- `GET /api/admin/orders` - Get all orders

### User Endpoints (Authenticated)
- `GET /api/users/profile` - Get current user
- `PUT /api/users/profile` - Update current user
- `GET /api/users/:userId` - Get user by ID

### Chat Endpoints (Authenticated)
- `GET /api/chats` - Get user's chats
- `GET /api/chats/:userId` - Get or create chat
- `GET /api/chats/messages/:chatId` - Get messages
- `POST /api/chats/messages` - Send message

## ✅ Features Working

- ✅ User authentication with Clerk
- ✅ Automatic user creation/update in MongoDB
- ✅ Role-based access control (user/admin)
- ✅ Organization support
- ✅ Admin dashboard
- ✅ Protected admin routes
- ✅ Socket.io authentication
- ✅ Chat functionality with real-time
- ✅ Token verification on every request
- ✅ Webhook integration for user sync

## 🎉 Your app now has:
1. ✅ Clerk SDK authentication
2. ✅ MongoDB user sync
3. ✅ Admin authorization
4. ✅ Role-based access
5. ✅ Organization support
6. ✅ Protected routes
7. ✅ Chat functionality

