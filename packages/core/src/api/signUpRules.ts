import { REGEX_PATTERNS } from '@my-hockey-network/constants';
import { ageFromDate, isFutureDate, parseDob } from '@my-hockey-network/validation';
import type { SignUpValidationResult } from './types';

/**
 * Calculates precise age in years from a given Date of Birth (DOB).
 * Supports YYYY-MM-DD, DD/MM/YYYY formats or Date objects.
 *
 * Parsing and the year arithmetic are delegated to `@my-hockey-network/validation`'s
 * shared `parseDob`/`ageFromDate` so this and the form schemas cannot drift apart —
 * this function previously carried its own copy of both, one of four in the repo.
 */
export function calculateAge(dobInput: string | Date | null | undefined): number | null {
  if (!dobInput) return null;

  const birthDate = dobInput instanceof Date ? dobInput : parseDob(dobInput);
  if (birthDate === null || Number.isNaN(birthDate.getTime())) {
    return null;
  }

  // A future DOB is checked explicitly rather than via `age < 0`: the age
  // calculation truncates toward zero, so a date a few months ahead would
  // otherwise come back as a plausible-looking 0.
  if (isFutureDate(birthDate)) {
    return null;
  }

  const age = ageFromDate(birthDate);
  if (age > 120) {
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
    const hasValidParentEmail = parentEmail ? REGEX_PATTERNS.EMAIL.test(parentEmail.trim()) : false;

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
