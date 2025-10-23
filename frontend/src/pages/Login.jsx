import { SignIn } from "@clerk/clerk-react";
import { motion } from "framer-motion";

export default function Login() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your BenMarket account
          </p>
        </motion.div>

        {/* SignIn Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: "bg-green-600 hover:bg-green-700 text-sm normal-case",
                card: "shadow-lg rounded-xl overflow-hidden",
                headerTitle: "text-gray-900",
                headerSubtitle: "text-gray-600",
                socialButtonsBlockButton: "border-gray-300 hover:bg-gray-50",
                formFieldInput: "border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md",
                footerActionLink: "text-green-600 hover:text-green-500"
              }
            }}
            redirectUrl="/"
            signUpUrl="/register"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
