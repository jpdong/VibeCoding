'use client';

import { useEffect, useRef } from 'react';
import { useCommonContext } from '~/context/common-context';

interface BlogPageWrapperProps {
  children: React.ReactNode;
}

export default function BlogPageWrapper({ children }: BlogPageWrapperProps) {
  const { setShowLoadingModal } = useCommonContext();

  const useCustomEffect = (effect: () => void | (() => void), deps: any[]) => {
    const isInitialMount = useRef(true);
    useEffect(() => {
      if (process.env.NODE_ENV === 'production' || isInitialMount.current) {
        isInitialMount.current = false;
        return effect();
      }
    }, deps);
  };

  useCustomEffect(() => {
    setShowLoadingModal(false);
    return () => {
      // Cleanup if needed
    };
  }, []);

  return <>{children}</>;
}