import * as Yup from 'yup';
import { VALIDATION_MESSAGES } from '../constants/validationMessages';

export interface ApprovalCodeFormValues {
  code: string;
}

export const approvalCodeSchema = Yup.object().shape({
  code: Yup.string()
    .trim()
    .required(VALIDATION_MESSAGES.otpRequired)
    .matches(/^\d{6}$/, VALIDATION_MESSAGES.invalidApprovalCode),
});
