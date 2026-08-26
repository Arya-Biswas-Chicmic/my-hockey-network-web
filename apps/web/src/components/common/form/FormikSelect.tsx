import React from 'react';
import { useField } from 'formik';
import { Select } from '@/components/common/FormControls';
import { FormError } from '@/components/common/form/FormError';
import type { SelectHTMLAttributes } from 'react';

export interface FormikSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  name: string;
  label?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  containerClassName?: string;
  selectClassName?: string;
  errorClassName?: string;
}

export const FormikSelect: React.FC<FormikSelectProps> = ({
  name,
  label,
  required = false,
  options,
  containerClassName = 'auth-form-group',
  selectClassName = 'mhn-select-input',
  errorClassName = 'mhn-input-error-msg',
  className,
  ...props
}) => {
  const [field, meta] = useField(name);
  const showError = meta.touched && Boolean(meta.error);

  const combinedSelectClass = `${selectClassName} ${className || ''} ${showError ? 'mhn-input-invalid' : ''}`.trim();
  const errorId = `${name}-error`;

  return (
    <div className={containerClassName}>
      {label && (
        <label className="auth-label" htmlFor={props.id || name}>
          {label}
          {required && <span className="auth-required-star"> *</span>}
        </label>
      )}
      <Select
        id={props.id || name}
        {...field}
        {...props}
        className={combinedSelectClass}
        aria-invalid={showError}
        aria-describedby={showError ? errorId : undefined}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
      {showError && <FormError id={errorId} message={meta.error} className={errorClassName} />}
    </div>
  );
};
