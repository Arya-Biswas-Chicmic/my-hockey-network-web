import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'unstyled' | 'primary' | 'secondary' | 'outline' | 'danger' | 'icon' | 'link';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  unstyled: '',
  primary: 'btn-continue',
  secondary: 'mhn-ui-button mhn-ui-button--secondary',
  outline: 'mhn-ui-button mhn-ui-button--outline',
  danger: 'mhn-ui-button mhn-ui-button--danger',
  icon: 'mhn-ui-button mhn-ui-button--icon',
  link: 'mhn-ui-button mhn-ui-button--link',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'unstyled',
      fullWidth = false,
      loading = false,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={[variantClasses[variant], fullWidth ? 'w-full' : '', className].filter(Boolean).join(' ')}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
