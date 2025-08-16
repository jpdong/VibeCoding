'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import PricingCard from './PricingCard';
import { useRouter } from 'next/navigation';

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

export default function PricingSection() {
  const { data: session } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free');

  useEffect(() => {
    fetchPlans();
    if (session?.user) {
      fetchUserSubscription();
    }
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      const result = await response.json();
      
      if (result.success) {
        const formattedPlans = result.data.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
          dailyLimit: plan.dailyLimit,
          features: getFeaturesList(plan.id, plan.dailyLimit),
          popular: plan.id === 'premium'
        }));
        setPlans(formattedPlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchUserSubscription = async () => {
    if (!session?.user?.email) return;
    
    try {
      const response = await fetch(`/api/subscription/status?userEmail=${session.user.email}`);
      const result = await response.json();
      
      if (result.success) {
        setCurrentPlan(result.data.user.currentPlan || 'free');
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    }
  };

  const getFeaturesList = (planId: string, dailyLimit: number) => {
    const baseFeatures = [
      `${dailyLimit} AI code generations per day`,
      'Advanced code suggestions',
      'Multi-language support'
    ];

    if (planId === 'premium') {
      return [
        ...baseFeatures,
        'Priority support',
        'Export code history',
        'Priority processing'
      ];
    }

    return [
      ...baseFeatures,
      'Community support',
      'Basic templates'
    ];
  };

  const handleSelectPlan = async (planId: string) => {
    if (!session?.user) {
      // 未登录用户，引导登录
      router.push('/login?callbackUrl=' + encodeURIComponent(window.location.href));
      return;
    }

    if (planId === 'free') {
      return; // 免费计划无需操作
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: session.user.email,
          planId,
          successUrl: window.location.origin + '/payment/success',
          cancelUrl: window.location.origin + '/payment/cancel'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        window.location.href = result.data.checkoutUrl;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to start payment process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updatedPlans = plans.map(plan => ({
    ...plan,
    current: plan.id === currentPlan
  }));

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that&apos;s right for you. Start free, upgrade when you need more power.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {updatedPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PricingCard
                plan={plan}
                onSelectPlan={handleSelectPlan}
                loading={loading}
              />
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No hidden fees
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Secure payments
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}