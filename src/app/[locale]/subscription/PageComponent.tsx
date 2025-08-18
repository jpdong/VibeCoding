'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SubscriptionData {
  subscription: {
    id: number;
    planId: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    creemSubscriptionId: string;
  } | null;
  usage: {
    dailyUsage: number;
    dailyLimit: number;
    remainingToday: number;
    resetTime: string;
  };
  user: {
    currentPlan: string;
    subscriptionStatus: string;
  } | null;
}

export default function SubscriptionPageComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (session?.user?.id) {
      fetchSubscriptionData();
    }
  }, [session, status, router]);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch(`/api/subscription/status?userId=${session?.user?.id}`);
      const result = await response.json();
      
      if (result.success) {
        setSubscriptionData(result.data);
      } else {
        setError('Failed to load subscription data');
      }
    } catch (err) {
      setError('Error loading subscription data');
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push('/#pricing');
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/payments/customerPortal');
      const result = await response.json();
      
      if (result.success && result.portalUrl) {
        window.open(result.portalUrl, '_blank');
      } else {
        alert('Unable to open customer portal');
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      alert('Error opening customer portal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'canceled': return 'text-orange-600 bg-orange-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isPremium = subscriptionData?.user?.currentPlan === 'premium' || 
                   subscriptionData?.user?.currentPlan !== 'free';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
            <p className="text-gray-600">Manage your VibeCoding subscription and usage</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Current Plan */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-gray-900">
                    {isPremium ? 'Premium Plan' : 'Free Plan'}
                  </p>
                  <p className="text-gray-600">
                    {isPremium ? '$9.99/month' : 'Free forever'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    getStatusColor(subscriptionData?.user?.subscriptionStatus || 'free')
                  }`}>
                    {subscriptionData?.user?.subscriptionStatus || 'free'}
                  </span>
                </div>
              </div>
            </div>

            {/* Usage Information */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Today</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {subscriptionData?.usage.dailyUsage || 0}
                  </p>
                  <p className="text-gray-600">Used</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {subscriptionData?.usage.remainingToday || 0}
                  </p>
                  <p className="text-gray-600">Remaining</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {subscriptionData?.usage.dailyLimit || 30}
                  </p>
                  <p className="text-gray-600">Daily Limit</p>
                </div>
              </div>
              
              {/* Usage Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Usage Progress</span>
                  <span>
                    {subscriptionData?.usage.dailyUsage || 0} / {subscriptionData?.usage.dailyLimit || 30}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        ((subscriptionData?.usage.dailyUsage || 0) / (subscriptionData?.usage.dailyLimit || 30)) * 100,
                        100
                      )}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Resets at: {subscriptionData?.usage.resetTime ? 
                    new Date(subscriptionData.usage.resetTime).toLocaleTimeString() : 
                    'N/A'
                  }
                </p>
              </div>
            </div>

            {/* Subscription Details */}
            {subscriptionData?.subscription ? (
              <div className="border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Plan ID</p>
                    <p className="font-medium">{subscriptionData.subscription.planId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      getStatusColor(subscriptionData.subscription.status)
                    }`}>
                      {subscriptionData.subscription.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Period Start</p>
                    <p className="font-medium">
                      {formatDate(subscriptionData.subscription.currentPeriodStart)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Period End</p>
                    <p className="font-medium">
                      {formatDate(subscriptionData.subscription.currentPeriodEnd)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cancel at Period End</p>
                    <p className="font-medium">
                      {subscriptionData.subscription.cancelAtPeriodEnd ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Subscription ID</p>
                    <p className="font-medium text-xs">
                      {subscriptionData.subscription.creemSubscriptionId}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h2>
                <p className="text-gray-600 mb-4">
                  You're currently on the free plan. Upgrade to Premium for more features!
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!isPremium ? (
                <button
                  onClick={handleUpgrade}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Upgrade to Premium
                </button>
              ) : (
                <button
                  onClick={handleManageSubscription}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Manage Subscription
                </button>
              )}
              
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}