BEN-MARKET
==========

This archive contains a full MERN e-commerce project (frontend + backend).

How to run locally
------------------

1. Backend
   cd backend
   npm install
   # ensure .env contains your real secrets (already pre-filled from your shared values)
   npm run dev

2. Frontend
   cd frontend
   npm install
   npm run dev

Notes
-----
- The backend .env has the values you provided (MongoDB Atlas, Cloudinary, MPesa sandbox).
- For MPesa STK testing, run ngrok and set MPESA_CALLBACK_URL to your ngrok URL + /api/mpesa/callback
- If you want me to remove sensitive keys from the archive, tell me and I will regenerate the zip without them.
