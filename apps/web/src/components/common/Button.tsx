import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = true,
  className = '',
  ...props
}) => {
  const baseClasses = 'btn-continue';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type="button"
      className={`${baseClasses} ${widthClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};
