import { REGEX_PATTERNS } from '@my-hockey-network/constants';

export const isValidEmail = (email: string): boolean => {
  return REGEX_PATTERNS.EMAIL.test(email.trim());
};

export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const sanitizeName = (name: string): string => {
  return name.trim().replace(/\s+/g, ' ');
};

export const sanitizePassword = (password: string): string => {
  return password.trim();
};

export const validatePassword = (password: string): string | undefined => {
  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return undefined;
};

export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  delayMs: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delayMs);
  };
};
