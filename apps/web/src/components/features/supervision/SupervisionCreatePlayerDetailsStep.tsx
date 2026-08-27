'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/common/Button';
import { Input, Dropdown, FormField } from '@/components/common/FormControls';
import { DatePickerButton } from '@/components/ui/date-picker-button';
import { GUARDIAN_RELATION_OPTIONS, formatDobInput } from '@/utils/guardianUtils';
import { createPlayerDetailsFormSchema, type CreatePlayerDetailsFormValues } from '@my-hockey-network/validation';

export interface SupervisionCreatePlayerDetailsStepProps {
  onContinue: (values: CreatePlayerDetailsFormValues) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const DEFAULT_VALUES: CreatePlayerDetailsFormValues = {
  fullName: '',
  dob: '',
  relationship: 'MOTHER',
  email: '',
};

/**
 * Supervision > Add Player > "Player Details" step. RHF + Zod
 * (`createPlayerDetailsFormSchema`) replaces the hand-rolled
 * `newPlayer`/`supervisionPlayerTouched` state and four separate
 * `getSupervisionXError()` functions this used to be. Extracted from
 * `screens/supervision-page.tsx`.
 */
export function SupervisionCreatePlayerDetailsStep({ onContinue, onBack, isSubmitting }: Readonly<SupervisionCreatePlayerDetailsStepProps>) {
  const form = useForm<CreatePlayerDetailsFormValues>({
    resolver: zodResolver(createPlayerDetailsFormSchema),
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });

  const watchedValues = useWatch({ control: form.control });
  const values: CreatePlayerDetailsFormValues = {
    fullName: watchedValues.fullName ?? '',
    dob: watchedValues.dob ?? '',
    relationship: watchedValues.relationship ?? 'MOTHER',
    email: watchedValues.email ?? '',
  };
  const errors = form.formState.errors;

  const handleSubmit = form.handleSubmit((data) => onContinue(data));

  return (
    <div className="mhn-flow-container mhn-flow-form-wrapper">
      <h2 className="mhn-flow-title">Player Details</h2>
      <p className="mhn-flow-subtitle">Tell us a little about your player.</p>

      <div className="mhn-form-fields-stack">
        <FormField label="Full Name" required error={errors.fullName?.message} maxLength={50} valueLength={values.fullName.length}>
          <Input
            type="text"
            value={values.fullName}
            onChange={(e) => form.setValue('fullName', e.target.value, { shouldValidate: form.formState.isSubmitted })}
            maxLength={50}
            placeholder="e.g. Connor McDavid"
            className={`mhn-form-input ${errors.fullName || values.fullName.length >= 50 ? 'mhn-input-error' : ''}`}
          />
        </FormField>

        <FormField label="DOB" required error={errors.dob?.message}>
          <div className="mhn-form-date-input-wrapper mhn-relative-container">
            <Input
              type="text"
              value={values.dob}
              onChange={(e) => form.setValue('dob', formatDobInput(e.target.value), { shouldValidate: form.formState.isSubmitted })}
              maxLength={10}
              placeholder="DD/MM/YYYY"
              className={`mhn-form-input ${errors.dob ? 'mhn-input-error' : ''}`}
            />
            <DatePickerButton
              className="mhn-calendar-icon mhn-calendar-icon-pos"
              onDateSelected={(dateVal) => {
                const [yyyy, mm, dd] = dateVal.split('-');
                if (yyyy && mm && dd) {
                  form.setValue('dob', `${dd}/${mm}/${yyyy}`, { shouldValidate: form.formState.isSubmitted });
                }
              }}
            />
          </div>
        </FormField>

        <Dropdown
          label="Relationship to player"
          required
          error={errors.relationship?.message}
          value={values.relationship}
          options={GUARDIAN_RELATION_OPTIONS}
          onChange={(val) => form.setValue('relationship', val, { shouldValidate: form.formState.isSubmitted })}
          placeholder="Select relationship"
        />

        <FormField label="Email" required error={errors.email?.message}>
          <Input
            type="email"
            value={values.email}
            onChange={(e) => form.setValue('email', e.target.value, { shouldValidate: form.formState.isSubmitted })}
            placeholder="admin@gmail.com"
            className={`mhn-form-input ${errors.email ? 'mhn-input-error' : ''}`}
          />
        </FormField>
      </div>

      <div className="mhn-form-actions-stack">
        <Button type="submit" disabled={isSubmitting} className="mhn-btn-modal-submit" onClick={handleSubmit}>
          Continue
        </Button>
        <Button type="button" className="mhn-btn-modal-cancel" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}
