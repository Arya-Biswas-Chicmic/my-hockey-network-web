import { ProfileValidationMessages, CareerValidationMessages } from '@my-hockey-network/contracts';

export interface ProfileValidationData {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  city?: string;
  dateOfBirth?: string;
  jerseyNumber?: string | number;
}

export function validateProfileField(name: keyof ProfileValidationData | string, value: any): string | null {
  const strVal = value !== null && value !== undefined ? String(value) : '';
  const trimmed = strVal.trim();

  if (name === 'displayName') {
    if (!trimmed) return ProfileValidationMessages.DISPLAY_NAME_REQUIRED;
    if (trimmed.length < 2) return ProfileValidationMessages.DISPLAY_NAME_MIN_LENGTH;
    if (strVal.length >= 50) return ProfileValidationMessages.DISPLAY_NAME_MAX_LENGTH;
  }

  if (name === 'firstName' && strVal) {
    if (trimmed.length < 2) return ProfileValidationMessages.FIRST_NAME_MIN_LENGTH;
    if (strVal.length >= 50) return ProfileValidationMessages.FIRST_NAME_MAX_LENGTH;
  }

  if (name === 'lastName' && strVal) {
    if (trimmed.length < 2) return ProfileValidationMessages.LAST_NAME_MIN_LENGTH;
    if (strVal.length >= 50) return ProfileValidationMessages.LAST_NAME_MAX_LENGTH;
  }

  if (name === 'city' && strVal) {
    if (strVal.length >= 50) return ProfileValidationMessages.CITY_MAX_LENGTH;
  }

  if (name === 'bio' && trimmed) {
    if (trimmed.length > 300) return ProfileValidationMessages.BIO_MAX_LENGTH;
  }

  if (name === 'jerseyNumber' && trimmed) {
    const num = Number(trimmed);
    if (isNaN(num) || num < 0 || num > 99 || !Number.isInteger(num)) {
      return ProfileValidationMessages.JERSEY_NUMBER_INVALID;
    }
  }

  if (name === 'dateOfBirth' && trimmed) {
    const dobDate = new Date(trimmed);
    if (isNaN(dobDate.getTime())) {
      return ProfileValidationMessages.DOB_INVALID;
    }
    const today = new Date();
    if (dobDate > today) {
      return ProfileValidationMessages.DOB_FUTURE;
    }
    const age = today.getFullYear() - dobDate.getFullYear();
    if (age < 5) {
      return ProfileValidationMessages.DOB_MIN_AGE;
    }
    if (age > 100) {
      return ProfileValidationMessages.DOB_MAX_AGE;
    }
  }

  return null;
}

export interface CareerValidationData {
  teamName: string;
  position?: string;
  location?: string;
  note?: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  isCurrentPlaying?: boolean;
}

export function validateCareerField(name: keyof CareerValidationData | string, value: any, allData?: CareerValidationData): string | null {
  const strVal = value !== null && value !== undefined ? String(value) : '';
  const trimmed = strVal.trim();

  if (name === 'teamName') {
    if (!trimmed) return CareerValidationMessages.TEAM_NAME_REQUIRED;
    if (trimmed.length < 2) return CareerValidationMessages.TEAM_NAME_MIN_LENGTH;
    if (strVal.length >= 50) return CareerValidationMessages.TEAM_NAME_MAX_LENGTH;
  }

  if (name === 'position') {
    if (!trimmed) return CareerValidationMessages.POSITION_REQUIRED;
    if (strVal.length >= 50) return CareerValidationMessages.POSITION_MAX_LENGTH;
  }

  if (name === 'location') {
    if (!trimmed) return CareerValidationMessages.CITY_REQUIRED;
    if (strVal.length >= 50) return CareerValidationMessages.CITY_MAX_LENGTH;
  }

  if (name === 'note' && trimmed) {
    if (trimmed.length > 300) return CareerValidationMessages.NOTE_MAX_LENGTH;
  }

  if (name === 'startMonth') {
    if (!trimmed) return CareerValidationMessages.START_MONTH_REQUIRED;
  }

  if (name === 'startYear') {
    if (!trimmed) return CareerValidationMessages.START_YEAR_REQUIRED;
    const yr = Number(trimmed);
    const currentYear = new Date().getFullYear();
    if (isNaN(yr) || yr > currentYear) {
      return CareerValidationMessages.START_YEAR_FUTURE;
    }
  }

  if (name === 'endMonth' && allData && !allData.isCurrentPlaying) {
    if (!trimmed) return CareerValidationMessages.END_MONTH_REQUIRED;
  }

  if (name === 'endYear' && allData && !allData.isCurrentPlaying) {
    if (!trimmed) return CareerValidationMessages.END_YEAR_REQUIRED;
    const startYr = Number(allData.startYear);
    const endYr = Number(trimmed);
    const currentYear = new Date().getFullYear();
    if (!isNaN(endYr) && endYr > currentYear) {
      return CareerValidationMessages.END_YEAR_FUTURE;
    }
    if (!isNaN(startYr) && !isNaN(endYr) && endYr < startYr) {
      return CareerValidationMessages.END_DATE_BEFORE_START;
    }
  }

  return null;
}

/**
 * Strips all whitespace characters from email input in real time.
 */
export function sanitizeEmailInput(value: string): string {
  if (!value) return '';
  return String(value).replace(/\s+/g, '');
}

/**
 * Sanitizes name input in real time:
 * - Prevents leading spaces
 * - Prevents multiple consecutive spaces (max 1 space between words)
 */
export function sanitizeNameInput(value: string): string {
  if (!value) return '';
  const str = String(value);
  return str.replace(/^ +/g, '').replace(/ {2,}/g, ' ');
}

/**
 * Normalizes name input on blur:
 * - Trims leading and trailing spaces
 * - Replaces multiple consecutive spaces with a single space
 */
export function normalizeNameBlur(value: string): string {
  if (!value) return '';
  return String(value).trim().replace(/ {2,}/g, ' ');
}

/**
 * Masks an email address for OTP / verification display.
 * Example: "arya2001@gmail.com" -> "arya****@gmail.com"
 * Example: "sam@gmail.com" -> "sa****@gmail.com"
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0) return trimmed;

  const localPart = trimmed.slice(0, atIndex);
  const domainPart = trimmed.slice(atIndex);

  if (localPart.length <= 2) {
    return `${localPart[0] || ''}****${domainPart}`;
  }
  if (localPart.length <= 4) {
    return `${localPart.slice(0, 2)}****${domainPart}`;
  }
  const visible = localPart.slice(0, 4);
  return `${visible}****${domainPart}`;
}

