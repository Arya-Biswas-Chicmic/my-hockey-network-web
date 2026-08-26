import * as Yup from 'yup';
import { VALIDATION_MESSAGES } from '../constants/validationMessages';

export interface GuardianApprovalFormValues {
  guardianName: string;
  guardianEmail: string;
  relationship: string;
  otp: string;
}

export const guardianApprovalSchema = Yup.object().shape({
  guardianName: Yup.string()
    .trim()
    .required(VALIDATION_MESSAGES.fullNameRequired)
    .min(2, VALIDATION_MESSAGES.fullNameMin)
    .max(50, VALIDATION_MESSAGES.fullNameMax),

  guardianEmail: Yup.string()
    .transform((value) => (typeof value === 'string' ? value.replace(/\s+/g, '') : value))
    .trim()
    .required(VALIDATION_MESSAGES.emailRequired)
    .email(VALIDATION_MESSAGES.invalidEmail),

  relationship: Yup.string()
    .required(VALIDATION_MESSAGES.relationshipRequired),

  otp: Yup.string()
    .trim()
    .required(VALIDATION_MESSAGES.otpRequired)
    .matches(/^\d{4,8}$/, VALIDATION_MESSAGES.invalidOtp),
});
