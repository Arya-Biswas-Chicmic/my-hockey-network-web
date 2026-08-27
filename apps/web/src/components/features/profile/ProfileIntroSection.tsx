'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import { Spinner } from '@/components/common/Spinner';
import { FormInput, FormSelect, FormTextarea } from '@/components/form/fields';
import { Form } from '@/components/ui/form';
import { profileIntroFormSchema, type ProfileIntroFormValues } from '@my-hockey-network/validation';

const POSITION_OPTIONS = ['Center', 'Left Wing', 'Right Wing', 'Defense', 'Goaltender'].map(
  (positionOption) => ({ value: positionOption, label: positionOption }),
);

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

  const handleSubmit = form.handleSubmit((data) => onSave(data));

  return (
    <Form methods={form} onSubmit={handleSubmit} className="mhn-about-intro-form">
      <FormTextarea<ProfileIntroFormValues, 'bio'>
        name="bio"
        label="Bio"
        rows={3}
        placeholder="Write something about yourself..."
        containerClassName="mhn-about-field-group"
        textareaClassName="mhn-about-input-box mhn-about-textarea-box"
      />

      {/* Primary Role (Read-Only / System Managed) */}
      <div className="mhn-about-field-group">
        <label className="mhn-about-field-label" htmlFor="profile-system-role">
          Role <span className="mhn-sub-label-light">(Managed by system)</span>
        </label>
        <div className="mhn-relative-container">
          <Input
            id="profile-system-role"
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
        <FormSelect<ProfileIntroFormValues, 'position'>
          name="position"
          label="Position"
          options={POSITION_OPTIONS}
          containerClassName="mhn-about-field-group"
          selectClassName="mhn-dropdown-select"
        />
      )}

      {/* Jersey Number (Only for Players) */}
      {isPlayer && (
        <FormInput<ProfileIntroFormValues, 'jerseyNumber'>
          name="jerseyNumber"
          label="Jersey Number"
          type="number"
          placeholder="e.g. 97"
          containerClassName="mhn-about-field-group"
          inputClassName="mhn-about-input-box"
          errorClassName="mhn-edit-profile-field-error"
          disableAutoSanitize
        />
      )}

      {/* Save & Feedback Row */}
      <div className="mhn-btn-loading-flex mhn-mt-12">
        <Button
          type="submit"
          className="mhn-about-btn-save mhn-btn-primary-compact"
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
            <CheckCircle2 size={16} aria-hidden="true" />
            {saveMessage}
          </span>
        )}
      </div>
    </Form>
  );
}
