import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, BellSlashIcon, CogIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import pushNotificationService from '../services/pushNotifications';

const PushNotificationManager = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkSupport();
    checkSubscription();
  }, []);

  const checkSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
  };

  const checkSubscription = async () => {
    if (!isSupported) return;

    try {
      const subscribed = await pushNotificationService.isSubscribed();
      setIsSubscribed(subscribed);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const initialized = await pushNotificationService.init();
      if (!initialized) {
        toast.error('Push notifications are not supported in this browser');
        return;
      }

      const subscribed = await pushNotificationService.subscribe();
      if (subscribed) {
        setIsSubscribed(true);
        toast.success('Successfully subscribed to push notifications!');
      } else {
        toast.error('Failed to subscribe to push notifications');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to subscribe to push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const unsubscribed = await pushNotificationService.unsubscribe();
      if (unsubscribed) {
        setIsSubscribed(false);
        toast.success('Successfully unsubscribed from push notifications');
      } else {
        toast.error('Failed to unsubscribe from push notifications');
      }
    } catch (error) {
      console.error('Unsubscription error:', error);
      toast.error('Failed to unsubscribe from push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      const sent = await pushNotificationService.sendTestNotification();
      if (sent) {
        toast.success('Test notification sent!');
      } else {
        toast.error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('Failed to send test notification');
    }
  };

  if (!isSupported) {
    return null; // Don't show anything if not supported
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          isSubscribed
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isSubscribed ? 'Disable push notifications' : 'Enable push notifications'}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        ) : isSubscribed ? (
          <BellIcon className="w-4 h-4" />
        ) : (
          <BellSlashIcon className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {isLoading ? 'Loading...' : isSubscribed ? 'Notifications On' : 'Enable Notifications'}
        </span>
      </motion.button>

      {/* Test notification button (only show when subscribed) */}
      {isSubscribed && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleTestNotification}
          className="ml-2 flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
          title="Send test notification"
        >
          <CogIcon className="w-3 h-3" />
          Test
        </motion.button>
      )}
    </div>
  );
};

export default PushNotificationManager;