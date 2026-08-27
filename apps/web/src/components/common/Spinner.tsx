import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  /** @deprecated The spinner now inherits its app-wide theme color. */
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'sm' }) => {
  return (
    <span
      className={`mhn-spinner-ring mhn-spinner-${size}`}
    />
  );
};
