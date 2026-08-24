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

      <div className="mhn-parent-icon-circle mhn-blue">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>

      <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '4px', textAlign: 'center' }}>
        No players added yet
      </div>
      <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px', textAlign: 'center' }}>
        Add the players you're responsible for managing.
      </div>

      <div className="mhn-parent-info-banner">
        <span style={{ fontSize: '14px', flexShrink: 0 }}>ℹ️</span>
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
