"use client";

import {
  useController,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import type { SelectHTMLAttributes } from "react";

import { Select } from "@/components/common/FormControls";
import { FormError } from "@/components/common/form/FormError";
import { cn } from "@/utils/cn";

export interface FormSelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "name"> {
  name: TName;
  label?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  containerClassName?: string;
  selectClassName?: string;
  errorClassName?: string;
}

export function FormSelect<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  label,
  required = false,
  options,
  containerClassName = "auth-form-group",
  selectClassName = "mhn-select-input",
  errorClassName = "mhn-input-error-msg",
  className,
  id,
  ...selectProps
}: Readonly<FormSelectProps<TFieldValues, TName>>) {
  const { field, fieldState } = useController({ name });
  const inputId = id ?? name;
  const errorId = `${name}-error`;

  return (
    <div className={containerClassName}>
      {label ? (
        <label className="auth-label" htmlFor={inputId}>
          {label}
          {required ? <span className="auth-required-star"> *</span> : null}
        </label>
      ) : null}
      <Select
        {...selectProps}
        {...field}
        id={inputId}
        value={String(field.value ?? "")}
        className={cn(
          selectClassName,
          className,
          fieldState.invalid && "mhn-input-invalid",
        )}
        aria-invalid={fieldState.invalid}
        aria-describedby={fieldState.invalid ? errorId : undefined}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {fieldState.error?.message ? (
        <FormError
          id={errorId}
          message={fieldState.error.message}
          className={errorClassName}
        />
      ) : null}
    </div>
  );
}
