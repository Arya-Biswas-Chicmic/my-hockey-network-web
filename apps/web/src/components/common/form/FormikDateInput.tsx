import React, { useRef } from 'react';
import { useField, useFormikContext } from 'formik';
import { Input } from '../FormControls';
import { FormError } from './FormError';
import { calculateAge } from '@my-hockey-network/core';
import { formatDobInput } from '../../../utils/guardianUtils';

export interface FormikDateInputProps {
  name: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  showAgeBadge?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  id?: string;
}

export const FormikDateInput: React.FC<FormikDateInputProps> = ({
  name,
  label = 'Date of Birth',
  required = false,
  placeholder = 'DD/MM/YYYY',
  showAgeBadge = true,
  containerClassName = 'auth-form-group',
  inputClassName = 'auth-input',
  errorClassName = 'mhn-input-error-msg',
  id,
}) => {
  const [field, meta, helpers] = useField(name);
  const { setFieldTouched } = useFormikContext();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const showError = meta.touched && Boolean(meta.error);
  const errorId = `${name}-error`;
  const currentVal = field.value || '';
  const currentAge = showAgeBadge ? calculateAge(currentVal) : null;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDobInput(e.target.value);
    helpers.setValue(formatted);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    field.onBlur(e);
    setFieldTouched(name, true, true);
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.click();
      }
    }
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value;
    if (dateVal) {
      const parts = dateVal.split('-');
      if (parts.length === 3) {
        const [yyyy, mm, dd] = parts;
        helpers.setValue(`${dd}/${mm}/${yyyy}`);
        setFieldTouched(name, true, true);
      }
    }
  };

  return (
    <div className={containerClassName}>
      <div className="mhn-dob-header-row">
        {label && (
          <label className="auth-label" htmlFor={id || name}>
            {label}
            {required && <span className="auth-required-star"> *</span>}
          </label>
        )}
        {showAgeBadge && (
          <>
            {currentAge !== null && currentAge >= 0 && currentAge <= 110 ? (
              <span className={currentAge < 18 ? 'mhn-age-badge-under18' : 'mhn-age-badge-adult'}>
                Age: {currentAge} yrs {currentAge < 18 ? '(Under 18)' : ''}
              </span>
            ) : currentVal.length === 10 ? (
              <span className="mhn-age-badge-invalid">Invalid Date</span>
            ) : null}
          </>
        )}
      </div>

      <div className="auth-input-wrapper mhn-relative-container">
        <Input
          id={id || name}
          type="text"
          name={field.name}
          value={field.value}
          onChange={handleTextChange}
          onBlur={handleBlur}
          maxLength={10}
          placeholder={placeholder}
          className={`${inputClassName} ${showError ? 'mhn-input-invalid' : ''}`.trim()}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
        />
        <img
          src="/calendar.png"
          alt="Calendar"
          className="auth-input-icon auth-input-icon-clickable mhn-cursor-pointer"
          onClick={handleCalendarClick}
        />
        <Input
          type="date"
          ref={dateInputRef}
          onChange={handleNativeDateChange}
          className="mhn-date-picker-hidden"
          tabIndex={-1}
        />
      </div>

      {showError && <FormError id={errorId} message={meta.error} className={errorClassName} />}
    </div>
  );
};
