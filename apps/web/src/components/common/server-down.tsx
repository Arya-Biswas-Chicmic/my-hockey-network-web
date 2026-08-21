import React from 'react';

export interface ServerDownProps {
  title?: string;
  description?: string;
  statusCode?: number;
  onRetry?: () => void;
}

export const ServerDown: React.FC<ServerDownProps> = ({
  title = 'Server Currently Unavailable',
  description = 'We are having trouble communicating with the server. Please check your internet connection or try again shortly.',
  statusCode = 502,
  onRetry,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        backgroundColor: '#FEF2F2',
        borderRadius: '16px',
        border: '1px solid #FECACA',
        textAlign: 'center',
        maxWidth: '540px',
        margin: '24px auto',
        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.05)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
          fontSize: '12px',
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: '9999px',
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <span>●</span> {statusCode} Server Error
      </div>

      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#FEE2E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          color: '#DC2626',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </div>

      <h3
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#991B1B',
          margin: '0 0 8px 0',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '14px',
          color: '#B91C1C',
          margin: '0 0 24px 0',
          lineHeight: '1.5',
          maxWidth: '400px',
        }}
      >
        {description}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '14px',
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#B91C1C')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#DC2626')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Retry Connection
        </button>
      )}
    </div>
  );
};
