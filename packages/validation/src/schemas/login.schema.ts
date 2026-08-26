import * as Yup from 'yup';
import { VALIDATION_MESSAGES } from '../constants/validationMessages';

export interface LoginFormValues {
  email: string;
  otp?: string;
}

export const loginSchema = (otpRequested = false) =>
  Yup.object().shape({
    email: Yup.string()
      .transform((value) => (typeof value === 'string' ? value.replace(/\s+/g, '') : value))
      .trim()
      .required(VALIDATION_MESSAGES.emailRequired)
      .email(VALIDATION_MESSAGES.invalidEmail),

    otp: Yup.string().when([], {
      is: () => otpRequested,
      then: (schema) =>
        schema
          .required(VALIDATION_MESSAGES.otpRequired)
          .matches(/^\d{4,8}$/, VALIDATION_MESSAGES.invalidOtp),
      otherwise: (schema) => schema.optional(),
    }),
  });
