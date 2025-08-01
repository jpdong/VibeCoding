'use client'
import { Turnstile } from '@marsidev/react-turnstile'
import { useRef, forwardRef, useImperativeHandle } from 'react'

export interface TurnstileRef {
  getToken: () => string | null;
  reset: () => void;
}

interface TurnstileWidgetProps {
  onVerify?: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

const TurnstileWidget = forwardRef<TurnstileRef, TurnstileWidgetProps>(
  ({ onVerify, onError, onExpire }, ref) => {
    const turnstileRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      getToken: () => {
        return turnstileRef.current?.getResponse() || null;
      },
      reset: () => {
        turnstileRef.current?.reset();
      }
    }));

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      console.error('Turnstile site key not configured');
      return null;
    }

    return (
      <div className="flex justify-center my-4">
        <Turnstile
          ref={turnstileRef}
          siteKey={siteKey}
          onSuccess={onVerify}
          onError={onError}
          onExpire={onExpire}
          options={{
            theme: 'light',
            size: 'normal',
          }}
        />
      </div>
    );
  }
);

TurnstileWidget.displayName = 'TurnstileWidget';

export default TurnstileWidget;