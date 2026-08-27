import { z } from 'zod';
import { CreatePostAudienceEnum } from '@my-hockey-network/contracts';
import { validateProfileField, validateCareerField } from './profileValidation';

import { emailSchema, nameSchema, sixDigitOtpSchema } from './base';

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

// Reuses validateProfileField (same rules the standalone edit-profile modal already validates
// with) so the inline Profile > About > Intro/Personal Details forms stay behaviorally identical
// after moving from hand-rolled useState + imperative validation onto RHF + Zod.
export const profileIntroFormSchema = z.object({
  bio: z.string(),
  position: z.string(),
  jerseyNumber: z.string(),
}).superRefine((values, context) => {
  for (const name of ['bio', 'jerseyNumber'] as const) {
    const message = validateProfileField(name, values[name]);
    if (message) context.addIssue({ code: 'custom', path: [name], message });
  }
});

export const profilePersonalDetailsFormSchema = z.object({
  city: z.string(),
  dateOfBirth: z.string(),
  genderCategory: z.string(),
}).superRefine((values, context) => {
  for (const name of ['city', 'dateOfBirth'] as const) {
    const message = validateProfileField(name, values[name]);
    if (message) context.addIssue({ code: 'custom', path: [name], message });
  }
});

// Reuses validateCareerField the same way — see profileIntroFormSchema above.
export const careerFormSchema = z.object({
  teamName: z.string(),
  position: z.string(),
  location: z.string(),
  isCurrentPlaying: z.boolean(),
  startMonth: z.string(),
  startYear: z.string(),
  endMonth: z.string(),
  endYear: z.string(),
  note: z.string(),
}).superRefine((values, context) => {
  const alwaysValidated = ['teamName', 'position', 'location', 'note', 'startMonth', 'startYear'] as const;
  for (const name of alwaysValidated) {
    const message = validateCareerField(name, values[name], values);
    if (message) context.addIssue({ code: 'custom', path: [name], message });
  }
  if (!values.isCurrentPlaying) {
    for (const name of ['endMonth', 'endYear'] as const) {
      const message = validateCareerField(name, values[name], values);
      if (message) context.addIssue({ code: 'custom', path: [name], message });
    }
  }
});

export const linkPlayerFormSchema = z.object({
  email: requiredEmailSchema('Enter the player’s email address.'),
});

// DD/MM/YYYY-only age calculation matching packages/core's `calculateAge` for that one format —
// duplicated rather than imported to avoid making `validation` (a leaf package other packages,
// including `core`, may depend on) depend on `core` itself for one small pure function.
function ageFromDdMmYyyy(value: string): number | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, ddStr, mmStr, yyyyStr] = match;
  const dd = Number(ddStr);
  const mm = Number(mmStr);
  const yyyy = Number(yyyyStr);
  const currentYear = new Date().getFullYear();
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31 || yyyy < 1900 || yyyy > currentYear) return null;
  const birthDate = new Date(yyyy, mm - 1, dd);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthday = today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

// Shared "Player Details" form used both by signup's ParentOnboardingModal and by
// Supervision's "+ Add Player" flow (`PlayerDetailsFormFields`) — including the 5–100 year
// age check, which Supervision's form did not previously enforce (see git history for
// `createPlayerDetailsFormSchema`, removed when the two forms were unified).
export const parentOnboardingPlayerDetailsFormSchema = z.object({
  fullName: nameSchema({ max: 49 }),
  dateOfBirth: z.string(),
  guardianRelation: z.enum(['MOTHER', 'FATHER', 'LEGAL_GUARDIAN', 'GRANDPARENT', 'OTHER'], {
    error: 'Relationship to player is required.',
  }),
  email: requiredEmailSchema('Email is required.'),
}).superRefine((values, context) => {
  if (!values.dateOfBirth) {
    context.addIssue({ code: 'custom', path: ['dateOfBirth'], message: 'Date of Birth is required.' });
    return;
  }
  if (values.dateOfBirth.length < 10) {
    context.addIssue({ code: 'custom', path: ['dateOfBirth'], message: 'Please enter a valid Date of Birth (DD/MM/YYYY).' });
    return;
  }
  const age = ageFromDdMmYyyy(values.dateOfBirth);
  if (age === null || age < 0) {
    context.addIssue({ code: 'custom', path: ['dateOfBirth'], message: 'Please enter a valid Date of Birth.' });
  } else if (age < 5) {
    context.addIssue({ code: 'custom', path: ['dateOfBirth'], message: 'Minimum age for player profile is 5 years.' });
  } else if (age > 100) {
    context.addIssue({ code: 'custom', path: ['dateOfBirth'], message: 'Maximum age for player profile is 100 years.' });
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
    fullName: nameSchema(),
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
export type ProfileIntroFormValues = z.infer<typeof profileIntroFormSchema>;
export type ProfilePersonalDetailsFormValues = z.infer<typeof profilePersonalDetailsFormSchema>;
export type CareerFormValues = z.infer<typeof careerFormSchema>;
export type LinkPlayerFormValues = z.infer<typeof linkPlayerFormSchema>;
export type ParentOnboardingPlayerDetailsFormValues = z.infer<typeof parentOnboardingPlayerDetailsFormSchema>;
export type PlayerDetailsFormValues = ParentOnboardingPlayerDetailsFormValues;
export type SupportTicketFormValues = z.infer<typeof supportTicketFormSchema>;
export type CreateAccountFormValues = z.infer<ReturnType<typeof createAccountFormSchema>>;
