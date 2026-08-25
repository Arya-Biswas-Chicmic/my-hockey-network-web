import React from 'react';
import { Button } from '../../common/Button';

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

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <img src="./manage.png" alt="Manage" className="manage" />
      </div>

      <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '4px', textAlign: 'center' }}>
        No players added yet
      </div>
      <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px', textAlign: 'center' }}>
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
      <div style={{ height: '12px' }} />
      <Button type="button" className="mhn-parent-btn-secondary" onClick={onSkip}>
        Skip for now
      </Button>
    </div>
  );
};
