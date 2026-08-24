import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getProfile,
  createCareerEntry,
  updateCareerEntry,
  deleteCareerEntry,
} from '../careerApi';
import * as clientModule from '../client';

describe('Career API Operations', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches profile with embedded careerEntries using GET /v1/profiles/:profileId', async () => {
    const mockProfileResponse = {
      profile: {
        profileId: '22222222-2222-4222-8222-222222222206',
        displayName: 'Jordan R.',
        careerEntries: [
          {
            id: '0b001b40-8312-460a-9fc9-1316dd657654',
            groupId: null,
            teamName: 'Boston Bruins',
            teamLogoUrl: null,
            position: 'Center',
            location: 'Toronto, Canada',
            note: 'Great times',
            startDate: '2024-01-02T00:00:00.000Z',
            endDate: '2024-06-01T00:00:00.000Z',
            verified: false,
          },
        ],
        isSelf: true,
      },
    };

    const spy = vi.spyOn(clientModule, 'apiFetch').mockResolvedValue(mockProfileResponse);

    const result = await getProfile('22222222-2222-4222-8222-222222222206', 'web');

    expect(spy).toHaveBeenCalledWith(
      '/profiles/22222222-2222-4222-8222-222222222206',
      { method: 'GET' },
      'web'
    );
    expect(result.profile.displayName).toBe('Jordan R.');
    expect(result.profile.careerEntries).toHaveLength(1);
    expect(result.profile.careerEntries?.[0].teamName).toBe('Boston Bruins');
  });

  it('creates a freeform career entry via POST /v1/profiles/me/career', async () => {
    const dto = {
      teamName: 'Boston Bruins',
      position: 'Center',
      location: 'Dagestan, Russia',
      note: 'Good times',
      startDate: '2024-01-02T00:00:00.000Z',
    };

    const mockCreatedEntry = {
      id: 'd9d35a68-2399-4f13-98d0-dec0d723949b',
      groupId: null,
      teamName: 'Boston Bruins',
      teamLogoUrl: null,
      position: 'Center',
      location: 'Dagestan, Russia',
      note: 'Good times',
      startDate: '2024-01-02T00:00:00.000Z',
      endDate: null,
      verified: false,
    };

    const spy = vi.spyOn(clientModule, 'apiFetch').mockResolvedValue(mockCreatedEntry);

    const result = await createCareerEntry(dto, 'web');

    expect(spy).toHaveBeenCalledWith(
      '/profiles/me/career',
      {
        method: 'POST',
        body: JSON.stringify(dto),
      },
      'web'
    );
    expect(result.id).toBe('d9d35a68-2399-4f13-98d0-dec0d723949b');
    expect(result.verified).toBe(false);
    expect(result.endDate).toBeNull();
  });

  it('creates a linked career entry with groupId via POST /v1/profiles/me/career', async () => {
    const dto = {
      groupId: '44444444-4444-4444-8444-444444444410',
      position: 'Left Wing',
      startDate: '2022-09-01T00:00:00.000Z',
      endDate: '2024-01-01T00:00:00.000Z',
    };

    const mockLinkedEntry = {
      id: '5e4b0ce4-69b2-4db8-9918-f994240d4eeb',
      groupId: '44444444-4444-4444-8444-444444444410',
      teamName: 'HC Bloemendaal',
      teamLogoUrl: 'https://placehold.co/128x128/0b1f3a/ffffff?text=HCB',
      position: 'Left Wing',
      location: null,
      note: null,
      startDate: '2022-09-01T00:00:00.000Z',
      endDate: '2024-01-01T00:00:00.000Z',
      verified: true,
    };

    const spy = vi.spyOn(clientModule, 'apiFetch').mockResolvedValue(mockLinkedEntry);

    const result = await createCareerEntry(dto, 'web');

    expect(spy).toHaveBeenCalledWith(
      '/profiles/me/career',
      {
        method: 'POST',
        body: JSON.stringify(dto),
      },
      'web'
    );
    expect(result.groupId).toBe('44444444-4444-4444-8444-444444444410');
    expect(result.verified).toBe(true);
  });

  it('updates a career entry via PATCH /v1/profiles/me/career/:id', async () => {
    const dto = { note: 'Great times', endDate: '2024-06-01T00:00:00.000Z' };
    const mockUpdatedEntry = {
      id: '0b001b40-8312-460a-9fc9-1316dd657654',
      groupId: null,
      teamName: 'Boston Bruins',
      teamLogoUrl: null,
      position: 'Center',
      location: 'Toronto, Canada',
      note: 'Great times',
      startDate: '2024-01-02T00:00:00.000Z',
      endDate: '2024-06-01T00:00:00.000Z',
      verified: false,
    };

    const spy = vi.spyOn(clientModule, 'apiFetch').mockResolvedValue(mockUpdatedEntry);

    const result = await updateCareerEntry('0b001b40-8312-460a-9fc9-1316dd657654', dto, 'web');

    expect(spy).toHaveBeenCalledWith(
      '/profiles/me/career/0b001b40-8312-460a-9fc9-1316dd657654',
      {
        method: 'PATCH',
        body: JSON.stringify(dto),
      },
      'web'
    );
    expect(result.note).toBe('Great times');
  });

  it('deletes a career entry via DELETE /v1/profiles/me/career/:id', async () => {
    const spy = vi.spyOn(clientModule, 'apiFetch').mockResolvedValue({ id: '0b001b40-8312-460a-9fc9-1316dd657654' });

    const result = await deleteCareerEntry('0b001b40-8312-460a-9fc9-1316dd657654', 'web');

    expect(spy).toHaveBeenCalledWith(
      '/profiles/me/career/0b001b40-8312-460a-9fc9-1316dd657654',
      { method: 'DELETE' },
      'web'
    );
    expect(result.id).toBe('0b001b40-8312-460a-9fc9-1316dd657654');
  });
});
