import { z } from 'zod';
import { CreatePostAudienceEnum } from '@my-hockey-network/contracts';
import { validateProfileField } from './profileValidation';

import { emailSchema, sixDigitOtpSchema } from './base';

function requiredEmailSchema(requiredMessage: string) {
  return z.string().trim().superRefine((value, context) => {
    if (!value) {
      context.addIssue({ code: 'custom', message: requiredMessage });
      return;
    }
    if (!emailSchema.safeParse(value).success) {
      context.addIssue({ code: 'custom', message: 'Enter a valid email address.' });
    }
  });
}

export const loginFormSchema = z.object({
  email: requiredEmailSchema('Email Address is required.'),
});

export const guardianFormSchema = z.object({
  email: requiredEmailSchema('Parent / Guardian Email is required.'),
});

export const verificationCodeFormSchema = z.object({
  code: sixDigitOtpSchema,
});

export const commentFormSchema = z.object({
  comment: z.string().trim().min(1, 'Write a comment before sending.'),
});

const emailListSchema = z.string().superRefine((value, context) => {
  const invalid = value.split(/[, \n;]+/).map((email) => email.trim()).filter(Boolean)
    .filter((email) => !emailSchema.safeParse(email).success);
  if (invalid.length) context.addIssue({ code: 'custom', message: `Invalid email: ${invalid.join(', ')}` });
});

export const createPostFormSchema = z.object({
  content: z.string(),
  audience: z.enum(CreatePostAudienceEnum),
  shareWithEmails: emailListSchema,
  dontShareWithEmails: emailListSchema,
  locationTag: z.string(),
});

export const editProfileFormSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  displayName: z.string(),
  bio: z.string(),
  city: z.string(),
  dateOfBirth: z.string(),
  position: z.string(),
  shootsCatches: z.string(),
  jerseyNumber: z.string(),
  genderCategory: z.string(),
  preferredLanguage: z.string(),
  defaultVisibility: z.string(),
  avatarUrl: z.string(),
}).superRefine((values, context) => {
  for (const [name, value] of Object.entries(values)) {
    const message = validateProfileField(name, value);
    if (message) context.addIssue({ code: 'custom', path: [name], message });
  }
});

export const supportTicketFormSchema = z.object({
  category: z.string(),
  subject: z.string().trim().min(1, 'Subject is required.').min(5, 'Subject must be at least 5 characters.'),
  description: z.string().trim().min(1, 'Description is required.').min(20, 'Description must be at least 20 characters.'),
});

function parseDisplayDate(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? date
    : null;
}

function ageAt(date: Date, now = new Date()): number {
  let age = now.getUTCFullYear() - date.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < date.getUTCMonth() ||
    (now.getUTCMonth() === date.getUTCMonth() && now.getUTCDate() < date.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export function createAccountFormSchema(selectedRole: string) {
  return z.object({
    fullName: z.string().trim().min(2, 'Full Name must be at least 2 characters.').max(50, 'Full Name cannot be more than 50 characters.'),
    email: requiredEmailSchema('Email Address is required.'),
    dob: z.string().min(1, 'Date of Birth is required.').superRefine((value, context) => {
      const parsed = parseDisplayDate(value);
      if (!parsed) {
        context.addIssue({ code: 'custom', message: 'Please enter a valid date of birth (DD/MM/YYYY).' });
        return;
      }
      const age = ageAt(parsed);
      if (selectedRole.toUpperCase() === 'PARENT' && age < 18) {
        context.addIssue({ code: 'custom', message: 'Parent account holders must be at least 18 years old.' });
      } else if (age < 5) {
        context.addIssue({ code: 'custom', message: `Minimum age for ${selectedRole.toLowerCase()}s is 5 years.` });
      } else if (age > 100) {
        context.addIssue({ code: 'custom', message: 'Maximum age limit is 100 years.' });
      }
    }),
  });
}

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type GuardianFormValues = z.infer<typeof guardianFormSchema>;
export type VerificationCodeFormValues = z.infer<typeof verificationCodeFormSchema>;
export type CommentFormValues = z.infer<typeof commentFormSchema>;
export type CreatePostFormValues = z.infer<typeof createPostFormSchema>;
export type EditProfileFormValues = z.infer<typeof editProfileFormSchema>;
export type SupportTicketFormValues = z.infer<typeof supportTicketFormSchema>;
export type CreateAccountFormValues = z.infer<ReturnType<typeof createAccountFormSchema>>;
