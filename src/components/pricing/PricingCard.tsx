'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  dailyLimit: number;
  features: string[];
  popular?: boolean;
  current?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
  onSelectPlan: (planId: string) => void;
  loading?: boolean;
}

export default function PricingCard({ plan, onSelectPlan, loading = false }: PricingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  const getButtonText = () => {
    if (plan.current) return 'Current Plan';
    if (plan.id === 'free') return 'Get Started';
    return 'Coming Soon';
  };

  const getButtonStyle = () => {
    if (plan.current) {
      return 'bg-gray-100 text-gray-400 cursor-not-allowed';
    }
    if (plan.id === 'free') {
      return 'bg-gray-900 text-white hover:bg-gray-800';
    }
    // Premium plans (coming soon)
    return 'bg-gray-300 text-gray-600 cursor-not-allowed';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative p-8 rounded-2xl transition-all duration-300 ${
        plan.popular
          ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-xl shadow-blue-100/50'
          : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg'
      }`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <SparklesIcon className="w-4 h-4" />
            Most Popular
          </div>
        </div>
      )}

      {/* Plan Name */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className={`text-4xl font-bold ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' : 'text-gray-900'}`}>
            {formatPrice(plan.price)}
          </span>
          {plan.price > 0 && (
            <span className="text-gray-500 text-lg">/month</span>
          )}
        </div>
      </div>

      {/* Daily Limit */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
          plan.popular 
            ? 'bg-blue-100 text-blue-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          <span className="font-bold text-lg mr-1">{plan.dailyLimit}</span>
          generations per day
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4 mb-8">
        {plan.features.map((feature, index) => (
          <motion.div
            key={feature}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              plan.popular ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <CheckIcon className={`w-3 h-3 ${
                plan.popular ? 'text-blue-600' : 'text-gray-600'
              }`} />
            </div>
            <span className="text-gray-700 text-sm">{feature}</span>
          </motion.div>
        ))}
      </div>

      {/* CTA Button */}
      <motion.button
        whileHover={{ scale: plan.current ? 1 : 1.02 }}
        whileTap={{ scale: plan.current ? 1 : 0.98 }}
        onClick={() => !plan.current && !loading && plan.id === 'free' && onSelectPlan(plan.id)}
        disabled={plan.current || loading || plan.id !== 'free'}
        className={`w-full py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 ${getButtonStyle()}`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Processing...
          </div>
        ) : (
          getButtonText()
        )}
      </motion.button>

      {/* Hover Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{
          boxShadow: isHovered && !plan.current
            ? plan.popular
              ? '0 20px 40px -12px rgba(59, 130, 246, 0.25)'
              : '0 20px 40px -12px rgba(0, 0, 0, 0.1)'
            : '0 0px 0px 0px rgba(0, 0, 0, 0)'
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}