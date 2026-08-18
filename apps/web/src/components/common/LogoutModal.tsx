import React from 'react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="mhn-modal-overlay">
      <div
        className="mhn-modal-card"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '420px',
          padding: '24px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
          border: '1px solid #E2E8F0',
          animation: 'mhnPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
            Log Out
          </h3>
          {!isLoading && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '22px',
                color: '#64748B',
                cursor: 'pointer',
                lineHeight: 1,
              }}
              aria-label="Close modal"
            >
              &times;
            </button>
          )}
        </div>

        {/* Modal Body */}
        <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, margin: '0 0 24px 0' }}>
          Are you sure you want to log out? You will need to sign in again to access your account.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              fontWeight: 600,
              fontSize: '14px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '14px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isLoading ? 0.8 : 1,
            }}
          >
            {isLoading ? (
              <>
                <svg className="mhn-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" fill="currentColor" />
                </svg>
                <span>Logging out...</span>
              </>
            ) : (
              'Log Out'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
