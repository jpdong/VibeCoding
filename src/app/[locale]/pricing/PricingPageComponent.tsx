'use client'
import React, { useState } from 'react';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import HeadInfo from '~/components/HeadInfo';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth, usePremiumAccess } from '~/context/auth-context';
import ComingSoonModal from '~/components/subscription/ComingSoonModal';

interface PricingPageComponentProps {
  locale: string;
  commonText: any;
  authText: any;
  menuText: any;
}

const PricingPageComponent: React.FC<PricingPageComponentProps> = ({
  locale,
  commonText,
  authText,
  menuText
}) => {
  const { isAuthenticated, login } = useAuth();
  const { hasPremium, subscription } = usePremiumAccess();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleSubscribe = async (planType: 'free' | 'premium') => {
    if (planType === 'premium') {
      setShowComingSoon(true);
      return;
    }

    if (!isAuthenticated) {
      await login();
      return;
    }

    // Free plan is automatically assigned
    // No action needed for free plan
  };

  const pricingPlans = [
    {
      id: 'free',
      name: commonText.freePlanName || 'Free',
      price: 0,
      currency: 'USD',
      interval: 'month',
      description: commonText.freePlanDescription || 'Perfect for getting started with AI coding assistance',
      features: [
        commonText.freeFeature1 || 'Access to basic AI models (GPT-3.5, Claude Haiku)',
        commonText.freeFeature2 || 'Limited daily usage (50 requests)',
        commonText.freeFeature3 || 'Community support',
        commonText.freeFeature4 || 'Basic code assistance',
        commonText.freeFeature5 || 'Code syntax highlighting',
      ],
      limitations: [
        commonText.freeLimitation1 || 'No access to premium models',
        commonText.freeLimitation2 || 'Daily usage limits',
        commonText.freeLimitation3 || 'No priority support',
      ],
      buttonText: commonText.freeButtonText || 'Get Started Free',
      popular: false,
    },
    {
      id: 'premium',
      name: commonText.premiumPlanName || 'Premium',
      price: 9.9,
      currency: 'USD',
      interval: 'month',
      description: commonText.premiumPlanDescription || 'Unlock the full power of AI coding assistance',
      features: [
        commonText.premiumFeature1 || 'Access to all AI models (GPT-4, Claude Opus, Gemini Pro)',
        commonText.premiumFeature2 || 'Unlimited daily usage',
        commonText.premiumFeature3 || 'Priority support',
        commonText.premiumFeature4 || 'Advanced code analysis',
        commonText.premiumFeature5 || 'Code review features',
        commonText.premiumFeature6 || 'Export conversations',
        commonText.premiumFeature7 || 'Early access to new features',
        commonText.premiumFeature8 || 'Custom model fine-tuning (coming soon)',
      ],
      limitations: [],
      buttonText: commonText.premiumButtonText || 'Upgrade to Premium',
      popular: true,
    },
  ];

  return (
    <>
      <HeadInfo
        locale={locale}
        page="pricing"
        title={commonText.pricingPageTitle || 'Pricing - Vibe Coding'}
        description={commonText.pricingPageDescription || 'Choose the perfect plan for your coding needs. Free and premium options available.'}
      />
      
      <Header locale={locale} page="pricing" />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              {commonText.pricingTitle || 'Simple, Transparent Pricing'}
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              {commonText.pricingSubtitle || 'Choose the plan that fits your coding needs. Upgrade or downgrade at any time.'}
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 max-w-4xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-8 shadow-lg ${
                  plan.popular
                    ? 'border-[#ffa11b] bg-white ring-2 ring-[#ffa11b] ring-opacity-50'
                    : 'border-gray-200 bg-white'
                } ${hasPremium && plan.id === 'premium' ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#ffa11b] text-white px-4 py-2 rounded-full text-sm font-medium">
                      {commonText.mostPopular || 'Most Popular'}
                    </span>
                  </div>
                )}

                {hasPremium && plan.id === 'premium' && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {commonText.currentPlan || 'Current Plan'}
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="mt-2 text-gray-600">{plan.description}</p>
                  
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">
                      /{commonText.perMonth || 'month'}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    {commonText.featuresIncluded || 'What\'s included:'}
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        {commonText.limitations || 'Limitations:'}
                      </h4>
                      <ul className="space-y-3">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start">
                            <XMarkIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <div className="mt-8">
                  <button
                    onClick={() => handleSubscribe(plan.id as 'free' | 'premium')}
                    disabled={hasPremium && plan.id === 'premium'}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
                      plan.popular
                        ? 'bg-[#ffa11b] text-white hover:bg-[#f79100] disabled:bg-gray-400'
                        : 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400'
                    } ${hasPremium && plan.id === 'premium' ? 'cursor-not-allowed' : ''}`}
                  >
                    {hasPremium && plan.id === 'premium'
                      ? commonText.currentPlan || 'Current Plan'
                      : plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                {commonText.faqTitle || 'Frequently Asked Questions'}
              </h2>
            </div>
            
            <div className="mt-12 max-w-3xl mx-auto">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {commonText.faq1Question || 'Can I change my plan anytime?'}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {commonText.faq1Answer || 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {commonText.faq2Question || 'What payment methods do you accept?'}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {commonText.faq2Answer || 'We accept all major credit cards, PayPal, and other secure payment methods. Payment processing is coming soon.'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {commonText.faq3Question || 'Is there a free trial for Premium?'}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {commonText.faq3Answer || 'Currently, we offer a generous free tier. Premium features will include a trial period when launched.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer locale={locale} page="pricing" />

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        commonText={commonText}
      />
    </>
  );
};

export default PricingPageComponent;