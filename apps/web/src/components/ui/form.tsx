'use client';

import * as React from 'react';
import { Controller, FormProvider, useFormContext } from 'react-hook-form';
import type {
  ControllerProps,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from 'react-hook-form';

import { cn } from '@/utils/cn';

interface FormProps<TFieldValues extends FieldValues>
  extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  methods: UseFormReturn<TFieldValues>;
  onSubmit?: React.ComponentProps<'form'>['onSubmit'];
}

export function Form<TFieldValues extends FieldValues>({
  methods,
  children,
  onSubmit,
  ...formProps
}: Readonly<FormProps<TFieldValues>>) {
  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} {...formProps}>{children}</form>
    </FormProvider>
  );
}

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = { name: TName };

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);
const FormItemContext = React.createContext<{ id: string }>({ id: '' });

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: Readonly<ControllerProps<TFieldValues, TName>>) {
  const contextValue = React.useMemo(() => ({ name: props.name }), [props.name]);
  return (
    <FormFieldContext.Provider value={contextValue}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext.name) throw new Error('useFormField must be used inside FormField.');

  return {
    ...fieldState,
    id: itemContext.id,
    name: fieldContext.name,
    formItemId: `${itemContext.id}-form-item`,
    formDescriptionId: `${itemContext.id}-form-description`,
    formMessageId: `${itemContext.id}-form-message`,
  };
}

export function FormItem({ className, ...props }: Readonly<React.ComponentProps<'div'>>) {
  const id = React.useId();
  const value = React.useMemo(() => ({ id }), [id]);
  return (
    <FormItemContext.Provider value={value}>
      <div className={cn('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  );
}

export function FormLabel({ className, ...props }: Readonly<React.ComponentProps<'label'>>) {
  const { error, formItemId } = useFormField();
  return <label className={cn(error && 'text-destructive', className)} htmlFor={formItemId} {...props} />;
}

export function FormControl({ children }: Readonly<{ children: React.ReactElement }>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return React.cloneElement(children, {
    id: formItemId,
    'aria-describedby': error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId,
    'aria-invalid': Boolean(error),
  } as React.HTMLAttributes<HTMLElement>);
}

export function FormDescription({ className, ...props }: Readonly<React.ComponentProps<'p'>>) {
  const { formDescriptionId } = useFormField();
  return <p id={formDescriptionId} className={cn('text-xs text-muted-foreground', className)} {...props} />;
}

export function FormMessage({ className, children, ...props }: Readonly<React.ComponentProps<'p'>>) {
  const { error, formMessageId } = useFormField();
  const message = error ? String(error.message ?? '') : children;
  if (!message) return null;
  return <p id={formMessageId} className={cn('text-xs font-medium text-destructive', className)} {...props}>{message}</p>;
}
