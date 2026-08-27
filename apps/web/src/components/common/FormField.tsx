import React, { useId } from 'react';

import { FormError } from '@/components/common/form/FormError';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string | null;
  helperText?: string;
  className?: string;
  htmlFor?: string;
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
  htmlFor,
  maxLength,
  valueLength,
  children,
}) => {
  const generatedId = useId();
  const fieldId = htmlFor ?? generatedId;
  const errorId = `${fieldId}-error`;
  const maxLengthError =
    maxLength && valueLength !== undefined && valueLength >= maxLength
      ? `Maximum ${maxLength} characters allowed.`
      : null;
  const activeError = error || maxLengthError;
  const isDirectControl =
    React.isValidElement<Record<string, unknown>>(children) &&
    (typeof children.type !== 'string' || ['input', 'select', 'textarea'].includes(children.type));
  const control = isDirectControl
    ? React.cloneElement(children, {
        id: children.props.id ?? fieldId,
        'aria-invalid': Boolean(activeError),
        'aria-describedby': activeError ? errorId : children.props['aria-describedby'],
      })
    : children;

  return (
    <div className={`mhn-form-field-group ${className}`}>
      {label && (
        <label className="mhn-form-field-label" htmlFor={fieldId}>
          {label}
          {required && <span className="mhn-form-field-required">*</span>}
          {helperText && <span className="mhn-form-field-helper"> ({helperText})</span>}
        </label>
      )}
      <div className="mhn-form-field-input-wrapper">
        {control}
        <FormError id={errorId} message={activeError} className="mhn-edit-profile-field-error" />
      </div>
    </div>
  );
};
