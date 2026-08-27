'use client';

import type { FieldPath, FieldValues } from 'react-hook-form';

import { Input, type EnhancedInputProps } from '@/components/common/FormControls';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/utils/cn';

export interface FormInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends Omit<EnhancedInputProps, 'name'> {
  name: TName;
  label?: string;
  required?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
  /**
   * Suppress the shared FormMessage render for this field. Use only when the
   * consuming form renders its own single error affordance (e.g. a styled
   * tooltip) for the same field, to avoid announcing/displaying the error twice.
   */
  hideMessage?: boolean;
}

export function FormInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  label,
  required = false,
  containerClassName = 'auth-form-group',
  inputClassName = 'auth-input',
  errorClassName = 'mhn-input-error-msg',
  className,
  maxLength,
  showCharacterCount = true,
  hideMessage = false,
  ...inputProps
}: Readonly<FormInputProps<TFieldValues, TName>>) {
  return (
    <FormField
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={containerClassName}>
          {label ? (
            <div className="mhn-dob-header-row">
              <FormLabel className="auth-label">
                {label}{required ? <span className="auth-required-star" aria-hidden="true"> *</span> : null}
              </FormLabel>
              {maxLength !== undefined && showCharacterCount ? (
                <span className="auth-char-counter">{String(field.value ?? '').length}/{maxLength}</span>
              ) : null}
            </div>
          ) : null}
          <FormControl>
            <Input
              {...inputProps}
              {...field}
              onValueChange={(nextValue) => field.onChange(nextValue)}
              value={String(field.value ?? '')}
              maxLength={maxLength}
              className={cn(inputClassName, className, fieldState.invalid && 'mhn-input-invalid')}
            />
          </FormControl>
          {hideMessage ? null : <FormMessage className={errorClassName} />}
        </FormItem>
      )}
    />
  );
}
