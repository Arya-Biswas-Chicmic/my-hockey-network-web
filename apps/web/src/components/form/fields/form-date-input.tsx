'use client';

import { useMemo } from 'react';
import { useController, type FieldPath, type FieldValues } from 'react-hook-form';

import { calculateAge } from '@my-hockey-network/core';
import { Input } from '@/components/common/FormControls';
import { FormError } from '@/components/common/form/FormError';
import { formatDobInput } from '@/utils/guardianUtils';
import { DatePickerButton } from '@/components/ui/date-picker-button';

export interface FormDateInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  name: TName;
  label?: string;
  required?: boolean;
  placeholder?: string;
  showAgeBadge?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  id?: string;
}

export function FormDateInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  label = 'Date of Birth',
  required = false,
  placeholder = 'DD/MM/YYYY',
  showAgeBadge = true,
  containerClassName = 'auth-form-group',
  inputClassName = 'auth-input',
  errorClassName = 'mhn-input-error-msg',
  id,
}: Readonly<FormDateInputProps<TFieldValues, TName>>) {
  const { field: { name: fieldName, ref, value: fieldValue, onChange, onBlur }, fieldState } = useController({ name });
  const value = String(fieldValue ?? '');
  const currentAge = useMemo(() => showAgeBadge ? calculateAge(value) : null, [showAgeBadge, value]);
  const inputId = id ?? name;
  const errorId = `${name}-error`;

  const handleDateSelected = (isoDate: string) => {
    const [year, month, day] = isoDate.split('-');
    if (year && month && day) onChange(`${day}/${month}/${year}`);
  };

  return (
    <div className={containerClassName}>
      <div className="mhn-dob-header-row">
        {label ? <label className="auth-label" htmlFor={inputId}>{label}{required ? <span className="auth-required-star"> *</span> : null}</label> : null}
        {showAgeBadge && currentAge !== null && currentAge >= 0 && currentAge <= 110 ? (
          <span className={currentAge < 18 ? 'mhn-age-badge-under18' : 'mhn-age-badge-adult'}>
            Age: {currentAge} yrs {currentAge < 18 ? '(Under 18)' : ''}
          </span>
        ) : showAgeBadge && value.length === 10 ? <span className="mhn-age-badge-invalid">Invalid Date</span> : null}
      </div>
      <div className="auth-input-wrapper mhn-relative-container">
        <Input
          id={inputId}
          name={fieldName}
          ref={ref}
          type="text"
          value={value}
          onChange={(event) => onChange(formatDobInput(event.target.value))}
          onBlur={onBlur}
          maxLength={10}
          placeholder={placeholder}
          className={`${inputClassName} ${fieldState.invalid ? 'mhn-input-invalid' : ''}`.trim()}
          aria-invalid={fieldState.invalid}
          aria-describedby={fieldState.invalid ? errorId : undefined}
        />
        <DatePickerButton
          className="auth-input-icon auth-input-icon-clickable mhn-cursor-pointer"
          onDateSelected={handleDateSelected}
        />
      </div>
      {fieldState.error?.message ? <FormError id={errorId} message={fieldState.error.message} className={errorClassName} /> : null}
    </div>
  );
}
