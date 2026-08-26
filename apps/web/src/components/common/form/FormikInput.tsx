import React from 'react';
import { useField } from 'formik';
import { Input, EnhancedInputProps } from '@/components/common/FormControls';
import { FormError } from '@/components/common/form/FormError';

export interface FormikInputProps extends Omit<EnhancedInputProps, 'name'> {
  name: string;
  label?: string;
  required?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  maxLength?: number;
  valueLength?: number;
}

export const FormikInput: React.FC<FormikInputProps> = ({
  name,
  label,
  required = false,
  containerClassName = 'auth-form-group',
  inputClassName = 'auth-input',
  errorClassName = 'mhn-input-error-msg',
  className,
  maxLength,
  valueLength,
  ...props
}) => {
  const [field, meta] = useField(name);
  const showError = meta.touched && Boolean(meta.error);

  const combinedInputClass = `${inputClassName} ${className || ''} ${showError ? 'mhn-input-invalid' : ''}`.trim();
  const errorId = `${name}-error`;

  return (
    <div className={containerClassName}>
      {label && (
        <div className="mhn-dob-header-row">
          <label className="auth-label" htmlFor={props.id || name}>
            {label}
            {required && <span className="auth-required-star"> *</span>}
          </label>
          {maxLength !== undefined && (
            <span className="auth-char-counter">
              {(valueLength ?? String(field.value || '').length)}/{maxLength}
            </span>
          )}
        </div>
      )}
      <Input
        id={props.id || name}
        {...field}
        {...props}
        className={combinedInputClass}
        aria-invalid={showError}
        aria-describedby={showError ? errorId : undefined}
      />
      {showError && <FormError id={errorId} message={meta.error} className={errorClassName} />}
    </div>
  );
};
