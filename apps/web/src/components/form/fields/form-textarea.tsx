'use client';

import { useController, type FieldPath, type FieldValues } from 'react-hook-form';
import type { TextareaHTMLAttributes } from 'react';

import { Textarea } from '@/components/common/FormControls';
import { FormError } from '@/components/common/form/FormError';
import { cn } from '@/utils/cn';

export interface FormTextareaProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  name: TName;
  label?: string;
  containerClassName?: string;
  textareaClassName?: string;
  errorClassName?: string;
}

export function FormTextarea<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  label,
  containerClassName,
  textareaClassName,
  errorClassName = 'mhn-edit-profile-field-error',
  className,
  id,
  ...textareaProps
}: Readonly<FormTextareaProps<TFieldValues, TName>>) {
  const { field, fieldState } = useController({ name });
  const inputId = id ?? name;
  const errorId = `${name}-error`;
  return (
    <div className={containerClassName}>
      {label ? <label className="mhn-form-label-block" htmlFor={inputId}>{label}</label> : null}
      <Textarea
        {...textareaProps}
        {...field}
        id={inputId}
        value={String(field.value ?? '')}
        className={cn(textareaClassName, className, fieldState.invalid && 'mhn-input-invalid')}
        aria-invalid={fieldState.invalid}
        aria-describedby={fieldState.invalid ? errorId : undefined}
      />
      {fieldState.error?.message ? <FormError id={errorId} message={fieldState.error.message} className={errorClassName} /> : null}
    </div>
  );
}
