import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaTimes, FaMobile, FaApple } from 'react-icons/fa';
import { toast } from 'sonner';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  /** 🧠 Detect platform and listen for PWA events */
  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS (Safari) platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(userAgent) &&
      !window.navigator.standalone;
    setIsIOS(isIOSDevice);

    // Handle PWA install prompt for Android / Desktop
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // When installed successfully
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      toast.success('🎉 BenMarket app installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Re-show after 7 days if dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const daysSince = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSince > 7) setShowInstallPrompt(true);
    } else {
      // Show prompt after short delay for first-time visitors
      const timer = setTimeout(() => setShowInstallPrompt(true), 4000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /** 🚀 Trigger install flow (for Android / Desktop) */
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        toast.success('Installing BenMarket app...');
        // Optional: send analytics
        // await fetch('/api/analytics/pwa-install', { method: 'POST' });
      } else {
        toast.info('Installation cancelled');
      }

      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('❌ Error installing PWA:', error);
      toast.error('Failed to install app');
    }
  };

  /** ❌ Dismiss prompt */
  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  /** 🧭 iOS install instructions */
  const renderIOSInstructions = () => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaApple className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">
              Install BenMarket on iPhone
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Tap <strong>Share → Add to Home Screen</strong> to install the app.
            </p>
            <button
              onClick={handleDismiss}
              className="mt-3 inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              <FaTimes className="w-3 h-3 mr-1" />
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /** 🧱 Default Android/Desktop prompt */
  const renderDefaultPrompt = () => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaMobile className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">
              Install BenMarket App
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Get faster loading and offline access with the app version.
            </p>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleInstall}
                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                <FaDownload className="w-3 h-3 mr-1" />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                <FaTimes className="w-3 h-3 mr-1" />
                Later
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (isInstalled || !showInstallPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: 'spring', stiffness: 150, damping: 18 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
      >
        {isIOS ? renderIOSInstructions() : renderDefaultPrompt()}
      </motion.div>
    </AnimatePresence>
  );
}
