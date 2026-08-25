import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'sm', color = 'currentColor' }) => {
  const dimensions = size === 'sm' ? '16px' : size === 'lg' ? '36px' : '24px';
  const borderWidth = size === 'sm' ? '2.5px' : '3px';

  return (
    <span
      className={`mhn-spinner-ring mhn-spinner-${size}`}
    />
  );
};
