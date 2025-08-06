'use client'
import React from 'react';
import TurnstileWidget, { TurnstileRef } from '~/components/TurnstileWidget';
import { ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SecurityVerificationProps {
  turnstileRef: React.RefObject<TurnstileRef>;
  onVerify: (token: string) => void;
  onError: () => void;
  onExpire: () => void;
  pendingGeneration: boolean;
  commonText: any;
}

const SecurityVerification: React.FC<SecurityVerificationProps> = ({
  turnstileRef,
  onVerify,
  onError,
  onExpire,
  pendingGeneration,
  commonText
}) => {
  return (
    <div className="flex justify-center mb-4">
      <div className="max-w-md bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
          </div>
          
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Security Verification Required
          </h3>
          
          <p className="text-sm text-blue-700 mb-4">
            {pendingGeneration
              ? "Please complete security verification to get your answer:"
              : commonText.securityVerificationText || "Please complete the security verification:"}
          </p>
          
          {/* Turnstile Widget */}
          <div className="flex justify-center mb-3">
            <TurnstileWidget
              ref={turnstileRef}
              onVerify={onVerify}
              onError={onError}
              onExpire={onExpire}
            />
          </div>
          
          {pendingGeneration && (
            <p className="text-xs text-blue-600">
              Your request will be processed automatically after verification
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityVerification;