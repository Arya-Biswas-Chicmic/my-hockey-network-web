import * as Yup from 'yup';
import { VALIDATION_MESSAGES } from '../constants/validationMessages';

export interface OtpFormValues {
  otp: string;
}

export const yupOtpSchema = Yup.object().shape({
  otp: Yup.string()
    .trim()
    .required(VALIDATION_MESSAGES.otpRequired)
    .matches(/^\d{4,8}$/, VALIDATION_MESSAGES.invalidOtp),
});
