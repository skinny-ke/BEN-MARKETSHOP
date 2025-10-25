import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useAuth } from "@clerk/clerk-react";
import { SocketProvider } from "./context/SocketContext";
import { ClerkProvider as CustomClerkProvider } from "./context/ClerkContext";
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
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import Profile from "./pages/Profile";
import { initAnalytics } from "./services/analytics";

// Get the Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder";

// Component to set up token getter and analytics
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
    <ClerkProvider publishableKey={clerkPubKey}>
      <CustomClerkProvider>
        <TokenSetup />
        <SocketProvider>
          <div className="flex flex-col min-h-screen">
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
                    <>
                      <SignedIn>
                        <Checkout />
                      </SignedIn>
                      <SignedOut>
                        <RedirectToSignIn />
                      </SignedOut>
                    </>
                  } 
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/admin" 
                  element={
                    <>
                      <SignedIn>
                        <Admin />
                      </SignedIn>
                      <SignedOut>
                        <RedirectToSignIn />
                      </SignedOut>
                    </>
                  } 
                />
                <Route 
                  path="/wishlist" 
                  element={
                    <>
                      <SignedIn>
                        <Wishlist />
                      </SignedIn>
                      <SignedOut>
                        <RedirectToSignIn />
                      </SignedOut>
                    </>
                  } 
                />
                <Route 
                  path="/track-order" 
                  element={
                    <>
                      <SignedIn>
                        <OrderTracking />
                      </SignedIn>
                      <SignedOut>
                        <RedirectToSignIn />
                      </SignedOut>
                    </>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <>
                      <SignedIn>
                        <AnalyticsDashboard />
                      </SignedIn>
                      <SignedOut>
                        <RedirectToSignIn />
                      </SignedOut>
                    </>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <>
                      <SignedIn>
                        <Profile />
                      </SignedIn>
                      <SignedOut>
                        <RedirectToSignIn />
                      </SignedOut>
                    </>
                  } 
                />
              </Routes>
            </main>
            <Footer />
            
            {/* Chat Button for all pages */}
            <SignedIn>
              <ChatButton />
            </SignedIn>
            
            {/* PWA Install Prompt */}
            <PWAInstallPrompt />
            
            {/* Toast Notifications */}
            <Toaster />
          </div>
        </SocketProvider>
      </CustomClerkProvider>
    </ClerkProvider>
  );
}

export default App;
