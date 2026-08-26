'use client';

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils/cn';

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        unstyled: '',
        primary: 'btn-continue',
        secondary: 'mhn-ui-button mhn-ui-button--secondary',
        outline: 'mhn-ui-button mhn-ui-button--outline',
        danger: 'mhn-ui-button mhn-ui-button--danger',
        icon: 'mhn-ui-button mhn-ui-button--icon',
        link: 'mhn-ui-button mhn-ui-button--link',
        // Pure Tailwind/shadcn-token variants for new screens (see
        // docs/COMPONENT_CATALOG.md) — prefer these over the legacy
        // `.mhn-ui-button*`-backed variants above in new code.
        solid: 'rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:bg-primary/90',
        'solid-outline': 'rounded-lg border border-border bg-background px-5 py-2.5 font-medium text-foreground hover:bg-muted',
      },
      size: {
        default: '',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-11 px-6',
        icon: 'size-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'unstyled',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  children: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant,
      size,
      fullWidth = false,
      loading = false,
      isLoading = false,
      className,
      disabled,
      onClick,
      type = 'button',
      ...buttonProps
    },
    ref,
  ) => {
    const busy = loading || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), fullWidth && 'w-full', className)}
        aria-busy={busy || undefined}
        disabled={disabled || busy}
        onClick={onClick}
        {...buttonProps}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
