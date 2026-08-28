'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BadgeCheck, Pencil, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { FallbackImage } from '@/components/ui/fallback-image';
import { CareerFormFields } from '@/components/features/profile/CareerFormFields';
import { careerFormSchema, type CareerFormValues } from '@my-hockey-network/validation';
import type { CareerEntry } from '@my-hockey-network/core';

const EMPTY_CAREER_FORM: CareerFormValues = {
  teamName: '',
  position: '',
  location: '',
  isCurrentPlaying: true,
  startMonth: '',
  startYear: '',
  endMonth: '',
  endYear: '',
  note: '',
};

function formatIsoReadable(iso?: string | null): string {
  if (!iso) return 'Present';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function editFormValuesFor(team: CareerEntry): CareerFormValues {
  const startYear = team.startDate && !isNaN(new Date(team.startDate).getTime())
    ? String(new Date(team.startDate).getFullYear())
    : '';
  const endYear = team.endDate && !isNaN(new Date(team.endDate).getTime())
    ? String(new Date(team.endDate).getFullYear())
    : '';
  return {
    teamName: team.teamName || '',
    position: team.position || '',
    location: team.location || '',
    isCurrentPlaying: !team.endDate,
    startMonth: '',
    startYear,
    endMonth: '',
    endYear,
    note: team.note || '',
  };
}

export interface ProfileCareerSectionProps {
  careerEntries: CareerEntry[] | null;
  isSavingTeam: boolean;
  isDeletingTeamId: string | null;
  onSaveTeam: (values: CareerFormValues, editingTeamId: string | null) => Promise<boolean>;
  onRequestDelete: (team: CareerEntry) => void;
}

/**
 * Profile > About > Career (teams list + add/edit form). RHF + Zod
 * (`careerFormSchema`) replaces the hand-rolled 9-field `useState` set and
 * manual error object this used to be. Reuses the existing controlled
 * `CareerFormFields` renderer the same way `ProfilePersonalDetailsSection`
 * reuses `PersonalDetailsFields` — see that file's doc comment. Extracted
 * from `screens/profile-page.tsx`; entries CRUD lives in
 * `hooks/use-profile-career.ts`.
 */
export function ProfileCareerSection({
  careerEntries,
  isSavingTeam,
  isDeletingTeamId,
  onSaveTeam,
  onRequestDelete,
}: Readonly<ProfileCareerSectionProps>) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  const form = useForm<CareerFormValues>({
    resolver: zodResolver(careerFormSchema),
    mode: 'onChange',
    defaultValues: EMPTY_CAREER_FORM,
  });

  useEffect(() => {
    if (!isFormOpen) form.reset(EMPTY_CAREER_FORM);
  }, [isFormOpen]);

  const watchedValues = useWatch({ control: form.control });
  const values: CareerFormValues = {
    teamName: watchedValues.teamName ?? '',
    position: watchedValues.position ?? '',
    location: watchedValues.location ?? '',
    isCurrentPlaying: watchedValues.isCurrentPlaying ?? true,
    startMonth: watchedValues.startMonth ?? '',
    startYear: watchedValues.startYear ?? '',
    endMonth: watchedValues.endMonth ?? '',
    endYear: watchedValues.endYear ?? '',
    note: watchedValues.note ?? '',
  };
  const errors = form.formState.errors;

  // A plain inline arrow loses the `field`/`val` correlation `setValue`'s generic overload
  // needs (a known RHF + correlated-union limitation) — this keeps `handleFieldChange` itself
  // fully typed and casts only at the `setValue` boundary.
  const handleFieldChange = <K extends keyof CareerFormValues>(field: K, val: CareerFormValues[K]) => {
    form.setValue(field, val as never, { shouldValidate: form.formState.isSubmitted });
  };

  const closeForm = () => {
    setEditingTeamId(null);
    setIsFormOpen(false);
    form.reset(EMPTY_CAREER_FORM);
  };

  const openAddForm = () => {
    setEditingTeamId(null);
    form.reset(EMPTY_CAREER_FORM);
    setIsFormOpen(true);
  };

  const openEditForm = (team: CareerEntry) => {
    setEditingTeamId(team.id);
    form.reset(editFormValuesFor(team));
    setIsFormOpen(true);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    const ok = await onSaveTeam(data, editingTeamId);
    if (ok) closeForm();
  });

  return (
    <div className="mhn-about-section-content mhn-col-flex-gap-20">
      {/* Teams Header */}
      <div className="mhn-toggle-row-between mhn-mb-4">
        <h4 className="mhn-about-section-heading">Teams</h4>
        <Button
          type="button"
          onClick={() => (isFormOpen && !editingTeamId ? closeForm() : openAddForm())}
          className="mhn-btn-icon-clear"
          title="Add Team"
        >
          <Plus size={20} aria-hidden="true" />
        </Button>
      </div>

      {/* Add / Edit Team Form Card */}
      {isFormOpen && (
        <div className="mhn-add-team-card-form">
          <CareerFormFields
            values={values}
            onChange={handleFieldChange}
            errors={{
              teamName: errors.teamName?.message ?? '',
              position: errors.position?.message ?? '',
              location: errors.location?.message ?? '',
              startMonth: errors.startMonth?.message ?? '',
              startYear: errors.startYear?.message ?? '',
              endMonth: errors.endMonth?.message ?? '',
              endYear: errors.endYear?.message ?? '',
              note: errors.note?.message ?? '',
            }}
          />

          <div className="mhn-team-actions-row">
            <Button type="button" onClick={closeForm} className="mhn-btn-team-cancel">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSavingTeam}
              className={`mhn-btn-team-save ${isSavingTeam ? 'disabled' : 'active'}`}
            >
              {isSavingTeam && <Spinner size="sm" color="currentColor" />}
              <span>Save</span>
            </Button>
          </div>
        </div>
      )}

      {/* Saved Career Teams List */}
      <div className="mhn-col-flex-gap-12">
        {careerEntries === null ? (
          <div className="mhn-career-privacy-hidden-box">
            Career history is hidden based on user privacy settings.
          </div>
        ) : careerEntries.length === 0 && !isFormOpen ? (
          <div className="mhn-career-empty-dashed-box">
            <p className="mhn-parent-card-sub mhn-mb-12">No career teams added yet.</p>
            <Button type="button" onClick={openAddForm} className="mhn-btn-add-team-blue">
              + Add a Team
            </Button>
          </div>
        ) : (
          (careerEntries || []).map((team) => {
            const posText = team.position ? `${team.position} · ` : '';
            const startText = team.startDate ? formatIsoReadable(team.startDate) : '';
            const endText = team.endDate ? formatIsoReadable(team.endDate) : 'Present';
            const dateRange = startText ? `${startText} - ${endText}` : endText;
            const locText = team.location ? ` · ${team.location}` : '';
            const subtitleStr = `${posText}${dateRange}${locText}`;

            return (
              <div key={team.id} className="mhn-career-item-card">
                <div className="mhn-career-item-left">
                  <FallbackImage
                    src={team.teamLogoUrl}
                    alt={team.teamName || 'Team Logo'}
                    width={40}
                    height={40}
                    fallbackSrc="/kcBlue.webp"
                    className="mhn-career-team-logo-img"
                  />
                  <div>
                    <div className="mhn-btn-loading-flex">
                      <h5 className="mhn-career-team-title">{team.teamName || 'Team Name'}</h5>
                      {team.verified && (
                        <span title="Verified Team on Platform" className="mhn-btn-loading-flex">
                          <BadgeCheck size={16} className="fill-current text-primary" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                    <p className="mhn-career-team-sub">{subtitleStr}</p>
                    {team.note && <p className="mhn-career-team-note">{team.note}</p>}
                  </div>
                </div>

                <div className="mhn-btn-loading-flex">
                  <Button
                    type="button"
                    onClick={() => openEditForm(team)}
                    className="mhn-btn-icon-clear"
                    title="Edit team details"
                    disabled={isDeletingTeamId === team.id}
                  >
                    <Pencil size={16} className="text-muted-foreground" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onRequestDelete(team)}
                    className="mhn-btn-icon-clear"
                    title="Delete career entry"
                    disabled={isDeletingTeamId === team.id}
                  >
                    <Trash2 size={16} className="text-destructive" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
