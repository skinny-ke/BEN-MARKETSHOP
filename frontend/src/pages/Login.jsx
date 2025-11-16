import { SignIn } from "@clerk/clerk-react";
import { motion } from "framer-motion";

export default function Login() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-extrabold text-text dark:text-text-dark">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-text-secondary dark:text-gray-400">
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
                formButtonPrimary: "bg-green hover:bg-green-light text-sm normal-case",
                card: "shadow-lg rounded-xl overflow-hidden",
                headerTitle: "text-gray-900 dark:text-gray-100",
                headerSubtitle: "text-gray-600 dark:text-gray-400",
                socialButtonsBlockButton: "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
                formFieldInput: "border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary rounded-md",
                footerActionLink: "text-primary hover:text-primary-dark"
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
