import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeart, FaRocket, FaShieldAlt, FaDownload } from "react-icons/fa";
import { motion } from "framer-motion";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              Stay Updated with BenMarket
            </h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Get the latest product updates, exclusive offers, and inspirational content delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50"
              />
              <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Logo size="large" showText={true} className="mb-4" />
            <p className="text-gray-400 mb-4">
              Your one-stop shop for quality products. We deliver excellence right to your doorstep with downloadable content and exceptional service.
            </p>
            <div className="flex space-x-4">
              <motion.a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaFacebook className="text-xl" />
              </motion.a>
              <motion.a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTwitter className="text-xl" />
              </motion.a>
              <motion.a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaInstagram className="text-xl" />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="/products" className="text-gray-400 hover:text-white transition-colors">Products</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><a href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/shipping" className="text-gray-400 hover:text-white transition-colors">Shipping Info</a></li>
              <li><a href="/returns" className="text-gray-400 hover:text-white transition-colors">Returns</a></li>
              <li><a href="/downloads" className="text-gray-400 hover:text-white transition-colors flex items-center">
                <FaDownload className="mr-2" />
                Downloads
              </a></li>
              <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FaPhone className="text-green-500" />
                <span className="text-gray-400">+254 742 846 842</span>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-green-500" />
                <span className="text-gray-400">info@benmarket.com</span>
              </div>
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-green-500" />
                <span className="text-gray-400">Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaRocket className="text-white text-xl" />
              </div>
              <h5 className="text-white font-semibold mb-2">Fast Delivery</h5>
              <p className="text-gray-400 text-sm">Quick and reliable shipping to your doorstep</p>
            </motion.div>

            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaDownload className="text-white text-xl" />
              </div>
              <h5 className="text-white font-semibold mb-2">Downloadable Content</h5>
              <p className="text-gray-400 text-sm">Access manuals, guides, and digital resources</p>
            </motion.div>

            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaShieldAlt className="text-white text-xl" />
              </div>
              <h5 className="text-white font-semibold mb-2">Secure Shopping</h5>
              <p className="text-gray-400 text-sm">Your data and payments are always protected</p>
            </motion.div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 flex items-center justify-center">
              Made with <FaHeart className="text-red-500 mx-1" /> in Kenya • 
              © {new Date().getFullYear()} BenMarket. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
