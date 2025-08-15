'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { XMarkIcon, ExclamationTriangleIcon, SparklesIcon, UserIcon } from '@heroicons/react/24/outline';

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'guest' | 'free' | 'premium';
  onSignIn?: () => void;
  onUpgrade?: () => void;
}

export default function UsageLimitModal({ 
  isOpen, 
  onClose, 
  userType, 
  onSignIn, 
  onUpgrade 
}: UsageLimitModalProps) {
  
  const getContent = () => {
    switch (userType) {
      case 'guest':
        return {
          icon: <UserIcon className="w-12 h-12 text-blue-500" />,
          title: 'Daily Limit Reached',
          description: 'You\'ve used all 10 free generations today. Sign in to get 30 generations per day!',
          primaryAction: {
            text: 'Sign In Now',
            onClick: onSignIn,
            className: 'bg-blue-600 hover:bg-blue-700 text-white'
          },
          benefits: [
            '30 generations per day (3x more!)',
            'Save your generation history',
            'Access advanced features'
          ]
        };
      
      case 'free':
        return {
          icon: <SparklesIcon className="w-12 h-12 text-purple-500" />,
          title: 'Upgrade to Premium',
          description: 'You\'ve used all 30 free generations today. Upgrade to Premium for 300 generations per day!',
          primaryAction: {
            text: 'Upgrade to Premium',
            onClick: onUpgrade,
            className: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
          },
          benefits: [
            '300 generations per day (10x more!)',
            'Priority processing',
            'Advanced code templates',
            'Priority support',
            'Export capabilities'
          ]
        };
      
      default:
        return {
          icon: <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500" />,
          title: 'Daily Limit Reached',
          description: 'You\'ve used all your generations for today. Your limit will reset tomorrow.',
          primaryAction: null,
          benefits: []
        };
    }
  };

  const content = getContent();

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
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                {/* Close Button */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="text-center">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="mx-auto mb-6"
                  >
                    {content.icon}
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold text-gray-900 mb-4"
                  >
                    {content.title}
                  </motion.h3>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-600 mb-6"
                  >
                    {content.description}
                  </motion.p>

                  {/* Benefits */}
                  {content.benefits.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gray-50 rounded-xl p-4 mb-6"
                    >
                      <h4 className="font-semibold text-gray-900 mb-3 text-left">
                        What you'll get:
                      </h4>
                      <ul className="space-y-2 text-left">
                        {content.benefits.map((benefit, index) => (
                          <motion.li
                            key={benefit}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="flex items-center gap-3 text-sm text-gray-700"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                            {benefit}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3">
                    {content.primaryAction && (
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        onClick={content.primaryAction.onClick}
                        className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 ${content.primaryAction.className}`}
                      >
                        {content.primaryAction.text}
                      </motion.button>
                    )}
                    
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      onClick={onClose}
                      className="w-full py-3 px-6 rounded-xl font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200"
                    >
                      {userType === 'premium' ? 'Got it' : 'Maybe later'}
                    </motion.button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}