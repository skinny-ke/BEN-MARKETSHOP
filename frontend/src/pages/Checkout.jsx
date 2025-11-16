import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { 
  FaCreditCard, FaPhone, FaMapMarkerAlt, FaSpinner, 
  FaHeart, FaHeartBroken 
} from "react-icons/fa";
import { useUser } from "@clerk/clerk-react";
import { useShop } from "../context/ShopContext";
import { orderService, mpesaService } from "../api/services";
import toast from "react-hot-toast";

export default function Checkout() {
  const { cart, clearCart } = useShop();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'processing', 'success'

  // Wishlist logic
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wishlist') || '[]');
    } catch { return []; }
  });

  const toggleWishlist = (product) => {
    const exist = wishlist.find(i => i._id === product._id);
    let updated;
    if (exist) {
      updated = wishlist.filter(i => i._id !== product._id);
      toast.success('Removed from wishlist');
    } else {
      updated = [...wishlist, product];
      toast.success('Added to wishlist');
    }
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      phone: user?.phoneNumbers[0]?.phoneNumber || '',
      address: '',
      city: '',
      notes: ''
    }
  });

  const phone = watch('phone');

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Your cart is empty</h2>
          <p className="text-gray-500">Add some items to your cart before checkout.</p>
        </motion.div>
      </div>
    );
  }

  const subtotal = cart.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
  const VAT_RATE = 0.16;
  const vatAmount = subtotal * VAT_RATE;
  const total = subtotal + vatAmount;
  const itemCount = cart.reduce((s, i) => s + (i.qty || 1), 0);

  const onSubmit = async (data) => {
    if (!user) {
      toast.error('Please login to continue');
      return;
    }

    try {
      setLoading(true);
      setPaymentStep('processing');

      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.qty || 1
        })),
        totalAmount: total,
        shippingAddress: {
          fullName: user.fullName || user.firstName + ' ' + user.lastName,
          phone: data.phone,
          street: data.address,
          city: data.city,
          county: '',
          postalCode: '',
          country: 'Kenya'
        },
        paymentMethod: data.paymentMethod || 'mpesa'
      };

      const orderResponse = await orderService.createOrder(orderData);
      const order = orderResponse.data.order || orderResponse.data;

      // Only initiate M-Pesa payment if selected
      if (data.paymentMethod === 'mpesa') {
        await mpesaService.stkPush({
          amount: total,
          phone: data.phone,
          account: order._id
        });
        setPaymentStep('success');
        clearCart();
        toast.success('Payment initiated! Check your phone for M-Pesa prompt.');
      } else {
        // Cash on delivery
        setPaymentStep('success');
        clearCart();
        toast.success('Order placed successfully! Pay cash on delivery.');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Order failed. Please try again.');
      setPaymentStep('form');
    } finally {
      setLoading(false);
    }
  };

  if (paymentStep === 'processing') {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white dark:bg-surface-dark p-8 rounded-xl shadow-lg border border-border-light dark:border-border-dark"
        >
          <FaSpinner className="text-4xl text-green animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we process your M-Pesa payment...</p>
        </motion.div>
      </div>
    );
  }

  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white dark:bg-surface-dark p-8 rounded-xl shadow-lg border border-border-light dark:border-border-dark"
        >
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Initiated!</h2>
          <p className="text-gray-600 mb-6">Check your phone for M-Pesa prompt to complete payment.</p>
          <a 
            href="/"
            className="bg-green text-white px-6 py-3 rounded-lg hover:bg-green-light transition-colors focus:outline-none focus:ring-2 focus:ring-green focus:ring-offset-2"
          >
            Continue Shopping
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-8"
        >
          {/* Checkout Form */}
          <div className="flex-1 bg-white dark:bg-surface-dark rounded-xl shadow-lg p-6 border border-border-light dark:border-border-dark">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FaMapMarkerAlt className="text-green" />
              Delivery Information
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (M-Pesa)
                </label>
                <input
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^254[0-9]{9}$/,
                      message: "Enter valid Kenyan phone number (254xxxxxxxxx)"
                    }
                  })}
                  type="tel"
                  placeholder="254xxxxxxxxx"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-surface-dark text-text dark:text-text-dark"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  {...register("address", { required: "Address is required" })}
                  type="text"
                  placeholder="Enter your address"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-surface-dark text-text dark:text-text-dark"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  {...register("city", { required: "City is required" })}
                  type="text"
                  placeholder="Enter your city"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-surface-dark text-text dark:text-text-dark"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Notes (Optional)
                </label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  placeholder="Any special instructions..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-surface-dark text-text dark:text-text-dark"
                />
                <div className="absolute top-0 right-0 text-gray-400 text-xs mt-1 mr-1" title="Optional instructions">?</div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="mpesa"
                      {...register("paymentMethod")}
                      defaultChecked
                      className="mr-2"
                    />
                    <FaPhone className="mr-2 text-green" />
                    M-Pesa (Mobile Money)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="cod"
                      {...register("paymentMethod")}
                      className="mr-2"
                    />
                    <FaCreditCard className="mr-2 text-primary" />
                    Cash on Delivery
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green text-white py-3 px-6 rounded-lg hover:bg-green-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green focus:ring-offset-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCreditCard />
                    Complete Order
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="flex-1 bg-white dark:bg-surface-dark rounded-xl shadow-lg p-6 lg:sticky lg:top-24 border border-border-light dark:border-border-dark">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              {cart.map((item) => (
                <motion.div 
                  key={item._id} 
                  className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg"
                  layout
                >
                  <img 
                    src={item.image || '/placeholder.png'} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <button
                        onClick={() => toggleWishlist(item)}
                        className={`text-sm p-1 rounded ${
                          wishlist.find(w => w._id === item._id)
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={
                          wishlist.find(w => w._id === item._id)
                            ? 'Remove from wishlist'
                            : 'Add to wishlist'
                        }
                      >
                        {wishlist.find(w => w._id === item._id) ? <FaHeart /> : <FaHeartBroken />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">Qty: {item.qty || 1}</p>
                  </div>
                  <div className="text-right">
                    <motion.p className="font-semibold text-gray-800" layout>
                      KSh {((item.price || 0) * (item.qty || 1)).toLocaleString()}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Items ({itemCount})</span>
                <span className="font-semibold">KSh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">VAT (16%)</span>
                <span className="font-semibold">KSh {vatAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Delivery</span>
                <span className="font-semibold text-green">Free</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-gray-800 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>KSh {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <FaPhone />
                <span className="font-semibold">Payment Information</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                {watch('paymentMethod') === 'mpesa'
                  ? `You'll receive an M-Pesa prompt on ${phone || 'your phone'} to complete payment.`
                  : 'You will pay cash when your order is delivered to your address.'
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
