'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/common/Button';
import { Input, Dropdown, FormField } from '@/components/common/FormControls';
import { GUARDIAN_RELATION_OPTIONS } from '@/utils/guardianUtils';
import { DatePickerButton } from '@/components/ui/date-picker-button';
import {
  parentOnboardingPlayerDetailsFormSchema,
  type ParentOnboardingPlayerDetailsFormValues,
} from '@my-hockey-network/validation';

export type PlayerDetailsFormData = ParentOnboardingPlayerDetailsFormValues;

interface CreatePlayerDetailsStepProps {
  formData: PlayerDetailsFormData;
  onChange: (updated: Partial<PlayerDetailsFormData>) => void;
  onContinue: () => void;
  onBack: () => void;
}

// Smart DOB auto-formatter: e.g. 10042020 -> 10/04/2020
function formatDobInput(val: string) {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/**
 * `ParentOnboardingModal`'s "Player Details" step. RHF + Zod
 * (`parentOnboardingPlayerDetailsFormSchema`, including its 5–100 year age
 * check) replaces the hand-rolled `touched`/`hasAttemptedSubmit` state and
 * four `getXError()` functions this used to be. Keeps the exact external
 * `formData`/`onChange`/`onContinue`/`onBack` controlled contract so
 * `ParentOnboardingModal` — which owns this data across the whole
 * multi-step flow — needs no changes: every field change still calls the
 * parent's `onChange`, this component just also validates via RHF now.
 */
export const CreatePlayerDetailsStep: React.FC<CreatePlayerDetailsStepProps> = ({
  formData,
  onChange,
  onContinue,
  onBack,
}) => {
  const form = useForm<PlayerDetailsFormData>({
    resolver: zodResolver(parentOnboardingPlayerDetailsFormSchema),
    mode: 'onChange',
    defaultValues: formData,
  });

  // No effect re-syncing `formData` back into the form: this step unmounts/
  // remounts on every step change in ParentOnboardingModal (conditional
  // rendering, not a persistent instance), so `defaultValues` above already
  // picks up the parent's current values on every fresh mount. An effect
  // keyed on `formData` would misfire on every keystroke instead — `onChange`
  // gives the parent a new object each time — resetting RHF's own state
  // (touched/errors/dirty) mid-type.
  const watchedValues = useWatch({ control: form.control });
  const values: PlayerDetailsFormData = {
    fullName: watchedValues.fullName ?? formData.fullName,
    dateOfBirth: watchedValues.dateOfBirth ?? formData.dateOfBirth,
    guardianRelation: watchedValues.guardianRelation ?? formData.guardianRelation,
    email: watchedValues.email ?? formData.email,
  };
  const errors = form.formState.errors;

  const setField = <K extends keyof PlayerDetailsFormData>(field: K, value: PlayerDetailsFormData[K]) => {
    form.setValue(field, value as never, { shouldValidate: form.formState.isSubmitted });
    onChange({ [field]: value } as Partial<PlayerDetailsFormData>);
  };

  const handleContinueClick = form.handleSubmit(() => onContinue());

  return (
    <div className="mhn-parent-step-container">
      <h2 className="mhn-parent-step-title">Player Details</h2>
      <p className="mhn-parent-step-desc">Tell us a little about your player.</p>

      <div className="mhn-col-flex-gap-18">
        <FormField label="Full Name" required error={errors.fullName?.message} maxLength={50} valueLength={values.fullName?.length}>
          <Input
            type="text"
            className={`auth-input ${errors.fullName || values.fullName.length >= 50 ? 'mhn-input-invalid' : ''}`}
            value={values.fullName}
            onChange={(e) => setField('fullName', e.target.value)}
            maxLength={50}
            placeholder="e.g. Connor McDavid"
          />
        </FormField>

        <FormField label="DOB" required error={errors.dateOfBirth?.message}>
          <div className="mhn-relative-container">
            <Input
              type="text"
              className={`auth-input ${errors.dateOfBirth ? 'mhn-input-invalid' : ''}`}
              value={values.dateOfBirth}
              onChange={(e) => setField('dateOfBirth', formatDobInput(e.target.value))}
              placeholder="DD/MM/YYYY"
              maxLength={10}
            />
            <DatePickerButton
              className="auth-input-icon auth-input-icon-clickable mhn-cursor-pointer"
              onDateSelected={(dateVal) => {
                const [yyyy, mm, dd] = dateVal.split('-');
                if (yyyy && mm && dd) setField('dateOfBirth', `${dd}/${mm}/${yyyy}`);
              }}
            />
          </div>
        </FormField>

        <Dropdown
          label="Relationship to player"
          required
          value={values.guardianRelation}
          options={GUARDIAN_RELATION_OPTIONS}
          onChange={(val) => {
            if (GUARDIAN_RELATION_OPTIONS.some((option) => option.value === val)) {
              setField('guardianRelation', val as PlayerDetailsFormData['guardianRelation']);
            }
          }}
          error={errors.guardianRelation?.message}
          placeholder="Select relationship"
        />

        <FormField label="Email" required error={errors.email?.message}>
          <Input
            type="email"
            className={`auth-input ${errors.email ? 'mhn-input-invalid' : ''}`}
            value={values.email}
            onValueChange={(value) => setField('email', value)}
            placeholder="e.g. admin@gmail.com"
          />
        </FormField>
      </div>

      <div className="mhn-parent-actions-stack">
        <Button type="button" className="mhn-parent-btn-primary" onClick={handleContinueClick}>
          Continue
        </Button>
        <Button type="button" className="mhn-parent-btn-secondary" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
};
