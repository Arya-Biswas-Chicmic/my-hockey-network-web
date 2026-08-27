'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/common/Button';
import { Input, Textarea, Dropdown } from '@/components/common/FormControls';
import { Spinner } from '@/components/common/Spinner';
import { profileIntroFormSchema, type ProfileIntroFormValues } from '@my-hockey-network/validation';

const POSITION_OPTIONS = ['Center', 'Left Wing', 'Right Wing', 'Defense', 'Goaltender'];

export interface ProfileIntroSectionProps {
  bio: string;
  position: string;
  jerseyNumber: string;
  role: string;
  isPlayer: boolean;
  isSaving: boolean;
  saveMessage: string | null;
  onSave: (values: ProfileIntroFormValues) => Promise<void> | void;
}

/**
 * Profile > About > Intro form. RHF + Zod (`profileIntroFormSchema`, which
 * wraps the same `validateProfileField` rules the standalone Edit Profile
 * modal already validates with — see `packages/validation/src/forms.ts`)
 * replaces the hand-rolled `useState`/manual-error-object pair this used to
 * be. Extracted from `screens/profile-page.tsx`.
 */
export function ProfileIntroSection({
  bio,
  position,
  jerseyNumber,
  role,
  isPlayer,
  isSaving,
  saveMessage,
  onSave,
}: Readonly<ProfileIntroSectionProps>) {
  const form = useForm<ProfileIntroFormValues>({
    resolver: zodResolver(profileIntroFormSchema),
    mode: 'onChange',
    defaultValues: { bio, position, jerseyNumber },
  });

  // Keep in sync when the underlying live profile data changes (e.g. after
  // a save round-trips through /auth/me, or switching between profiles).
  useEffect(() => {
    form.reset({ bio, position, jerseyNumber });
  }, [bio, position, jerseyNumber]);

  const errors = form.formState.errors;
  const watchedValues = useWatch({ control: form.control });
  const values: ProfileIntroFormValues = {
    bio: watchedValues.bio ?? '',
    position: watchedValues.position ?? '',
    jerseyNumber: watchedValues.jerseyNumber ?? '',
  };

  const handleSubmit = form.handleSubmit((data) => onSave(data));

  return (
    <div className="mhn-about-intro-form">
      {/* Bio */}
      <div className="mhn-about-field-group">
        <label className="mhn-about-field-label">Bio</label>
        <div className="mhn-relative-container">
          <Textarea
            value={values.bio}
            onChange={(e) => form.setValue('bio', e.target.value, { shouldValidate: form.formState.isSubmitted })}
            className={`mhn-about-input-box mhn-about-textarea-box ${errors.bio ? 'mhn-edit-profile-input-error' : ''}`}
            rows={3}
            placeholder="Write something about yourself..."
          />
          {errors.bio && (
            <div className="mhn-edit-profile-field-error">
              <span>{errors.bio.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Role (Read-Only / System Managed) */}
      <div className="mhn-about-field-group">
        <label className="mhn-about-field-label">
          Role <span className="mhn-sub-label-light">(Managed by system)</span>
        </label>
        <div className="mhn-relative-container">
          <Input
            type="text"
            value={role}
            disabled
            className="mhn-about-input-box mhn-about-input-disabled"
            title="Role cannot be changed"
          />
        </div>
      </div>

      {/* Position (Only for Players) */}
      {isPlayer && (
        <Dropdown
          label="Position"
          value={POSITION_OPTIONS.includes(values.position) ? values.position : 'Center'}
          options={POSITION_OPTIONS}
          onChange={(val) => form.setValue('position', val, { shouldValidate: form.formState.isSubmitted })}
          placeholder="Select position"
        />
      )}

      {/* Jersey Number (Only for Players) */}
      {isPlayer && (
        <div className="mhn-about-field-group">
          <label className="mhn-about-field-label">Jersey Number</label>
          <div className="mhn-relative-container">
            <Input
              type="number"
              value={values.jerseyNumber}
              onChange={(e) => form.setValue('jerseyNumber', e.target.value, { shouldValidate: form.formState.isSubmitted })}
              className={`mhn-about-input-box ${errors.jerseyNumber ? 'mhn-edit-profile-input-error' : ''}`}
              placeholder="e.g. 97"
            />
            {errors.jerseyNumber && (
              <div className="mhn-edit-profile-field-error">
                <span>{errors.jerseyNumber.message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save & Feedback Row */}
      <div className="mhn-btn-loading-flex mhn-mt-12">
        <Button
          type="button"
          className="mhn-about-btn-save mhn-btn-primary-compact"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving && <Spinner size="sm" color="#FFFFFF" />}
          <span>Save Changes</span>
        </Button>
        <Button
          type="button"
          className="mhn-about-btn-cancel mhn-btn-cancel-compact"
          onClick={() => form.reset({ bio, position, jerseyNumber })}
        >
          Cancel
        </Button>
        {saveMessage && (
          <span className="mhn-success-text-sm">
            ✅ {saveMessage}
          </span>
        )}
      </div>
    </div>
  );
}
