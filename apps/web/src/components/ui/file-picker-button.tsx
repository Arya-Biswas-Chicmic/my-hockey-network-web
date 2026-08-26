'use client';

import { useRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

import { Button, type ButtonProps } from '@/components/ui/button';

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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenPicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) onFilesSelected(files);
    event.target.value = '';
  };

  return (
    <>
      <Button {...buttonProps} type="button" disabled={disabled} onClick={handleOpenPicker}>
        {children}
      </Button>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        accept={accept}
        multiple={multiple}
        capture={capture}
        disabled={disabled}
        onChange={handleFileChange}
      />
    </>
  );
}
