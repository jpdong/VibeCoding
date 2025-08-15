'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
  userType: 'guest' | 'free' | 'premium';
  canUse: boolean;
}

interface UsageIndicatorProps {
  onUpgradeClick?: () => void;
  className?: string;
  externalUsage?: UsageInfo | null; // 外部传入的用量数据
}

export default function UsageIndicator({ onUpgradeClick, className = '', externalUsage }: UsageIndicatorProps) {
  const { data: session } = useSession();
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 如果有外部传入的用量数据，优先使用
    if (externalUsage) {
      setUsage(externalUsage);
      setLoading(false);
    } else {
      fetchUsage();
    }
  }, [session, externalUsage]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const userId = (session?.user as any)?.user_id;
      
      // 使用usage API而不是subscription API，因为它专门处理用量统计
      const response = await fetch(`/api/usage/status${userId ? `?userId=${userId}` : ''}`);
      const result = await response.json();
      
      if (result.success) {
        setUsage(result.data);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = () => {
    if (!usage) return 0;
    return Math.min((usage.used / usage.limit) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'from-red-500 to-red-600';
    if (percentage >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-blue-500 to-purple-600';
  };

  const getStatusMessage = () => {
    if (!usage) return '';
    
    if (usage.remaining === 0) {
      if (usage.userType === 'guest') {
        return 'Daily limit reached. Sign in for more generations!';
      } else if (usage.userType === 'free') {
        return 'Daily limit reached. Upgrade to Premium for 300 generations!';
      } else {
        return 'Daily limit reached. Resets tomorrow.';
      }
    }
    
    if (usage.remaining <= 5) {
      return `Only ${usage.remaining} generations left today`;
    }
    
    return `${usage.remaining} generations remaining today`;
  };

  const getUserTypeLabel = () => {
    switch (usage?.userType) {
      case 'guest': return 'Guest';
      case 'free': return 'Free';
      case 'premium': return 'Premium';
      default: return '';
    }
  };

  const shouldShowUpgrade = () => {
    return usage && (usage.userType === 'guest' || usage.userType === 'free') && usage.remaining <= 5;
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-xl ${className}`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-600">Loading usage...</span>
      </div>
    );
  }

  if (!usage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            usage.userType === 'premium' ? 'bg-purple-500' : 
            usage.userType === 'free' ? 'bg-blue-500' : 'bg-gray-500'
          }`} />
          <span className="text-sm font-medium text-gray-900">
            {getUserTypeLabel()} Plan
          </span>
        </div>
        
        <div className="text-sm text-gray-600">
          {usage.used} / {usage.limit}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${getUsagePercentage()}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full`}
          />
        </div>
      </div>

      {/* Status Message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={usage.remaining}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="flex items-center gap-2"
        >
          {usage.remaining === 0 ? (
            <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
          ) : usage.remaining <= 5 ? (
            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          ) : (
            <SparklesIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
          )}
          
          <span className={`text-sm ${
            usage.remaining === 0 ? 'text-red-600' :
            usage.remaining <= 5 ? 'text-yellow-600' : 'text-gray-600'
          }`}>
            {getStatusMessage()}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Upgrade Button */}
      <AnimatePresence>
        {shouldShowUpgrade() && (
          <motion.button
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            onClick={onUpgradeClick}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <SparklesIcon className="w-4 h-4" />
            {usage.userType === 'guest' ? 'Sign In for More' : 'Upgrade to Premium'}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}