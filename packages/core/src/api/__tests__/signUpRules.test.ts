import { describe, it, expect } from 'vitest';
import { calculateAge, validateSignUpAgeAndApproval } from '../signUpRules';

describe('Sign Up Rules & Age Validation', () => {
  // Helper to construct DOB string for a given target age
  const getDobForAge = (ageInYears: number): string => {
    const today = new Date();
    const birthYear = today.getFullYear() - ageInYears;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${day}/${month}/${birthYear}`;
  };

  describe('calculateAge', () => {
    it('correctly calculates age for DD/MM/YYYY format', () => {
      const dob = getDobForAge(25);
      expect(calculateAge(dob)).toBe(25);
    });

    it('correctly calculates age for YYYY-MM-DD format', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 16;
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dobIso = `${birthYear}-${month}-${day}`;
      expect(calculateAge(dobIso)).toBe(16);
    });

    it('returns null for invalid date strings', () => {
      expect(calculateAge('invalid-date')).toBeNull();
      expect(calculateAge('')).toBeNull();
      expect(calculateAge(null)).toBeNull();
    });
  });

  describe('PARENT Role Sign Up Rules', () => {
    it('rejects Parent under 18 years old', () => {
      const dob = getDobForAge(17);
      const res = validateSignUpAgeAndApproval('PARENT', dob);
      expect(res.isValid).toBe(false);
      expect(res.age).toBe(17);
      expect(res.requiresParentApproval).toBe(false);
      expect(res.error).toContain('at least 18 years old');
    });

    it('approves Parent with age 18 (no approval needed)', () => {
      const dob = getDobForAge(18);
      const res = validateSignUpAgeAndApproval('PARENT', dob);
      expect(res.isValid).toBe(true);
      expect(res.age).toBe(18);
      expect(res.isMinor).toBe(false);
      expect(res.requiresParentApproval).toBe(false);
    });

    it('approves Parent with age 40 (no approval needed)', () => {
      const dob = getDobForAge(40);
      const res = validateSignUpAgeAndApproval('PARENT', dob);
      expect(res.isValid).toBe(true);
      expect(res.age).toBe(40);
      expect(res.isMinor).toBe(false);
      expect(res.requiresParentApproval).toBe(false);
    });

    it('rejects Parent over 100 years old', () => {
      const dob = getDobForAge(101);
      const res = validateSignUpAgeAndApproval('PARENT', dob);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('100 years');
    });
  });

  describe('PLAYER Role Sign Up Rules', () => {
    it('rejects Player under 5 years old', () => {
      const dob = getDobForAge(4);
      const res = validateSignUpAgeAndApproval('PLAYER', dob);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Minimum age for players is 5 years');
    });

    it('rejects Player under 18 if parent email is missing', () => {
      const dob = getDobForAge(12);
      const res = validateSignUpAgeAndApproval('PLAYER', dob);
      expect(res.isValid).toBe(false);
      expect(res.isMinor).toBe(true);
      expect(res.requiresParentApproval).toBe(true);
      expect(res.error).toContain('require parent approval');
    });

    it('rejects Player under 18 if parent email is invalid format', () => {
      const dob = getDobForAge(14);
      const res = validateSignUpAgeAndApproval('PLAYER', dob, 'not-an-email');
      expect(res.isValid).toBe(false);
      expect(res.isMinor).toBe(true);
      expect(res.requiresParentApproval).toBe(true);
      expect(res.error).toContain('valid parent/guardian email');
    });

    it('approves Player under 18 with valid parent email (requires parent approval)', () => {
      const dob = getDobForAge(15);
      const res = validateSignUpAgeAndApproval('PLAYER', dob, 'mom@example.com');
      expect(res.isValid).toBe(true);
      expect(res.age).toBe(15);
      expect(res.isMinor).toBe(true);
      expect(res.requiresParentApproval).toBe(true);
    });

    it('approves Player age 18 (no parent approval needed)', () => {
      const dob = getDobForAge(18);
      const res = validateSignUpAgeAndApproval('PLAYER', dob);
      expect(res.isValid).toBe(true);
      expect(res.age).toBe(18);
      expect(res.isMinor).toBe(false);
      expect(res.requiresParentApproval).toBe(false);
    });

    it('approves Player age 28 (no parent approval needed)', () => {
      const dob = getDobForAge(28);
      const res = validateSignUpAgeAndApproval('PLAYER', dob);
      expect(res.isValid).toBe(true);
      expect(res.age).toBe(28);
      expect(res.isMinor).toBe(false);
      expect(res.requiresParentApproval).toBe(false);
    });

    it('rejects Player over 100 years old', () => {
      const dob = getDobForAge(102);
      const res = validateSignUpAgeAndApproval('PLAYER', dob);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('100 years');
    });
  });

  describe('COACH Role Sign Up Rules', () => {
    it('rejects Coach under 5 years old', () => {
      const dob = getDobForAge(3);
      const res = validateSignUpAgeAndApproval('COACH', dob);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Minimum age for coaches is 5 years');
    });

    it('requires parent approval for Coach under 18 with parent email', () => {
      const dob = getDobForAge(16);
      const res = validateSignUpAgeAndApproval('COACH', dob, 'coachparent@example.com');
      expect(res.isValid).toBe(true);
      expect(res.age).toBe(16);
      expect(res.isMinor).toBe(true);
      expect(res.requiresParentApproval).toBe(true);
    });

    it('approves Coach age 30 (no parent approval needed)', () => {
      const dob = getDobForAge(30);
      const res = validateSignUpAgeAndApproval('COACH', dob);
      expect(res.isValid).toBe(true);
      expect(res.age).toBe(30);
      expect(res.isMinor).toBe(false);
      expect(res.requiresParentApproval).toBe(false);
    });

    it('rejects Coach over 100 years old', () => {
      const dob = getDobForAge(105);
      const res = validateSignUpAgeAndApproval('COACH', dob);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('100 years');
    });
  });
});
