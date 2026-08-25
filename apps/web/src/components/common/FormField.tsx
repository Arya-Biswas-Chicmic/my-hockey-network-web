import React from 'react';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string | null;
  helperText?: string;
  className?: string;
  style?: React.CSSProperties;
  maxLength?: number;
  valueLength?: number;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  helperText,
  className = '',
  style,
  maxLength,
  valueLength,
  children,
}) => {
  const maxLengthError =
    maxLength && valueLength !== undefined && valueLength >= maxLength
      ? `Maximum ${maxLength} characters allowed.`
      : null;
  const activeError = error || maxLengthError;

  return (
    <div className={`mhn-form-field-group ${className}`} style={style}>
      {label && (
        <label className="mhn-form-field-label">
          {label}
          {required && <span className="mhn-form-field-required">*</span>}
          {helperText && <span className="mhn-form-field-helper"> ({helperText})</span>}
        </label>
      )}
      <div className="mhn-form-field-input-wrapper">
        {children}
        {activeError && (
          <div className="mhn-edit-profile-field-error">
            <span>⚠️</span>
            <span>{activeError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
