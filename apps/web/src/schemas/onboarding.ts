import type { OnboardingDTO } from '@/interfaces/api';

export function validateOnboardingForm(dto: Partial<OnboardingDTO>): { isValid: boolean; error?: string } {
  if (!dto.roles || dto.roles.length === 0) {
    return { isValid: false, error: 'Please select at least one role to continue.' };
  }
  if (!dto.displayName || !dto.displayName.trim()) {
    return { isValid: false, error: 'Display Name is required.' };
  }
  return { isValid: true };
}
