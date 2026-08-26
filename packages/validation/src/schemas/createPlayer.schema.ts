import * as Yup from 'yup';
import { calculateAge } from '@my-hockey-network/core';
import { VALIDATION_MESSAGES } from '../constants/validationMessages';

export interface CreatePlayerFormValues {
  fullName: string;
  dob: string;
  relationship: string;
  email: string;
}

export const createPlayerSchema = Yup.object().shape({
  fullName: Yup.string()
    .trim()
    .required(VALIDATION_MESSAGES.fullNameRequired)
    .min(2, VALIDATION_MESSAGES.fullNameMin)
    .max(50, VALIDATION_MESSAGES.fullNameMax),

  dob: Yup.string()
    .required(VALIDATION_MESSAGES.dobRequired)
    .test('dob-valid', VALIDATION_MESSAGES.invalidDobFormat, (val) => {
      if (!val) return false;
      const age = calculateAge(val);
      if (age === null) return false;
      return age >= 1 && age <= 100;
    }),

  relationship: Yup.string()
    .required(VALIDATION_MESSAGES.relationshipRequired),

  email: Yup.string().when('dob', {
    is: (dobVal: string) => {
      const age = calculateAge(dobVal);
      return age !== null && age >= 13;
    },
    then: (schema) =>
      schema
        .transform((value) => (typeof value === 'string' ? value.replace(/\s+/g, '') : value))
        .trim()
        .required('Player email is required for athletes 13 and older.')
        .email(VALIDATION_MESSAGES.invalidEmail),
    otherwise: (schema) =>
      schema
        .transform((value) => (typeof value === 'string' ? value.replace(/\s+/g, '') : value))
        .trim()
        .optional()
        .test('email-format', VALIDATION_MESSAGES.invalidEmail, (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)),
  }),
});
