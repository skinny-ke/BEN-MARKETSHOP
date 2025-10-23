import { SignUp } from "@clerk/clerk-react";
import { motion } from "framer-motion";

export default function Register() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Join BenMarket
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to start shopping
          </p>
        </div>
        
        <div className="flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: "bg-green-600 hover:bg-green-700 text-sm normal-case",
                card: "shadow-lg",
                headerTitle: "text-gray-900",
                headerSubtitle: "text-gray-600",
                socialButtonsBlockButton: "border-gray-300 hover:bg-gray-50",
                formFieldInput: "border-gray-300 focus:border-green-500 focus:ring-green-500",
                footerActionLink: "text-green-600 hover:text-green-500"
              }
            }}
            redirectUrl="/"
            signInUrl="/login"
          />
        </div>
      </div>
    </motion.div>
  );
}