export const sanitizeEmail = (value: string) => value.trim().toLowerCase();

export const sanitizeName = (value: string) =>
  value.trim().replace(/\s+/g, ' ');

export const sanitizePassword = (value: string) => value.trim();

export const isValidEmail = (email: string) => {
  // Practical email regex (not RFC-perfect; avoids common false positives)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password: string) => {
  // Rule: >= 8 chars, at least 1 letter and 1 number
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must include at least one letter and one number.';
  }
  return undefined;
};
