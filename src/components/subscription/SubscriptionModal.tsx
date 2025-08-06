'use client'
import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckIcon, StarIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useAuth, usePremiumAccess } from '~/context/auth-context';
import { Subscription } from '~/types/auth';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  commonText: any;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  commonText
}) => {
  const { user, isAuthenticated } = useAuth();
  const { hasPremium, subscription } = usePremiumAccess();
  const [loading, setLoading] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<Subscription | null>(null);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchSubscriptionDetails();
    }
  }, [isOpen, isAuthenticated]);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription/status', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSubscriptionDetails(data.subscription);
        }
      }
    } catch (error) {
      console.error('Failed to fetch subscription details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    // This will show coming soon modal
    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planType: 'premium',
        }),
      });

      const data = await response.json();
      if (data.error && data.error.code === 'COMING_SOON') {
        // Handle coming soon response
        alert(data.error.message);
      }
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <CreditCardIcon className="h-6 w-6 text-[#ffa11b]" />
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      {commonText.subscriptionTitle || 'Subscription'}
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffa11b]"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {commonText.currentPlan || 'Current Plan'}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          hasPremium 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {hasPremium ? (
                            <>
                              <StarIcon className="w-3 h-3 mr-1" />
                              Premium
                            </>
                          ) : (
                            'Free'
                          )}
                        </span>
                      </div>
                      
                      {subscriptionDetails && (
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="font-medium">Status:</span>{' '}
                            <span className={`capitalize ${
                              subscriptionDetails.status === 'active' 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {subscriptionDetails.status}
                            </span>
                          </p>
                          <p>
                            <span className="font-medium">Started:</span>{' '}
                            {formatDate(subscriptionDetails.startedAt.toString())}
                          </p>
                          {subscriptionDetails.expiresAt && (
                            <p>
                              <span className="font-medium">
                                {subscriptionDetails.status === 'active' ? 'Expires:' : 'Expired:'}
                              </span>{' '}
                              {formatDate(subscriptionDetails.expiresAt.toString())}
                              {subscriptionDetails.status === 'active' && (
                                <span className="ml-2 text-blue-600">
                                  ({getDaysRemaining(subscriptionDetails.expiresAt.toString())} days remaining)
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Features Comparison */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {commonText.planComparison || 'Plan Comparison'}
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {/* Free Plan */}
                        <div className="border rounded-lg p-3">
                          <h5 className="font-medium text-gray-900 mb-2">Free</h5>
                          <ul className="space-y-1 text-xs text-gray-600">
                            <li className="flex items-center">
                              <CheckIcon className="w-3 h-3 text-green-500 mr-1" />
                              Basic models
                            </li>
                            <li className="flex items-center">
                              <CheckIcon className="w-3 h-3 text-green-500 mr-1" />
                              50 requests/day
                            </li>
                            <li className="flex items-center">
                              <CheckIcon className="w-3 h-3 text-green-500 mr-1" />
                              Community support
                            </li>
                          </ul>
                        </div>

                        {/* Premium Plan */}
                        <div className={`border rounded-lg p-3 ${
                          hasPremium ? 'border-yellow-300 bg-yellow-50' : ''
                        }`}>
                          <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                            <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                            Premium
                          </h5>
                          <ul className="space-y-1 text-xs text-gray-600">
                            <li className="flex items-center">
                              <CheckIcon className="w-3 h-3 text-green-500 mr-1" />
                              All models
                            </li>
                            <li className="flex items-center">
                              <CheckIcon className="w-3 h-3 text-green-500 mr-1" />
                              Unlimited usage
                            </li>
                            <li className="flex items-center">
                              <CheckIcon className="w-3 h-3 text-green-500 mr-1" />
                              Priority support
                            </li>
                            <li className="flex items-center">
                              <CheckIcon className="w-3 h-3 text-green-500 mr-1" />
                              Advanced features
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {commonText.closeButton || 'Close'}
                      </button>
                      
                      {!hasPremium && (
                        <button
                          onClick={handleUpgrade}
                          className="flex-1 px-4 py-2 bg-[#ffa11b] text-white rounded-md hover:bg-[#f79100] transition-colors"
                        >
                          {commonText.upgradeButton || 'Upgrade'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SubscriptionModal;