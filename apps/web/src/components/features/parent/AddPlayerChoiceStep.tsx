import React from 'react';
import { Button } from '../../common/Button';

interface AddPlayerChoiceStepProps {
  onCreateNew: () => void;
  onLinkExisting: () => void;
  onBack: () => void;
}

export const AddPlayerChoiceStep: React.FC<AddPlayerChoiceStepProps> = ({
  onCreateNew,
  onLinkExisting,
  onBack,
}) => {
  return (
    <div className="mhn-parent-step-container">
      <h2 className="mhn-parent-step-title">How would you like to add them?</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '28px' }}>
        <div className="mhn-parent-choice-card mhn-active" onClick={onCreateNew}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="mhn-parent-choice-icon-box mhn-blue">+</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                Create a new player profile
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                Set up a player profile for your child.
              </div>
            </div>
          </div>
          <div style={{ fontSize: '18px', color: '#1D6AE5', fontWeight: 700 }}>›</div>
        </div>

        <div className="mhn-parent-choice-card" onClick={onLinkExisting}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="mhn-parent-choice-icon-box mhn-gray">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                Link an existing player
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                Connect with a player who already has a account.
              </div>
            </div>
          </div>
          <div style={{ fontSize: '18px', color: '#94A3B8', fontWeight: 700 }}>›</div>
        </div>
      </div>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <Button type="button" className="mhn-parent-btn-back" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
};
