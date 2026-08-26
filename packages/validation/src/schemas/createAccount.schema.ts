import * as Yup from 'yup';
import { calculateAge } from '@my-hockey-network/core';
import { VALIDATION_MESSAGES } from '../constants/validationMessages';

export interface CreateAccountFormValues {
  fullName: string;
  email: string;
  dob: string;
}

export const createAccountSchema = (selectedRole = 'PLAYER') =>
  Yup.object().shape({
    fullName: Yup.string()
      .transform((value) => (typeof value === 'string' ? value.replace(/^ +/g, '').replace(/ {2,}/g, ' ') : value))
      .trim()
      .required(VALIDATION_MESSAGES.fullNameRequired)
      .min(2, VALIDATION_MESSAGES.fullNameMin)
      .max(50, VALIDATION_MESSAGES.fullNameMax),

    email: Yup.string()
      .transform((value) => (typeof value === 'string' ? value.replace(/\s+/g, '') : value))
      .trim()
      .required(VALIDATION_MESSAGES.emailRequired)
      .email(VALIDATION_MESSAGES.invalidEmail),

    dob: Yup.string()
      .required(VALIDATION_MESSAGES.dobRequired)
      .test('dob-valid', VALIDATION_MESSAGES.invalidDobFormat, function (value) {
        if (!value) return false;
        const age = calculateAge(value);
        if (age === null) {
          return this.createError({ message: VALIDATION_MESSAGES.invalidDobFormat });
        }

        const normalizedRole = (selectedRole || '').toUpperCase();
        if (normalizedRole === 'PARENT' && age < 18) {
          return this.createError({ message: VALIDATION_MESSAGES.parentMinAge });
        }

        if (normalizedRole !== 'PARENT' && age < 5) {
          const roleLabel = normalizedRole.toLowerCase();
          return this.createError({ message: VALIDATION_MESSAGES.playerMinAge(roleLabel) });
        }

        if (age > 100) {
          return this.createError({ message: VALIDATION_MESSAGES.maxAgeLimit });
        }

        return true;
      }),
  });
