import React from 'react';
import { Button } from '@/components/common/Button';
import { Link } from 'lucide-react';

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

      <div className="mhn-parent-stack-gap-16">
        <div className="mhn-parent-choice-card mhn-active" onClick={onCreateNew}>
          <div className="mhn-parent-flex-row-center-16">
            <div className="mhn-parent-choice-icon-box mhn-blue">+</div>
            <div>
              <div className="mhn-parent-card-title">
                Create a new player profile
              </div>
              <div className="mhn-parent-card-sub">
                Set up a player profile for your child.
              </div>
            </div>
          </div>
          <div className="mhn-parent-chevron-blue">›</div>
        </div>

        <div className="mhn-parent-choice-card" onClick={onLinkExisting}>
          <div className="mhn-parent-flex-row-center-16">
            <div className="mhn-parent-choice-icon-box mhn-gray">
              <Link size={20} aria-hidden="true" />
            </div>
            <div>
              <div className="mhn-parent-card-title">
                Link an existing player
              </div>
              <div className="mhn-parent-card-sub">
                Connect with a player who already has a account.
              </div>
            </div>
          </div>
          <div className="mhn-parent-chevron-gray">›</div>
        </div>
      </div>

      <div className="mhn-parent-btn-center-row">
        <Button type="button" className="mhn-parent-btn-back" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
};
