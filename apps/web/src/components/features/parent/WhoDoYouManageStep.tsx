import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/common/Button';

interface WhoDoYouManageStepProps {
  onAddPlayer: () => void;
  onSkip: () => void;
}

export const WhoDoYouManageStep: React.FC<WhoDoYouManageStepProps> = ({ onAddPlayer, onSkip }) => {
  return (
    <div className="mhn-parent-step-container">
      <h2 className="mhn-parent-step-title">Who do you manage?</h2>
      <p className="mhn-parent-step-desc">
        Add the players you&apos;re responsible for. You can add more later.
      </p>

      <div className="mhn-flex-justify-center mhn-mb-16">
        <Image src="/manage.png" alt="Manage" width={96} height={96} className="manage" />
      </div>

      <div className="mhn-parent-card-title mhn-text-center">
        No players added yet
      </div>
      <div className="mhn-parent-card-sub mhn-text-center mhn-mb-24">
        Add the players you&apos;re responsible for managing.
      </div>

      <div className="mhn-parent-info-banner">
        <Image src="/secure.png" alt="secure" width={18} height={22} className="secure" />
        <span>
          For minor players, you&apos;ll control privacy, team relationships, and contact permissions.
        </span>
      </div>

      <Button type="button" className="mhn-parent-btn-primary" onClick={onAddPlayer}>
        Add a Player
      </Button>
      <div className="mhn-h-12" />
      <Button type="button" className="mhn-parent-btn-secondary" onClick={onSkip}>
        Skip for now
      </Button>
    </div>
  );
};
