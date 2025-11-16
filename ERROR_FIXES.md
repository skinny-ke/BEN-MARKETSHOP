# 🔧 Error Fixes & Troubleshooting Guide

## ✅ **FIXED ISSUES**

### 1. **Clerk Publishable Key Missing (500 Errors)**
**Error**: `Publishable key is missing. Ensure that your publi…s://dashboard.clerk.com/last-active?path=api-keys`

**Root Cause**: The `@clerk/express` `requireAuth` middleware requires both `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` to be set.

**Fix Applied**:
- ✅ Updated `backend/middleware/clerkAuth.js` to include `publishableKey` in `requireAuth` configuration
- ✅ Added better error logging for missing publishable key
- ✅ Updated `docker-compose.yml` to include `CLERK_PUBLISHABLE_KEY` environment variable
- ✅ Updated `README.md` to document the required `CLERK_PUBLISHABLE_KEY`

**Action Required**:
1. Add `CLERK_PUBLISHABLE_KEY` to your backend `.env` file:
   ```env
   CLERK_PUBLISHABLE_KEY=pk_test_xxxxx  # Get from Clerk Dashboard
   ```

2. If deploying to Render/Railway/Vercel, add the environment variable in your deployment platform's settings.

3. Restart your backend server after adding the environment variable.

---

### 2. **404 Errors on API Routes**

**Errors**:
- `/loyalty` → Should be `/api/loyalty`
- `/inventory/dashboard` → Should be `/api/inventory/dashboard`

**Fix Applied**:
- ✅ Updated `frontend/src/components/LoyaltyDashboard.jsx`:
  - Changed `/loyalty` → `/api/loyalty`
  - Changed `/loyalty/redeem` → `/api/loyalty/redeem`
- ✅ Updated `frontend/src/components/InventoryDashboard.jsx`:
  - Changed `/inventory/dashboard` → `/api/inventory/dashboard`
  - Changed `/inventory/stock` → `/api/inventory/stock`
  - Changed `/inventory/alerts/:id/acknowledge` → `/api/inventory/alerts/:id/acknowledge`

---

## 🚨 **REMAINING ISSUES TO CHECK**

### 1. **Environment Variables on Render**
If you're deploying to Render, ensure all these environment variables are set:

**Required**:
- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY` ⚠️ **CRITICAL - This was missing!**
- `CLERK_WEBHOOK_SECRET`
- `MONGO_URI` or `MONGODB_URI`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

**Optional**:
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_CALLBACK_URL`
- `MPESA_ENVIRONMENT`

### 2. **How to Get Clerk Keys**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys** section
4. Copy:
   - **Secret Key** → `CLERK_SECRET_KEY` (starts with `sk_test_` or `sk_live_`)
   - **Publishable Key** → `CLERK_PUBLISHABLE_KEY` (starts with `pk_test_` or `pk_live_`)
   - **Webhook Secret** → `CLERK_WEBHOOK_SECRET` (starts with `whsec_`)

### 3. **Verify Environment Variables**

**On Render**:
1. Go to your service dashboard
2. Click on **Environment** tab
3. Verify all required variables are set
4. Restart the service after adding new variables

**Local Development**:
```bash
# Check if variables are loaded
cd backend
node -e "require('dotenv').config(); console.log('CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'Set' : 'Missing'); console.log('CLERK_PUBLISHABLE_KEY:', process.env.CLERK_PUBLISHABLE_KEY ? 'Set' : 'Missing');"
```

---

## 🔍 **DEBUGGING STEPS**

### 1. **Check Backend Logs**
Look for these error messages:
- `⚠️ Clerk publishable key missing` → Add `CLERK_PUBLISHABLE_KEY`
- `❌ Clerk auth error` → Check token validity
- `MongoDB connection failed` → Check `MONGO_URI`

### 2. **Test API Endpoints**

```bash
# Test health endpoint (should work without auth)
curl https://ben-market-shop.onrender.com/health

# Test protected endpoint (should return 401 without token)
curl https://ben-market-shop.onrender.com/api/products
```

### 3. **Check Frontend API Configuration**

Verify `frontend/src/api/axios.js` has the correct base URL:
```javascript
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
```

---

## 📝 **QUICK FIX CHECKLIST**

- [ ] Add `CLERK_PUBLISHABLE_KEY` to backend `.env` file
- [ ] Add `CLERK_PUBLISHABLE_KEY` to Render environment variables
- [ ] Restart backend server
- [ ] Verify all API routes use `/api/` prefix
- [ ] Check browser console for remaining errors
- [ ] Test authentication flow
- [ ] Test admin dashboard
- [ ] Test chat system
- [ ] Test product creation

---

## 🎯 **EXPECTED BEHAVIOR AFTER FIXES**

✅ All API endpoints should return proper responses (not 500 errors)
✅ Authentication should work correctly
✅ Admin dashboard should load without errors
✅ Chat system should function properly
✅ Product creation should work
✅ Loyalty and inventory dashboards should load

---

## 📞 **STILL HAVING ISSUES?**

If errors persist after applying these fixes:

1. **Check Backend Logs**: Look for specific error messages
2. **Verify Environment Variables**: Ensure all are set correctly
3. **Test Locally**: Run the app locally to isolate deployment issues
4. **Check Clerk Dashboard**: Verify your Clerk application is active
5. **Check MongoDB**: Ensure database connection is working

---

**Last Updated**: After fixing Clerk publishable key and API route issues

