import { forwardRef } from 'react';
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

import { sanitizeEmailInput, sanitizeNameInput, normalizeNameBlur } from '@my-hockey-network/validation';

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
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
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

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  (props, ref) => <textarea ref={ref} {...props} />,
);
Textarea.displayName = 'Textarea';

export { Dropdown } from './Dropdown';
export type { DropdownProps, DropdownOption } from './Dropdown';
export { FormField } from './FormField';
export type { FormFieldProps } from './FormField';
