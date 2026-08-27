'use client';

import { PlayerDetailsFormFields, type PlayerDetailsFormValues } from '@/components/features/parent/PlayerDetailsFormFields';

export type PlayerDetailsFormData = PlayerDetailsFormValues;

interface CreatePlayerDetailsStepProps {
  formData: PlayerDetailsFormData;
  onChange: (updated: Partial<PlayerDetailsFormData>) => void;
  onContinue: () => void;
  onBack: () => void;
}

/**
 * `ParentOnboardingModal`'s "Player Details" step. Thin wrapper around the
 * shared `PlayerDetailsFormFields` (also used by Supervision's "+ Add
 * Player" flow) that adapts it to this step's controlled
 * `formData`/`onChange`/`onContinue`/`onBack` contract, since
 * `ParentOnboardingModal` owns this data across the whole multi-step flow.
 */
export const CreatePlayerDetailsStep: React.FC<CreatePlayerDetailsStepProps> = ({
  formData,
  onChange,
  onContinue,
  onBack,
}) => {
  const handleSubmit = (values: PlayerDetailsFormValues) => {
    onChange(values);
    onContinue();
  };

  return (
    <PlayerDetailsFormFields
      defaultValues={formData}
      onSubmit={handleSubmit}
      onBack={onBack}
    />
  );
};
