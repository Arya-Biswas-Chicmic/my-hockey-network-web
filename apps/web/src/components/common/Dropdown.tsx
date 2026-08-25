import React from 'react';
import { FormField } from './FormField';

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
  style?: React.CSSProperties;
  id?: string;
  name?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder = 'Select',
  value = '',
  options,
  onChange,
  disabled = false,
  error,
  required = false,
  className = '',
  style,
  id,
  name,
}) => {
  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  return (
    <FormField label={label} required={required} error={error} className={className}>
      <div className="mhn-dropdown-wrapper" style={style}>
        <select
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`mhn-dropdown-select ${error ? 'mhn-dropdown-error' : ''} ${disabled ? 'mhn-dropdown-disabled' : ''}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <img
          src="/arrowBottom.png"
          alt=""
          aria-hidden="true"
          className="mhn-dropdown-arrow-icon"
        />
      </div>
    </FormField>
  );
};
