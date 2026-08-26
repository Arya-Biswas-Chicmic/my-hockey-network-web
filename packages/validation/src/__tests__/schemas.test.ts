import { describe, it, expect } from 'vitest';
import {
  createAccountSchema,
  loginSchema,
  yupOtpSchema,
  guardianApprovalSchema,
  editProfileSchema,
  careerSchema,
  createPlayerSchema,
  linkPlayerSchema,
  approvalCodeSchema,
  helpTicketSchema,
} from '../index';

describe('Yup Validation Schemas', () => {
  describe('createAccountSchema', () => {
    it('validates a valid adult parent account', async () => {
      const schema = createAccountSchema('PARENT');
      const validData = {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        dob: '15/05/1990',
      };
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });

    it('rejects underage parent (< 18)', async () => {
      const schema = createAccountSchema('PARENT');
      const data = {
        fullName: 'Young Parent',
        email: 'young@example.com',
        dob: '15/05/2012',
      };
      await expect(schema.validate(data)).rejects.toThrow('Parent account holders must be at least 18 years old.');
    });

    it('validates a valid young player account (>= 5)', async () => {
      const schema = createAccountSchema('PLAYER');
      const data = {
        fullName: 'Timmy Player',
        email: 'timmy@example.com',
        dob: '10/10/2015',
      };
      await expect(schema.validate(data)).resolves.toEqual(data);
    });

    it('rejects underage player (< 5)', async () => {
      const schema = createAccountSchema('PLAYER');
      const data = {
        fullName: 'Baby Player',
        email: 'baby@example.com',
        dob: '01/01/2025',
      };
      await expect(schema.validate(data)).rejects.toThrow('Minimum age for players is 5 years.');
    });

    it('rejects invalid email format', async () => {
      const schema = createAccountSchema('PLAYER');
      const data = {
        fullName: 'John Smith',
        email: 'invalid-email',
        dob: '15/05/2000',
      };
      await expect(schema.validate(data)).rejects.toThrow('Please enter a valid email address.');
    });
  });

  describe('loginSchema', () => {
    it('validates email only when OTP is not requested', async () => {
      const schema = loginSchema(false);
      const valid = { email: 'user@example.com' };
      await expect(schema.validate(valid)).resolves.toEqual(valid);
    });

    it('requires valid 6-digit OTP when requested', async () => {
      const schema = loginSchema(true);
      const invalid = { email: 'user@example.com', otp: '12' };
      await expect(schema.validate(invalid)).rejects.toThrow('Enter a valid verification code (4-8 digits).');

      const valid = { email: 'user@example.com', otp: '123456' };
      await expect(schema.validate(valid)).resolves.toEqual(valid);
    });
  });

  describe('yupOtpSchema & approvalCodeSchema', () => {
    it('validates OTP digit codes', async () => {
      await expect(yupOtpSchema.validate({ otp: '123456' })).resolves.toEqual({ otp: '123456' });
      await expect(yupOtpSchema.validate({ otp: 'abc' })).rejects.toThrow('Enter a valid verification code');
    });

    it('validates 6-digit approval codes strictly', async () => {
      await expect(approvalCodeSchema.validate({ code: '654321' })).resolves.toEqual({ code: '654321' });
      await expect(approvalCodeSchema.validate({ code: '12345' })).rejects.toThrow('Enter a valid 6-digit approval code.');
    });
  });

  describe('editProfileSchema & careerSchema', () => {
    it('validates editProfileSchema optional and constrained fields', async () => {
      const valid = {
        displayName: 'Connor McDavid',
        firstName: 'Connor',
        lastName: 'McDavid',
        bio: 'Captain of Oilers',
        city: 'Edmonton',
        dateOfBirth: '1997-01-13',
        jerseyNumber: '97',
        gender: 'Male',
        position: 'Center',
      };
      await expect(editProfileSchema.validate(valid)).resolves.toEqual(valid);
    });

    it('rejects invalid jersey number', async () => {
      const invalid = { displayName: 'Player', jerseyNumber: '150' };
      await expect(editProfileSchema.validate(invalid)).rejects.toThrow('Jersey number must be an integer between 0 and 99.');
    });

    it('validates careerSchema start/end dates', async () => {
      const valid = {
        teamName: 'Oilers',
        position: 'Center',
        location: 'Edmonton',
        startMonth: 'January',
        startYear: '2020',
        endMonth: 'December',
        endYear: '2022',
        isCurrentPlaying: false,
      };
      await expect(careerSchema.validate(valid)).resolves.toEqual(valid);
    });

    it('rejects end year before start year', async () => {
      const invalid = {
        teamName: 'Oilers',
        position: 'Center',
        location: 'Edmonton',
        startMonth: 'January',
        startYear: '2022',
        endMonth: 'December',
        endYear: '2020',
        isCurrentPlaying: false,
      };
      await expect(careerSchema.validate(invalid)).rejects.toThrow('End date cannot be before start date.');
    });
  });

  describe('helpTicketSchema', () => {
    it('validates a complete support ticket submission', async () => {
      const valid = {
        subject: 'OTP code not arriving',
        category: 'login',
        message: 'I tried sending OTP to my email multiple times but received nothing.',
        email: 'user@example.com',
      };
      await expect(helpTicketSchema.validate(valid)).resolves.toEqual(valid);
    });
  });
});
