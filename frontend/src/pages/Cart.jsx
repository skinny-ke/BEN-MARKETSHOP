import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaTrash, FaMinus, FaPlus, FaShoppingBag, FaHeart, FaHeartBroken } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import toast from "react-hot-toast";

export default function Cart() {
  const { cart, removeFromCart, updateCartItem, clearCart } = useShop();
  const [wishlist, setWishlist] = useState([]);

  // Scroll to top on cart load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Load wishlist from localStorage
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlist(savedWishlist);
  }, []);

  const toggleWishlist = (product) => {
    const exists = wishlist.find((item) => item._id === product._id);
    let updatedWishlist;
    if (exists) {
      updatedWishlist = wishlist.filter((item) => item._id !== product._id);
      toast.success("Removed from wishlist");
    } else {
      updatedWishlist = [...wishlist, product];
      toast.success("Added to wishlist");
    }
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  const total = cart.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
  const itemCount = cart.reduce((s, i) => s + (i.qty || 1), 0);

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared successfully");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="bg-green-600 text-white p-6">
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-green-100">
              {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {cart.map((item, index) => {
                const isWishlisted = wishlist.find((w) => w._id === item._id);

                return (
                  <motion.div
                    key={item._id}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg transition-shadow"
                  >
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {item.name}
                      </h3>
                      {item.category && (
                        <span className="text-sm text-gray-500">{item.category}</span>
                      )}
                      <div className="text-xl font-bold text-green-600 mt-1">
                        KSh {item.price?.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            updateCartItem(item._id, (item.qty || 1) - 1)
                          }
                          className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={(item.qty || 1) <= 1}
                        >
                          <FaMinus className="text-sm" />
                        </button>
                        <span className="px-4 py-2 font-semibold">{item.qty || 1}</span>
                        <button
                          onClick={() =>
                            updateCartItem(item._id, (item.qty || 1) + 1)
                          }
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <FaPlus className="text-sm" />
                        </button>
                      </div>

                      <div className="text-right min-w-[100px]">
                        <motion.div
                          key={item._id + (item.qty || 1)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-lg font-bold text-gray-800"
                        >
                          KSh {((item.price || 0) * (item.qty || 1)).toLocaleString()}
                        </motion.div>
                      </div>

                      <button
                        onClick={() => toggleWishlist(item)}
                        className={`p-2 rounded-lg transition-colors ${
                          isWishlisted
                            ? "text-red-500 hover:bg-red-50"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        {isWishlisted ? <FaHeart /> : <FaHeartBroken />}
                      </button>

                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={handleClearCart}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Clear Cart
                </button>
                <div className="text-right">
                  <motion.div
                    key={total}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl font-bold text-gray-800"
                  >
                    Total: KSh {total.toLocaleString()}
                  </motion.div>
                  <div className="text-sm text-gray-500">
                    {itemCount} item{itemCount !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  to="/"
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg text-center hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </Link>
                <Link
                  to="/checkout"
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg text-center hover:bg-green-700 transition-colors font-semibold"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
