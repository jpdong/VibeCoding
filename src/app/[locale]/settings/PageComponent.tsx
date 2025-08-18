'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  CreditCardIcon, 
  UserIcon, 
  BellIcon, 
  ChartBarIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

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
    used: number;
    limit: number;
    remaining: number;
    userType: string;
  };
  user: {
    currentPlan: string;
    subscriptionStatus: string;
  } | null;
}

export default function SettingsPageComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('subscription');

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
        alert('Customer portal is not available at the moment. Please contact support.');
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      alert('Error opening customer portal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
                   (subscriptionData?.user?.currentPlan !== 'free' && subscriptionData?.user?.currentPlan !== null);

  const tabs = [
    { id: 'subscription', name: 'Subscription', icon: CreditCardIcon },
    { id: 'usage', name: 'Usage', icon: ChartBarIcon },
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Cog6ToothIcon className="h-8 w-8 text-gray-900 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border-blue-500'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'subscription' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Subscription Management</h2>
                
                {/* Current Plan */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Current Plan</h3>
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

                {/* Subscription Details */}
                {subscriptionData?.subscription ? (
                  <div className="border rounded-lg p-6 mb-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Subscription Details</h3>
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
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">No Active Subscription</h3>
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
                </div>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Usage Statistics</h2>
                
                {/* Usage Today */}
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Today's Usage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">
                        {subscriptionData?.usage.used || 0}
                      </p>
                      <p className="text-gray-600">Used</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {subscriptionData?.usage.remaining || 0}
                      </p>
                      <p className="text-gray-600">Remaining</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">
                        {subscriptionData?.usage.limit || 0}
                      </p>
                      <p className="text-gray-600">Daily Limit</p>
                    </div>
                  </div>
                  
                  {/* Usage Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Usage Progress</span>
                      <span>
                        {subscriptionData?.usage.used || 0} / {subscriptionData?.usage.limit || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            ((subscriptionData?.usage.used || 0) / (subscriptionData?.usage.limit || 1)) * 100,
                            100
                          )}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Resets daily at midnight UTC
                    </p>
                  </div>
                </div>

                {/* Plan Comparison */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Plan Comparison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-gray-50">
                      <h4 className="font-semibold text-gray-900">Guest</h4>
                      <p className="text-2xl font-bold text-gray-600">10</p>
                      <p className="text-sm text-gray-500">generations/day</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-blue-50">
                      <h4 className="font-semibold text-gray-900">Free</h4>
                      <p className="text-2xl font-bold text-blue-600">30</p>
                      <p className="text-sm text-gray-500">generations/day</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-green-50">
                      <h4 className="font-semibold text-gray-900">Premium</h4>
                      <p className="text-2xl font-bold text-green-600">300</p>
                      <p className="text-sm text-gray-500">generations/day</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{session?.user?.name || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{session?.user?.email || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Type</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">
                      {subscriptionData?.usage.userType || 'guest'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Status</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      getStatusColor(subscriptionData?.user?.subscriptionStatus || 'free')
                    }`}>
                      {subscriptionData?.user?.subscriptionStatus || 'free'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Usage Alerts</h3>
                      <p className="text-sm text-gray-500">Get notified when you're close to your daily limit</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                      <span className="sr-only">Enable notifications</span>
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Subscription Updates</h3>
                      <p className="text-sm text-gray-500">Get notified about billing and subscription changes</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                      <span className="sr-only">Enable notifications</span>
                      <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition"></span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Product Updates</h3>
                      <p className="text-sm text-gray-500">Get notified about new features and improvements</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                      <span className="sr-only">Enable notifications</span>
                      <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition"></span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}