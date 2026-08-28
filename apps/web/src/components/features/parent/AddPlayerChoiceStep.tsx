import React from 'react';
import { Button } from '@/components/common/Button';
import { ChevronRight, Link2, Plus } from 'lucide-react';

interface AddPlayerChoiceStepProps {
  onCreateNew: () => void;
  onLinkExisting: () => void;
}

interface ChoiceOption {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  onSelect: () => void;
  /** Renders the highlighted/primary treatment. */
  active?: boolean;
}

/**
 * Renders one option card. Colors come entirely from `.mhn-parent-choice-card`
 * and its `.mhn-active` state in `index.css`, which resolve from theme tokens —
 * the card must not name a color itself.
 */
function ChoiceCard({ icon, title, description, onSelect, active }: ChoiceOption) {
  return (
    <Button
      type="button"
      className={`mhn-parent-choice-card${active ? ' mhn-active' : ''}`}
      onClick={onSelect}
    >
      <div className="mhn-parent-flex-row-center-16">
        <span className="mhn-parent-choice-icon" aria-hidden="true">{icon}</span>
        <div>
          <div className="mhn-parent-card-title">{title}</div>
          <div className="mhn-parent-card-sub">{description}</div>
        </div>
      </div>
      <ChevronRight className="mhn-parent-chevron" aria-hidden="true" />
    </Button>
  );
}

export const AddPlayerChoiceStep: React.FC<AddPlayerChoiceStepProps> = ({
  onCreateNew,
  onLinkExisting,
}) => {
  const options: ChoiceOption[] = [
    {
      id: 'create',
      icon: <Plus />,
      title: 'Create a new player profile',
      description: 'Set up a player profile for your child.',
      onSelect: onCreateNew,
      active: true,
    },
    {
      id: 'link',
      icon: <Link2 />,
      title: 'Link an existing player',
      description: 'Connect with a player who already has a MyHockey account.',
      onSelect: onLinkExisting,
    },
  ];

  return (
    <div className="mhn-parent-step-container mhn-parent-step-choice">
      <h2 className="mhn-parent-step-title">How would you like to add them?</h2>

      <div className="mhn-parent-stack-gap-16">
        {options.map((option) => (
          <ChoiceCard key={option.id} {...option} />
        ))}
      </div>
    </div>
  );
};
