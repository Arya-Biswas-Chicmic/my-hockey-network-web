import { Button } from './Button';
import React from 'react';

export interface NoDataFoundProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const NoDataFound: React.FC<NoDataFoundProps> = ({
  title = 'No Data Found',
  description = 'There is currently no information available to display.',
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px border #E2E8F0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        textAlign: 'center',
        maxWidth: '520px',
        margin: '24px auto',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          color: '#64748B',
        }}
      >
        {icon || (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>

      <h3
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#0F172A',
          margin: '0 0 8px 0',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '14px',
          color: '#64748B',
          margin: '0 0 20px 0',
          lineHeight: '1.5',
          maxWidth: '380px',
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          style={{
            backgroundColor: '#0091FF',
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
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0077D6')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0091FF')}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
