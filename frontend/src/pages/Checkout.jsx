import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FaCreditCard, FaPhone, FaMapMarkerAlt, FaSpinner } from "react-icons/fa";
import { useShop } from "../context/ShopContext";
import { orderService, mpesaService } from "../api/services";
import toast from "react-hot-toast";

export default function Checkout() {
  const { cart, clearCart, user } = useShop();
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'processing', 'success'
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      phone: '',
      address: '',
      city: '',
      notes: ''
    }
  });

  const phone = watch('phone');

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  const total = cart.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
  const itemCount = cart.reduce((s, i) => s + (i.qty || 1), 0);

  const onSubmit = async (data) => {
    if (!user) {
      toast.error('Please login to continue');
      return;
    }

    try {
      setLoading(true);
      setPaymentStep('processing');

      // Create order
      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.qty || 1
        })),
        totalAmount: total,
        shippingAddress: `${data.address}, ${data.city}`
      };

      const orderResponse = await orderService.createOrder(orderData);
      const order = orderResponse.data;

      // Initiate M-Pesa STK push
      const mpesaData = {
        amount: total,
        phone: data.phone,
        account: order._id
      };

      await mpesaService.stkPush(mpesaData);
      
      setPaymentStep('success');
      clearCart();
      toast.success('Payment initiated! Check your phone for M-Pesa prompt.');
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
      setPaymentStep('form');
    } finally {
      setLoading(false);
    }
  };

  if (paymentStep === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-8 rounded-xl shadow-lg"
        >
          <FaSpinner className="text-4xl text-green-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we process your M-Pesa payment...</p>
        </motion.div>
      </div>
    );
  }

  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-8 rounded-xl shadow-lg"
        >
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Initiated!</h2>
          <p className="text-gray-600 mb-6">Check your phone for M-Pesa prompt to complete payment.</p>
          <a 
            href="/"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue Shopping
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-600" />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    placeholder="Any special instructions..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCreditCard />
                      Pay with M-Pesa
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                    <img 
                      src={item.image || '/placeholder.png'} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.qty || 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        KSh {((item.price || 0) * (item.qty || 1)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Items ({itemCount})</span>
                  <span className="font-semibold">KSh {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-gray-800 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>KSh {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <FaPhone />
                  <span className="font-semibold">M-Pesa Payment</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  You'll receive an M-Pesa prompt on {phone || 'your phone'} to complete payment.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
