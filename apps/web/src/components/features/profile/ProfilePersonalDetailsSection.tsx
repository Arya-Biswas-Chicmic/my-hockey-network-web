'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { PersonalDetailsFields } from '@/components/features/profile/PersonalDetailsFields';
import {
  profilePersonalDetailsFormSchema,
  type ProfilePersonalDetailsFormValues,
} from '@my-hockey-network/validation';

export interface ProfilePersonalDetailsSectionProps {
  city: string;
  dateOfBirth: string;
  genderCategory: string;
  isSaving: boolean;
  saveMessage: string | null;
  onSave: (values: ProfilePersonalDetailsFormValues) => Promise<void> | void;
}

/**
 * Profile > About > Personal Details form. RHF + Zod
 * (`profilePersonalDetailsFormSchema`) replaces the hand-rolled
 * `useState`/manual-error-object pair this used to be. Reuses the existing
 * controlled `PersonalDetailsFields` renderer — bridged via `form.watch()`/
 * `form.setValue()` rather than `Controller`, since that component owns
 * several related fields as one unit, not one field per `Controller`.
 * Extracted from `screens/profile-page.tsx`.
 */
export function ProfilePersonalDetailsSection({
  city,
  dateOfBirth,
  genderCategory,
  isSaving,
  saveMessage,
  onSave,
}: Readonly<ProfilePersonalDetailsSectionProps>) {
  const form = useForm<ProfilePersonalDetailsFormValues>({
    resolver: zodResolver(profilePersonalDetailsFormSchema),
    mode: 'onChange',
    defaultValues: { city, dateOfBirth, genderCategory },
  });

  useEffect(() => {
    form.reset({ city, dateOfBirth, genderCategory });
  }, [city, dateOfBirth, genderCategory]);

  const errors = form.formState.errors;
  const watchedValues = useWatch({ control: form.control });
  const values: ProfilePersonalDetailsFormValues = {
    city: watchedValues.city ?? '',
    dateOfBirth: watchedValues.dateOfBirth ?? '',
    genderCategory: watchedValues.genderCategory ?? '',
  };
  const handleSubmit = form.handleSubmit((data) => onSave(data));

  return (
    <div className="mhn-about-section-content mhn-col-flex-gap-20">
      <PersonalDetailsFields
        values={values}
        onChange={(field, val) => form.setValue(field, val, { shouldValidate: form.formState.isSubmitted })}
        errors={{
          city: errors.city?.message ?? '',
          dateOfBirth: errors.dateOfBirth?.message ?? '',
          genderCategory: errors.genderCategory?.message ?? '',
        }}
      />

      {/* Save & Feedback Row */}
      <div className="mhn-btn-loading-flex mhn-mt-4">
        <Button
          type="button"
          className="mhn-about-btn-save mhn-btn-primary-compact"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving && <Spinner size="sm" color="#FFFFFF" />}
          <span>Save Details</span>
        </Button>
        <Button
          type="button"
          className="mhn-about-btn-cancel mhn-btn-cancel-compact"
          onClick={() => form.reset({ city, dateOfBirth, genderCategory })}
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
