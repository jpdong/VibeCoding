'use client'
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, RocketLaunchIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  commonText: any;
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose,
  commonText
}) => {
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <RocketLaunchIcon className="h-6 w-6 text-[#ffa11b]" />
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      {commonText.comingSoonTitle || 'Coming Soon!'}
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <ClockIcon className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600">
                      {commonText.expectedLaunch || 'Expected Launch: Q2 2024'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mb-6">
                    {commonText.comingSoonMessage || 
                      'We\'re working hard to bring you premium subscriptions with amazing features! Stay tuned for updates.'}
                  </p>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      {commonText.upcomingFeatures || 'What to expect:'}
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#ffa11b] rounded-full"></div>
                        <span>{commonText.feature1 || 'Access to all premium AI models'}</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#ffa11b] rounded-full"></div>
                        <span>{commonText.feature2 || 'Unlimited usage'}</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#ffa11b] rounded-full"></div>
                        <span>{commonText.feature3 || 'Priority support'}</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#ffa11b] rounded-full"></div>
                        <span>{commonText.feature4 || 'Advanced code analysis'}</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#ffa11b] rounded-full"></div>
                        <span>{commonText.feature5 || 'Export conversations'}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-2">
                      <div className="text-blue-500 mt-0.5">💡</div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">
                          {commonText.stayUpdatedTitle || 'Stay Updated'}
                        </h4>
                        <p className="text-sm text-blue-700">
                          {commonText.stayUpdatedMessage || 
                            'Follow us on social media or check back regularly for updates on the premium launch!'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffa11b] transition-colors"
                    onClick={onClose}
                  >
                    {commonText.closeButton || 'Close'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-[#ffa11b] px-4 py-2 text-sm font-medium text-white hover:bg-[#f79100] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffa11b] transition-colors"
                    onClick={onClose}
                  >
                    {commonText.gotItButton || 'Got it!'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ComingSoonModal;