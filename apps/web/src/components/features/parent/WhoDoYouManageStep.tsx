import React from 'react';
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
        Add the players you're responsible for. You can add more later.
      </p>

      <div className="mhn-flex-justify-center mhn-mb-16">
        <img src="./manage.png" alt="Manage" className="manage" />
      </div>

      <div className="mhn-parent-card-title mhn-text-center">
        No players added yet
      </div>
      <div className="mhn-parent-card-sub mhn-text-center mhn-mb-24">
        Add the players you're responsible for managing.
      </div>

      <div className="mhn-parent-info-banner">
        <img src='./secure.png' alt='secure' className='secure'/>
        <span>
          For minor players, you'll control privacy, team relationships, and contact permissions.
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
