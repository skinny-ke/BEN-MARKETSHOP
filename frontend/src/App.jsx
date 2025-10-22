import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
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

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/track-order" element={<OrderTracking />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
