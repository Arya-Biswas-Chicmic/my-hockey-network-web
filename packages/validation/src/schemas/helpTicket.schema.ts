import * as Yup from 'yup';
import { VALIDATION_MESSAGES } from '../constants/validationMessages';

export interface HelpTicketFormValues {
  subject: string;
  category: string;
  message: string;
  email: string;
}

export const helpTicketSchema = Yup.object().shape({
  subject: Yup.string()
    .trim()
    .required(VALIDATION_MESSAGES.subjectRequired)
    .min(3, 'Subject must be at least 3 characters.')
    .max(100, 'Subject cannot exceed 100 characters.'),

  category: Yup.string()
    .required(VALIDATION_MESSAGES.categoryRequired),

  message: Yup.string()
    .trim()
    .required(VALIDATION_MESSAGES.messageRequired)
    .min(10, VALIDATION_MESSAGES.messageMin)
    .max(1000, VALIDATION_MESSAGES.messageMax),

  email: Yup.string()
    .transform((value) => (typeof value === 'string' ? value.replace(/\s+/g, '') : value))
    .trim()
    .required(VALIDATION_MESSAGES.emailRequired)
    .email(VALIDATION_MESSAGES.invalidEmail),
});
