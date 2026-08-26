import type { OtpRequestDTO, OtpVerifyDTO } from '@/interfaces/api';

export function validateOtpRequest(dto: Partial<OtpRequestDTO>): { isValid: boolean; error?: string } {
  if (!dto.destination || !dto.destination.trim()) {
    return { isValid: false, error: 'Email or phone number is required.' };
  }
  if (dto.channel === 'EMAIL' && !dto.destination.includes('@')) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  return { isValid: true };
}

export function validateOtpVerify(dto: Partial<OtpVerifyDTO>): { isValid: boolean; error?: string } {
  if (!dto.code || dto.code.trim().length < 4) {
    return { isValid: false, error: 'Please enter a valid 6-digit verification code.' };
  }
  return { isValid: true };
}
