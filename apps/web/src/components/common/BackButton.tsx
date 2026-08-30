import React from 'react';
import { Button } from '@/components/common/Button';

export interface BackButtonProps {
  onClick: () => void;
  /** Override the label where a step needs more specific wording. */
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * The shared "go to the previous step" control for multi-step flows.
 *
 * Extracted because each step in the parent add-player flow hand-rolled its own
 * copy, and they had already drifted: two used `.mhn-parent-btn-secondary` while
 * `LinkExistingPlayerStep` used `.mhn-btn-outline`, so the same action rendered
 * as two different buttons depending on which step you were on.
 */
export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = 'Back',
  disabled,
  className,
}) => (
  <Button
    type="button"
    className={`mhn-parent-btn-secondary${className ? ` ${className}` : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </Button>
);
