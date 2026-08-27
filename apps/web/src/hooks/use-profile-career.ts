'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  createCareerEntry,
  updateCareerEntry,
  deleteCareerEntry,
  type CareerEntry,
} from '@my-hockey-network/core';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@my-hockey-network/constants';
import type { CareerFormValues } from '@my-hockey-network/validation';

import { showSuccessToast, showErrorToast } from '@/utils/toast';

const MONTH_NUMBERS: Record<string, string> = {
  January: '01', February: '02', March: '03', April: '04',
  May: '05', June: '06', July: '07', August: '08',
  September: '09', October: '10', November: '11', December: '12',
};

function formatIsoDateString(year?: string, month?: string): string | null {
  if (!year) return null;
  const m = month ? (MONTH_NUMBERS[month] || '01') : '01';
  return `${year}-${m}-01T00:00:00.000Z`;
}

/**
 * Career/teams CRUD for the Profile > About > Career section. Extracted
 * from `screens/profile-page.tsx`; owns the entries list and its
 * create/update/delete calls (`packages/core`'s career API) — the caller
 * still owns the add/edit form's own state (now RHF+Zod, see
 * `ProfileCareerSection.tsx`) since that's presentation, not data.
 */
export function useProfileCareer(targetProfileRes: unknown) {
  const [careerEntries, setCareerEntries] = useState<CareerEntry[] | null>([
    {
      id: 't1',
      groupId: null,
      teamName: 'Boston Bruins',
      teamLogoUrl: '/kcBlue.png',
      position: 'Center',
      location: 'Dagestan, Russia',
      note: 'Good times',
      startDate: '2024-01-02T00:00:00.000Z',
      endDate: null,
      verified: false,
    },
    {
      id: 't2',
      groupId: '44444444-4444-4444-8444-444444444410',
      teamName: 'Carolina Hurricanes',
      teamLogoUrl: '/HC.png',
      position: 'Center',
      location: 'Toronto, Canada',
      note: 'Good times',
      startDate: '2022-01-01T00:00:00.000Z',
      endDate: '2024-01-01T00:00:00.000Z',
      verified: true,
    },
  ]);
  const [isDeletingTeamId, setIsDeletingTeamId] = useState<string | null>(null);

  // Load real profile data and career entries from targetProfileRes
  useEffect(() => {
    const res = targetProfileRes as { profile?: { career?: CareerEntry[]; careerEntries?: CareerEntry[] } } | null | undefined;
    const entries = res?.profile?.career || res?.profile?.careerEntries;
    if (entries !== undefined && entries !== null && Array.isArray(entries)) {
      setCareerEntries(entries);
    }
  }, [targetProfileRes]);

  const createTeamMutation = useMutation({
    mutationFn: (dto: Parameters<typeof createCareerEntry>[0]) => createCareerEntry(dto),
  });
  const updateTeamMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Parameters<typeof updateCareerEntry>[1] }) => updateCareerEntry(id, dto),
  });
  const deleteTeamMutation = useMutation({
    mutationFn: (id: string) => deleteCareerEntry(id),
  });

  const saveTeam = async (values: CareerFormValues, editingTeamId: string | null): Promise<boolean> => {
    try {
      const startDate = formatIsoDateString(values.startYear, values.startMonth) || undefined;
      const endDate = !values.isCurrentPlaying ? (formatIsoDateString(values.endYear, values.endMonth) || undefined) : undefined;

      if (editingTeamId) {
        const updated = await updateTeamMutation.mutateAsync({
          id: editingTeamId,
          dto: {
            teamName: values.teamName.trim(),
            position: values.position.trim() || undefined,
            location: values.location.trim() || undefined,
            note: values.note.trim() || undefined,
            startDate,
            endDate: values.isCurrentPlaying ? null : endDate,
          },
        });
        setCareerEntries((prev) => (prev || []).map((t) => (t.id === editingTeamId ? updated : t)));
        showSuccessToast(SUCCESS_MESSAGES.CAREER_UPDATED);
      } else {
        const created = await createTeamMutation.mutateAsync({
          teamName: values.teamName.trim(),
          position: values.position.trim() || undefined,
          location: values.location.trim() || undefined,
          note: values.note.trim() || undefined,
          startDate,
          endDate,
        });
        setCareerEntries((prev) => [created, ...(prev || [])]);
        showSuccessToast(SUCCESS_MESSAGES.CAREER_CREATED);
      }
      return true;
    } catch (err: unknown) {
      showErrorToast(err, ERROR_MESSAGES.FAILED_SAVE_CAREER_TEAM);
      return false;
    }
  };

  const deleteTeam = async (id: string) => {
    if (isDeletingTeamId) return;
    setIsDeletingTeamId(id);
    try {
      await deleteTeamMutation.mutateAsync(id);
      setCareerEntries((prev) => (prev || []).filter((t) => t.id !== id));
      showSuccessToast(SUCCESS_MESSAGES.CAREER_REMOVED);
    } catch (err: unknown) {
      showErrorToast(err, ERROR_MESSAGES.FAILED_REMOVE_CAREER_TEAM);
    } finally {
      setIsDeletingTeamId(null);
    }
  };

  const isSavingTeam = createTeamMutation.isPending || updateTeamMutation.isPending;

  return { careerEntries, isSavingTeam, isDeletingTeamId, saveTeam, deleteTeam };
}
