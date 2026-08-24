import type { SignUpValidationResult } from './types';

/**
 * Calculates precise age in years from a given Date of Birth (DOB)
 * Supports YYYY-MM-DD, DD/MM/YYYY formats or Date objects
 */
export function calculateAge(dobInput: string | Date | null | undefined): number | null {
  if (!dobInput) return null;

  let birthDate: Date;
  const currentYear = new Date().getFullYear();

  if (dobInput instanceof Date) {
    birthDate = dobInput;
  } else if (typeof dobInput === 'string') {
    const trimmed = dobInput.trim();
    if (!trimmed) return null;

    // Handle DD/MM/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
      const [dd, mm, yyyy] = trimmed.split('/').map(Number);
      if (mm < 1 || mm > 12 || dd < 1 || dd > 31 || yyyy < 1900 || yyyy > currentYear) {
        return null;
      }
      birthDate = new Date(yyyy, mm - 1, dd);
    } 
    // Handle YYYY-MM-DD format
    else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) {
      const [yyyy, mm, dd] = trimmed.split('-').map(Number);
      if (mm < 1 || mm > 12 || dd < 1 || dd > 31 || yyyy < 1900 || yyyy > currentYear) {
        return null;
      }
      birthDate = new Date(yyyy, mm - 1, dd);
    } else {
      return null;
    }
  } else {
    return null;
  }

  if (isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 0 || age > 120) {
    return null;
  }

  return age;
}

/**
 * Validates Sign Up age limits and parent approval requirement based on role and DOB.
 * 
 * Rules:
 * - Parent: Min Age 18, Max Age 100, No parent approval needed.
 * - Coach / Player / Staff: Min Age 5, Max Age 100.
 *   - If age < 18 (5 to 17): Needs Parent Approval (requires valid parent email).
 *   - If age >= 18: No parent approval needed.
 */
export function validateSignUpAgeAndApproval(
  role: string | null | undefined,
  dobInput: string | Date | null | undefined,
  parentEmail?: string
): SignUpValidationResult {
  const age = calculateAge(dobInput);

  if (age === null || age < 0) {
    return {
      isValid: false,
      isMinor: false,
      requiresParentApproval: false,
      error: 'Please enter a valid date of birth.',
    };
  }

  const normalizedRole = (role || 'PLAYER').toUpperCase().trim();

  // PARENT ROLE RULES
  if (normalizedRole === 'PARENT') {
    if (age < 18) {
      return {
        isValid: false,
        age,
        isMinor: false,
        requiresParentApproval: false,
        error: 'Parent account holders must be at least 18 years old.',
      };
    }
    if (age > 100) {
      return {
        isValid: false,
        age,
        isMinor: false,
        requiresParentApproval: false,
        error: 'Maximum age limit is 100 years.',
      };
    }
    return {
      isValid: true,
      age,
      isMinor: false,
      requiresParentApproval: false,
    };
  }

  // COACH, PLAYER, OR STAFF ROLE RULES
  if (age < 5) {
    const roleLabel = normalizedRole === 'COACH' ? 'coaches' : `${normalizedRole.toLowerCase()}s`;
    return {
      isValid: false,
      age,
      isMinor: true,
      requiresParentApproval: true,
      error: `Minimum age for ${roleLabel} is 5 years.`,
    };
  }

  if (age > 100) {
    return {
      isValid: false,
      age,
      isMinor: false,
      requiresParentApproval: false,
      error: 'Maximum age limit is 100 years.',
    };
  }

  const isMinor = age < 18;

  if (isMinor) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasValidParentEmail = parentEmail ? emailRegex.test(parentEmail.trim()) : false;

    if (!hasValidParentEmail) {
      return {
        isValid: false,
        age,
        isMinor: true,
        requiresParentApproval: true,
        error: 'Users under 18 years old require parent approval. Please provide a valid parent/guardian email address.',
      };
    }

    return {
      isValid: true,
      age,
      isMinor: true,
      requiresParentApproval: true,
    };
  }

  return {
    isValid: true,
    age,
    isMinor: false,
    requiresParentApproval: false,
  };
}
