'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const session = searchParams.get('session_id');
    setSessionId(session);
    
    // 模拟验证支付状态
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Processing your payment...
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your subscription.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
          className="mx-auto mb-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          Payment Successful!
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-8"
        >
          Welcome to Premium! You now have access to 300 AI code generations per day and all premium features.
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Premium Features Unlocked</h3>
          </div>
          <ul className="space-y-2 text-left text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              300 AI generations per day
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Priority processing
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Advanced code templates
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Priority support
            </li>
          </ul>
        </motion.div>

        {/* Actions */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/chat"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Start Coding Now
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Link
              href="/settings"
              className="w-full text-gray-600 hover:text-gray-800 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 block"
            >
              Manage Subscription
            </Link>
          </motion.div>
        </div>

        {/* Session Info */}
        {sessionId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 pt-6 border-t border-gray-200"
          >
            <p className="text-xs text-gray-500">
              Transaction ID: {sessionId}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}