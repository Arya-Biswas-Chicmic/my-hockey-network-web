'use client';

import { useId, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

import { buttonVariants, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export interface FilePickerButtonProps {
  accept?: InputHTMLAttributes<HTMLInputElement>['accept'];
  multiple?: boolean;
  capture?: boolean | 'user' | 'environment';
  disabled?: boolean;
  children: ReactNode;
  buttonProps?: Omit<ButtonProps, 'children' | 'disabled' | 'onClick' | 'type'>;
  onFilesSelected: (files: File[]) => void;
}

export function FilePickerButton({
  accept,
  multiple = false,
  capture,
  disabled = false,
  children,
  buttonProps,
  onFilesSelected,
}: Readonly<FilePickerButtonProps>) {
  const inputId = useId();
  const [inputKey, setInputKey] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    if (files.length > 0) onFilesSelected(files);
    setInputKey((current) => current + 1);
  };

  const { className, title, 'aria-label': ariaLabel } = buttonProps ?? {};

  return (
    <label
      htmlFor={inputId}
      title={title}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn(
        buttonVariants({ variant: buttonProps?.variant, size: buttonProps?.size }),
        buttonProps?.fullWidth && 'w-full',
        className,
        disabled && 'pointer-events-none opacity-50',
      )}
    >
        {children}
      <input
        key={inputKey}
        id={inputId}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        capture={capture}
        disabled={disabled}
        onChange={handleFileChange}
      />
    </label>
  );
}
