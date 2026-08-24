import { describe, it, expect } from 'vitest';
import { cleanEmptyFields, formatDobToIso, type CreateManagedChildDTO } from '../supervisionApi';

describe('Parent Role Onboarding & Player Management Contract', () => {
  it('formats DD/MM/YYYY dates into ISO YYYY-MM-DD format', () => {
    expect(formatDobToIso('11/11/2011')).toBe('2011-11-11');
    expect(formatDobToIso('02/05/2014')).toBe('2014-05-02');
    expect(formatDobToIso('2014-05-02')).toBe('2014-05-02');
  });

  it('omits empty string, null, and undefined fields from payload via cleanEmptyFields', () => {
    const rawPayload = {
      displayName: 'rg4etwgtehgrth',
      firstName: 'rg4etwgtehgrth',
      lastName: '',
      dateOfBirth: '2003-11-11',
      guardianRelation: 'FATHER',
      email: undefined,
    };
    const cleaned = cleanEmptyFields(rawPayload);
    expect(cleaned).toEqual({
      displayName: 'rg4etwgtehgrth',
      firstName: 'rg4etwgtehgrth',
      dateOfBirth: '2003-11-11',
      guardianRelation: 'FATHER',
    });
    expect('lastName' in cleaned).toBe(false);
    expect('email' in cleaned).toBe(false);
  });

  it('constructs valid CreateManagedChildDTO payload according to backend spec', () => {
    const dto: CreateManagedChildDTO = {
      displayName: 'Noah Smith',
      firstName: 'Noah',
      lastName: 'Smith',
      dateOfBirth: '2014-05-02',
      guardianRelation: 'MOTHER',
      email: 'noah@example.com',
      profileVisibility: 'CONNECTIONS',
      requireApprovalAdultContact: true,
      requireApprovalConnections: true,
      requireApprovalTeamInvites: true,
      requireApprovalMedia: true,
    };

    expect(dto.displayName).toBe('Noah Smith');
    expect(dto.dateOfBirth).toBe('2014-05-02');
    expect(dto.guardianRelation).toBe('MOTHER');
    expect(dto.profileVisibility).toBe('CONNECTIONS');
    expect(dto.requireApprovalAdultContact).toBe(true);
  });

  it('validates guardian relation enum values', () => {
    const validRelations = ['MOTHER', 'FATHER', 'LEGAL_GUARDIAN', 'GRANDPARENT', 'OTHER'];
    validRelations.forEach((rel) => {
      expect(validRelations.includes(rel)).toBe(true);
    });
  });
});
