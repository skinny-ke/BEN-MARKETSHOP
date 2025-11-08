import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useAuth,
} from "@clerk/clerk-react";
import { SocketProvider } from "./context/SocketContext";
import { ClerkProvider as CustomClerkProvider } from "./context/ClerkContext";
import { ThemeProvider } from "./context/ThemeContext";
import { setClerkTokenGetter } from "./api/axios";

import Navbar from "./components/Navbar";
import MobileNav from "./components/MobileNav";
import Footer from "./components/Footer";
import ChatButton from "./components/ChatButton";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import Toaster from "./components/Toaster";

import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Wishlist from "./pages/Wishlist";
import OrderTracking from "./pages/OrderTracking";
import OrderReceipt from "./pages/OrderReceipt";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import Profile from "./pages/Profile";
import { initAnalytics } from "./services/analytics";

// ✅ Clerk Publishable Key (from .env)
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error(
    "Missing Clerk Publishable Key! Set VITE_CLERK_PUBLISHABLE_KEY in .env"
  );
}

// ✅ Setup for Clerk token + analytics
const TokenSetup = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    setClerkTokenGetter(getToken);
    initAnalytics();
  }, [getToken]);

  return null;
};

function App() {
  return (
    <ThemeProvider>
      <ClerkProvider publishableKey={clerkPubKey}>
        <CustomClerkProvider>
          <TokenSetup />

          <SocketProvider>
            <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
            <Navbar />
            <MobileNav />

            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />

                <Route
                  path="/checkout"
                  element={
                    <SignedIn>
                      <Checkout />
                    </SignedIn>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <SignedIn>
                      <Admin />
                    </SignedIn>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <SignedIn>
                      <Wishlist />
                    </SignedIn>
                  }
                />
                <Route
                  path="/track-order"
                  element={
                    <SignedIn>
                      <OrderTracking />
                    </SignedIn>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <SignedIn>
                      <AnalyticsDashboard />
                    </SignedIn>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <SignedIn>
                      <Profile />
                    </SignedIn>
                  }
                />

                <Route
                  path="/orders/:id/receipt"
                  element={
                    <SignedIn>
                      <OrderReceipt />
                    </SignedIn>
                  }
                />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                  path="*"
                  element={
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  }
                />
              </Routes>
            </main>

            <Footer />

            <ChatButton />
            <PWAInstallPrompt />
            <Toaster />
          </div>
        </SocketProvider>
      </CustomClerkProvider>
    </ClerkProvider>
    </ThemeProvider>
  );
}

export default App;
