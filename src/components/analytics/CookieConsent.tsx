'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 检查用户是否已经做过选择
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
    
    // 更新Google Analytics同意状态
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': 'granted',
        'analytics_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });
    }
  };

  const rejectCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowBanner(false);
    
    // 更新Google Analytics同意状态（只允许基本分析）
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': 'denied',
        'analytics_storage': 'granted', // 基本分析仍然允许
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
    }
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#fff',
      padding: '20px',
      boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <span style={{ maxWidth: '70%' }}>
        This website uses cookies for analytics and ad personalization. Please agree to our collection of your data to improve your experience.
      </span>
      <div>
        <button
          onClick={acceptCookies}
          style={{
            marginRight: '10px',
            backgroundColor: '#165DFF',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          Accept All
        </button>
        <button
          onClick={rejectCookies}
          style={{
            backgroundColor: '#f5f5f5',
            color: '#333',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          Necessary Only
        </button>
      </div>
    </div>
  );
}
