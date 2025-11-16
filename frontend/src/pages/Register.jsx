import { SignUp } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-green-100 dark:from-background-dark dark:to-background-dark py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-text dark:text-text-dark">
            Join BenMarket
          </h2>
          <p className="mt-2 text-sm text-text-secondary dark:text-gray-400">
            Create your account to start shopping and enjoy exclusive deals
          </p>
        </div>
        
        {/* SignUp Card */}
        <div className="bg-white dark:bg-surface-dark shadow-lg rounded-xl p-6 relative border border-border-light dark:border-border-dark">
          {/* Password toggle overlay */}
          <div className="absolute top-4 right-4 z-10">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <SignUp
            signInUrl="/login"
            redirectUrl="/"
            appearance={{
              elements: {
                formButtonPrimary: "bg-green hover:bg-green-light text-sm normal-case",
                card: "shadow-none bg-transparent",
                headerTitle: "text-text dark:text-text-dark text-center text-2xl font-bold",
                headerSubtitle: "text-text-secondary dark:text-gray-400 text-center",
                socialButtonsBlockButton: "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
                formFieldInput: "border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary",
                footerActionLink: "text-primary hover:text-primary-dark"
              },
              variables: {
                // This tells Clerk to toggle password visibility based on `showPassword`
                passwordFieldType: showPassword ? "text" : "password"
              }
            }}
          />

          {/* Password hints */}
          <p className="mt-4 text-xs text-gray-500 text-center">
            Use at least 8 characters with letters, numbers, and symbols for a strong password.
          </p>

          {/* Terms & Privacy */}
          <p className="mt-2 text-xs text-gray-500 text-center">
            By signing up, you agree to our <span className="text-primary underline cursor-pointer">Terms of Service</span> and <span className="text-primary underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
