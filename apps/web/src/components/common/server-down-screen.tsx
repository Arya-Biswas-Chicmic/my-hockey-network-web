import { Button } from './Button';
import React, { useState } from 'react';

export interface ServerDownScreenProps {
  statusCode?: number;
  message?: string;
  onRetry?: () => void;
}

export const ServerDownScreen: React.FC<ServerDownScreenProps> = ({
  statusCode = 502,
  message = 'The server is currently experiencing downtime or maintenance. Please try again shortly.',
  onRetry,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetryClick = async () => {
    setIsRetrying(true);
    try {
      if (onRetry) {
        await onRetry();
      } else {
        window.location.reload();
      }
    } finally {
      setTimeout(() => setIsRetrying(false), 800);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '44px 36px',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'mhnModalFadeIn 0.3s ease-out',
        }}
      >
        <style>{`
          @keyframes mhnModalFadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes mhnPulseGlow {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
            50% { transform: scale(1.04); box-shadow: 0 0 0 16px rgba(220, 38, 38, 0); }
          }
          @keyframes mhnSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>

        {/* Server Status Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            fontSize: '12px',
            fontWeight: 800,
            padding: '6px 14px',
            borderRadius: '9999px',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          <span style={{ fontSize: '10px' }}>●</span> HTTP {statusCode} SERVER OFFLINE
        </div>

        {/* Server Vector Icon with Pulse Ring */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            animation: 'mhnPulseGlow 2.5s infinite ease-in-out',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
            <line x1="6" y1="6" x2="6.01" y2="6" />
            <line x1="6" y1="18" x2="6.01" y2="18" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        </div>

        {/* Header Title */}
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0 0 12px 0',
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          Server Temporarily Unavailable
        </h2>

        {/* Description Body */}
        <p
          style={{
            fontSize: '15px',
            color: '#64748B',
            margin: '0 0 32px 0',
            lineHeight: '1.6',
            maxWidth: '420px',
          }}
        >
          {message}
        </p>

        {/* Interactive Retry Button */}
        <Button
          onClick={handleRetryClick}
          disabled={isRetrying}
          style={{
            backgroundColor: '#0091FF',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '15px',
            padding: '14px 36px',
            borderRadius: '12px',
            border: 'none',
            cursor: isRetrying ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 4px 14px rgba(0, 145, 255, 0.35)',
            width: '100%',
            maxWidth: '280px',
            opacity: isRetrying ? 0.8 : 1,
          }}
          onMouseOver={(e) => {
            if (!isRetrying) e.currentTarget.style.backgroundColor = '#0077D6';
          }}
          onMouseOut={(e) => {
            if (!isRetrying) e.currentTarget.style.backgroundColor = '#0091FF';
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              animation: isRetrying ? 'mhnSpin 0.8s linear infinite' : 'none',
            }}
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          {isRetrying ? 'Reconnecting...' : 'Retry Connection'}
        </Button>
      </div>
    </div>
  );
};
