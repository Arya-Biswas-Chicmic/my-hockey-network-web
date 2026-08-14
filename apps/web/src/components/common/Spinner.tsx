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
      className="mhn-spinner-ring"
      style={{
        display: 'inline-block',
        width: dimensions,
        height: dimensions,
        border: `${borderWidth} solid rgba(255, 255, 255, 0.35)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'mhn-spin 0.6s linear infinite',
        verticalAlign: 'middle',
      }}
    />
  );
};
