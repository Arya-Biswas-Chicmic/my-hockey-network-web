import * as Yup from 'yup';
import { calculateAge } from '@my-hockey-network/core';
import { VALIDATION_MESSAGES } from '../constants/validationMessages';

export interface EditProfileFormValues {
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  city: string;
  dateOfBirth: string;
  jerseyNumber: string;
  genderCategory?: string;
  gender?: string;
  position: string;
}

export const editProfileSchema = Yup.object().shape({
  displayName: Yup.string()
    .trim()
    .required(VALIDATION_MESSAGES.fullNameRequired)
    .min(2, VALIDATION_MESSAGES.fullNameMin)
    .max(50, VALIDATION_MESSAGES.fullNameMax),

  firstName: Yup.string()
    .trim()
    .optional()
    .test('first-name-length', VALIDATION_MESSAGES.fullNameMin, (val) => !val || val.trim().length >= 2)
    .max(50, VALIDATION_MESSAGES.fullNameMax),

  lastName: Yup.string()
    .trim()
    .optional()
    .test('last-name-length', VALIDATION_MESSAGES.fullNameMin, (val) => !val || val.trim().length >= 2)
    .max(50, VALIDATION_MESSAGES.fullNameMax),

  city: Yup.string()
    .trim()
    .optional()
    .max(50, VALIDATION_MESSAGES.nameMax('City')),

  bio: Yup.string()
    .trim()
    .optional()
    .max(300, VALIDATION_MESSAGES.bioMax),

  jerseyNumber: Yup.string()
    .trim()
    .optional()
    .test('jersey-number-valid', VALIDATION_MESSAGES.jerseyNumberInvalid, (val) => {
      if (!val || !val.trim()) return true;
      const num = Number(val.trim());
      return !isNaN(num) && num >= 0 && num <= 99 && Number.isInteger(num);
    }),

  dateOfBirth: Yup.string()
    .optional()
    .test('dob-valid', VALIDATION_MESSAGES.invalidDobFormat, (val) => {
      if (!val || !val.trim()) return true;
      const age = calculateAge(val);
      if (age === null) return false;
      return age >= 5 && age <= 100;
    }),

  gender: Yup.string().optional(),
  position: Yup.string().optional(),
});
