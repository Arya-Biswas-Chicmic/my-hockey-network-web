import React from 'react';
import { Button } from '@/components/common/Button';
import { ChevronRight, Link2, Plus } from 'lucide-react';

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
    <div className="mhn-parent-step-container mhn-parent-step-choice">
      <h2 className="mhn-parent-step-title">How would you like to add them?</h2>

      <div className="mhn-parent-stack-gap-16">
        <Button type="button" className="mhn-parent-choice-card mhn-active" onClick={onCreateNew}>
          <div className="mhn-parent-flex-row-center-16">
            <span className="mhn-parent-choice-icon" aria-hidden="true"><Plus /></span>
            <div>
              <div className="mhn-parent-card-title">
                Create a new player profile
              </div>
              <div className="mhn-parent-card-sub">
                Set up a player profile for your child.
              </div>
            </div>
          </div>
          <ChevronRight className="mhn-parent-chevron-blue" aria-hidden="true" />
        </Button>

        <Button type="button" className="mhn-parent-choice-card" onClick={onLinkExisting}>
          <div className="mhn-parent-flex-row-center-16">
            <span className="mhn-parent-choice-icon" aria-hidden="true"><Link2 /></span>
            <div>
              <div className="mhn-parent-card-title">
                Link an existing player
              </div>
              <div className="mhn-parent-card-sub">
                Connect with a player who already has a MyHockey account.
              </div>
            </div>
          </div>
          <ChevronRight className="mhn-parent-chevron-gray" aria-hidden="true" />
        </Button>
      </div>

      <div className="mhn-parent-actions-stack">
        <Button type="button" className="mhn-parent-btn-secondary" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
};
