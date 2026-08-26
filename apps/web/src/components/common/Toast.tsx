import { Button } from '@/components/common/Button';
import React, { useEffect } from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  onClose: () => void;
  duration?: number;
  actionText?: string;
  onActionClick?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  duration = 5000,
  actionText,
  onActionClick,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    if (type === 'success') {
      return <CheckCircle2 size={20} color="#16A34A" strokeWidth={2.5} />;
    }
    if (type === 'error') {
      return <XCircle size={20} color="#DC2626" strokeWidth={2.5} />;
    }
    return <Info size={20} color="#2563EB" strokeWidth={2.5} />;
  };

  return (
    <div className={`mhn-toast-container mhn-toast-${type}`}>
      <div className="mhn-toast-icon">{getIcon()}</div>
      <span className="mhn-toast-message">{message}</span>
      {actionText && onActionClick && (
        <Button
          type="button"
          className="mhn-toast-action-btn"
          onClick={() => {
            onActionClick();
            onClose();
          }}
        >
          {actionText}
        </Button>
      )}
      <Button className="mhn-toast-close-btn" onClick={onClose} aria-label="Close notification">
        &times;
      </Button>
    </div>
  );
};
