import React from 'react';

interface FormErrorProps {
  id?: string;
  message?: string | null;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ id, message, className = 'mhn-input-error-msg' }) => {
  if (!message) return null;

  return (
    <div id={id} role="alert" className={className}>
      {message}
    </div>
  );
};
