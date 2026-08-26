import { forwardRef, useId } from 'react';
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import Image from 'next/image';

import { sanitizeEmailInput, sanitizeNameInput, normalizeNameBlur } from '@my-hockey-network/validation';
import { FormField } from '@/components/common/FormField';

export interface EnhancedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  isNameInput?: boolean;
  isEmailInput?: boolean;
  disableAutoSanitize?: boolean;
}

export const Input = forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      onChange,
      onBlur,
      onKeyDown,
      type,
      id,
      name,
      isNameInput,
      isEmailInput,
      disableAutoSanitize = false,
      ...props
    },
    ref,
  ) => {
    const idLower = String(id || '').toLowerCase();
    const nameLower = String(name || '').toLowerCase();

    const isEmail =
      !disableAutoSanitize &&
      (isEmailInput ||
        type === 'email' ||
        idLower.includes('email') ||
        nameLower.includes('email'));

    const isName =
      !disableAutoSanitize &&
      !isEmail &&
      (isNameInput ||
        idLower.includes('name') ||
        nameLower.includes('name') ||
        idLower.includes('displayname') ||
        nameLower.includes('displayname') ||
        idLower.includes('fullname') ||
        nameLower.includes('fullname') ||
        idLower.includes('firstname') ||
        nameLower.includes('firstname') ||
        idLower.includes('lastname') ||
        nameLower.includes('lastname') ||
        idLower.includes('team') ||
        nameLower.includes('team'));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let rawVal = e.target.value;
      if (isEmail) {
        rawVal = sanitizeEmailInput(rawVal);
        e.target.value = rawVal;
      } else if (isName) {
        rawVal = sanitizeNameInput(rawVal);
        e.target.value = rawVal;
      }
      if (onChange) {
        onChange(e);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const rawVal = e.target.value;
      if (isName) {
        const normalized = normalizeNameBlur(rawVal);
        if (normalized !== rawVal) {
          e.target.value = normalized;
          if (onChange) {
            const syntheticEvent = {
              ...e,
              target: e.target,
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
          }
        }
      }
      if (onBlur) {
        onBlur(e);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isEmail && (e.key === ' ' || e.code === 'Space')) {
        e.preventDefault();
        return;
      }
      onKeyDown?.(e);
    };

    return (
      <input
        ref={ref}
        type={type}
        id={id}
        name={name}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  (props, ref) => <select ref={ref} {...props} />,
);
Select.displayName = 'Select';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: Array<DropdownOption | string>;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string | null;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export function Dropdown({
  label,
  placeholder = 'Select',
  value = '',
  options,
  onChange,
  disabled = false,
  error,
  required = false,
  className = '',
  id,
  name,
}: DropdownProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const normalizedOptions = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  );

  return (
    <FormField label={label} required={required} error={error} className={className} htmlFor={selectId}>
      <div className="mhn-dropdown-wrapper">
        <Select
          id={selectId}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className={`mhn-dropdown-select ${error ? 'mhn-dropdown-error' : ''} ${disabled ? 'mhn-dropdown-disabled' : ''}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {normalizedOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>
        <Image src="/arrowBottom.png" alt="" aria-hidden="true" width={16} height={16} className="mhn-dropdown-arrow-icon" />
      </div>
    </FormField>
  );
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  (props, ref) => <textarea ref={ref} {...props} />,
);
Textarea.displayName = 'Textarea';

export { FormField } from '@/components/common/FormField';
export type { FormFieldProps } from '@/components/common/FormField';
