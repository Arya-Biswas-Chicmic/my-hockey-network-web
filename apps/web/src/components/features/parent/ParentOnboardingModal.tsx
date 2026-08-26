import React, { useState } from 'react';
import { ParentHeroCard } from './ParentHeroCard';
import { WhoDoYouManageStep } from './WhoDoYouManageStep';
import { AddPlayerChoiceStep } from './AddPlayerChoiceStep';
import { CreatePlayerDetailsStep, PlayerDetailsFormData } from './CreatePlayerDetailsStep';
import { CreatePlayerProtectStep, PlayerProtectFormData } from './CreatePlayerProtectStep';
import { LinkExistingPlayerStep } from './LinkExistingPlayerStep';
import { PlayerAddedSuccessStep } from './PlayerAddedSuccessStep';
import { createManagedChild, sendGuardianInvite } from '@my-hockey-network/core';
import type { CreateManagedChildDTO } from '@my-hockey-network/core';
import { formatDobToIso } from '../../../utils/guardianUtils';

export enum ParentOnboardingStep {
  WHO_MANAGE = 'WHO_MANAGE',
  CHOOSE_METHOD = 'CHOOSE_METHOD',
  CREATE_STEP_1 = 'CREATE_STEP_1',
  CREATE_STEP_2 = 'CREATE_STEP_2',
  LINK_EXISTING = 'LINK_EXISTING',
  SUCCESS = 'SUCCESS',
}

export interface ParentOnboardingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onComplete?: (data?: any) => void;
  isStandaloneModal?: boolean;
}

export const ParentOnboardingModal: React.FC<ParentOnboardingModalProps> = ({
  isOpen = true,
  onClose,
  onComplete,
  isStandaloneModal = false,
}) => {
  const [step, setStep] = useState<ParentOnboardingStep>(ParentOnboardingStep.WHO_MANAGE);

  const [detailsForm, setDetailsForm] = useState<PlayerDetailsFormData>({
    fullName: '',
    dateOfBirth: '',
    guardianRelation: 'MOTHER',
    email: '',
  });

  const [protectForm, setProtectForm] = useState<PlayerProtectFormData>({
    profileVisibility: 'CONNECTIONS',
    requireApprovalAdultContact: true,
    requireApprovalConnections: true,
    requireApprovalTeamInvites: true,
    requireApprovalMedia: true,
  });

  const [childEmailInput, setChildEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    type: 'create' | 'link';
    playerName: string;
    childEmail?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCreatePlayerSubmit = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const nameParts = detailsForm.fullName.trim().split(' ');
      const firstName = nameParts[0] || 'Player';
      const lastName = nameParts.slice(1).join(' ').trim();

      const dto: CreateManagedChildDTO = {
        displayName: detailsForm.fullName.trim(),
        firstName,
        lastName: lastName || undefined,
        dateOfBirth: formatDobToIso(detailsForm.dateOfBirth) || detailsForm.dateOfBirth,
        guardianRelation: detailsForm.guardianRelation,
        email: detailsForm.email.trim() || undefined,
        ...protectForm,
      };

      const res = await createManagedChild(dto);
      setSuccessData({
        type: 'create',
        playerName: res?.child?.displayName || detailsForm.fullName.trim(),
      });
      setStep(ParentOnboardingStep.SUCCESS);
    } catch (err: any) {
      console.error('Create Player Error:', err);
      setErrorMessage(err.message || 'Failed to create player profile. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPlayerSubmit = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      await sendGuardianInvite(childEmailInput.trim());
      setSuccessData({
        type: 'link',
        playerName: childEmailInput.trim(),
        childEmail: childEmailInput.trim(),
      });
      setStep(ParentOnboardingStep.SUCCESS);
    } catch (err: any) {
      console.error('Link Player Error:', err);
      setErrorMessage(err.message || 'Failed to send invitation. Please check email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (onComplete) onComplete(successData);
    else if (onClose) onClose();
  };

  const handleAddAnother = () => {
    setDetailsForm({ fullName: '', dateOfBirth: '', guardianRelation: 'MOTHER', email: '' });
    setChildEmailInput('');
    setSuccessData(null);
    setErrorMessage(null);
    setStep(ParentOnboardingStep.CHOOSE_METHOD);
  };

  const playerNameFirst = detailsForm.fullName.trim().split(' ')[0] || 'Noah';

  return (
    <div className={`mhn-parent-modal-overlay ${isStandaloneModal ? 'mhn-standalone' : 'mhn-inline'}`}>
      <div className="mhn-parent-modal-card">
        {isStandaloneModal && <ParentHeroCard />}

        <div className="mhn-parent-form-panel">
          {errorMessage && (
            <div className="mhn-parent-error-banner">{errorMessage}</div>
          )}

          {step === ParentOnboardingStep.WHO_MANAGE && (
            <WhoDoYouManageStep
              onAddPlayer={() => setStep(ParentOnboardingStep.CHOOSE_METHOD)}
              onSkip={handleFinish}
            />
          )}

          {step === ParentOnboardingStep.CHOOSE_METHOD && (
            <AddPlayerChoiceStep
              onCreateNew={() => setStep(ParentOnboardingStep.CREATE_STEP_1)}
              onLinkExisting={() => setStep(ParentOnboardingStep.LINK_EXISTING)}
              onBack={() => setStep(ParentOnboardingStep.WHO_MANAGE)}
            />
          )}

          {step === ParentOnboardingStep.CREATE_STEP_1 && (
            <CreatePlayerDetailsStep
              formData={detailsForm}
              onChange={(updated) => setDetailsForm((prev) => ({ ...prev, ...updated }))}
              onContinue={() => setStep(ParentOnboardingStep.CREATE_STEP_2)}
              onBack={() => setStep(ParentOnboardingStep.CHOOSE_METHOD)}
            />
          )}

          {step === ParentOnboardingStep.CREATE_STEP_2 && (
            <CreatePlayerProtectStep
              playerNameFirst={playerNameFirst}
              formData={protectForm}
              onChange={(updated) => setProtectForm((prev) => ({ ...prev, ...updated }))}
              onSubmit={handleCreatePlayerSubmit}
              onBack={() => setStep(ParentOnboardingStep.CREATE_STEP_1)}
              loading={loading}
            />
          )}

          {step === ParentOnboardingStep.LINK_EXISTING && (
            <LinkExistingPlayerStep
              childEmail={childEmailInput}
              onChangeEmail={setChildEmailInput}
              onSubmit={handleLinkPlayerSubmit}
              onBack={() => setStep(ParentOnboardingStep.CHOOSE_METHOD)}
              loading={loading}
            />
          )}

          {step === ParentOnboardingStep.SUCCESS && (
            <PlayerAddedSuccessStep
              playerName={successData?.playerName || 'Player'}
              type={successData?.type}
              childEmail={successData?.childEmail}
              onFinish={handleFinish}
              onAddAnother={handleAddAnother}
            />
          )}
        </div>
      </div>
    </div>
  );
};
