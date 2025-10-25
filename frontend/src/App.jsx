import { Routes, Route } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { SocketProvider } from "./context/SocketContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatButton from "./components/ChatButton";
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

// Get the Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder";

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <SocketProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
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
            <ChatButton currentUserId="user123" />
          </SignedIn>
        </div>
      </SocketProvider>
    </ClerkProvider>
  );
}

export default App;
