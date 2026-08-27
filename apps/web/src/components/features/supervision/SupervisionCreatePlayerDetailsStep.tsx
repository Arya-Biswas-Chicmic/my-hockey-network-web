'use client';

import { PlayerDetailsFormFields, type PlayerDetailsFormValues } from '@/components/features/parent/PlayerDetailsFormFields';

export interface SupervisionCreatePlayerDetailsStepProps {
  onContinue: (values: PlayerDetailsFormValues) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

/**
 * Supervision > Add Player > "Player Details" step. Thin wrapper around the
 * shared `PlayerDetailsFormFields` (also used by signup's
 * `ParentOnboardingModal`) so both "Add Player" flows use the same fields,
 * validation, and `createManagedChild` DTO shape.
 */
export function SupervisionCreatePlayerDetailsStep({ onContinue, onBack, isSubmitting }: Readonly<SupervisionCreatePlayerDetailsStepProps>) {
  return (
    <PlayerDetailsFormFields
      onSubmit={onContinue}
      onBack={onBack}
      isSubmitting={isSubmitting}
    />
  );
}
