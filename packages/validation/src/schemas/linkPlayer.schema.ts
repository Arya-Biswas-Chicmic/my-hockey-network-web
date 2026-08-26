import * as Yup from 'yup';
import { VALIDATION_MESSAGES } from '../constants/validationMessages';

export interface LinkPlayerFormValues {
  childEmail: string;
}

export const linkPlayerSchema = Yup.object().shape({
  childEmail: Yup.string()
    .transform((value) => (typeof value === 'string' ? value.replace(/\s+/g, '') : value))
    .trim()
    .required(VALIDATION_MESSAGES.emailRequired)
    .email(VALIDATION_MESSAGES.invalidEmail),
});
