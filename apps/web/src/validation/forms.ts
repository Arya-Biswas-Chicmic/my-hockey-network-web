import { calculateAge } from '@my-hockey-network/core';
import { emailSchema } from '@my-hockey-network/validation';

export interface EmailFormValues {
  email: string;
}

export interface CreateAccountValues extends EmailFormValues {
  fullName: string;
  dob: string;
}

export interface SupportTicketValues {
  category: string;
  subject: string;
  description: string;
}

function emailError(value: string, requiredMessage: string): string | undefined {
  if (!value.trim()) return requiredMessage;
  const result = emailSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export function validateLoginForm(values: EmailFormValues): Partial<EmailFormValues> {
  const error = emailError(values.email, 'Email Address is required.');
  return error ? { email: error } : {};
}

export function validateGuardianForm(values: EmailFormValues): Partial<EmailFormValues> {
  const error = emailError(values.email, 'Parent / Guardian Email is required.');
  return error ? { email: error } : {};
}

export function validateCreateAccountForm(
  values: CreateAccountValues,
  selectedRole: string,
): Partial<CreateAccountValues> {
  const errors: Partial<CreateAccountValues> = {};
  const name = values.fullName.trim();
  if (!name) errors.fullName = 'Full Name is required.';
  else if (name.length < 2) errors.fullName = 'Full Name must be at least 2 characters.';
  else if (name.length > 50) errors.fullName = 'Full Name cannot be more than 50 characters.';

  errors.email = emailError(values.email, 'Email Address is required.');

  if (!values.dob.trim()) {
    errors.dob = 'Date of Birth is required.';
  } else {
    const age = calculateAge(values.dob);
    if (age === null) errors.dob = 'Please enter a valid date of birth (DD/MM/YYYY).';
    else if (selectedRole.toUpperCase() === 'PARENT' && age < 18) {
      errors.dob = 'Parent account holders must be at least 18 years old.';
    } else if (age < 5) {
      errors.dob = `Minimum age for ${selectedRole.toLowerCase()}s is 5 years.`;
    } else if (age > 100) {
      errors.dob = 'Maximum age limit is 100 years.';
    }
  }

  if (!errors.email) delete errors.email;
  return errors;
}

export function validateSupportTicketForm(
  values: SupportTicketValues,
): Partial<SupportTicketValues> {
  const errors: Partial<SupportTicketValues> = {};
  if (!values.subject.trim()) errors.subject = 'Subject is required.';
  else if (values.subject.trim().length < 5) errors.subject = 'Subject must be at least 5 characters.';
  if (!values.description.trim()) errors.description = 'Description is required.';
  else if (values.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters.';
  }
  return errors;
}
