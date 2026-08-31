'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { supervisionBlockedMessage } from '@my-hockey-network/domain';
import type { PermissionControlKey } from '@my-hockey-network/contracts';
import { Button } from '@/components/common/Button';

export interface PermissionCardProps {
  /** The supervision control that is blocked. */
  control: PermissionControlKey | string;
  /** Heading. Defaults to a generic restriction title. */
  title?: string;
  /** Body copy. Defaults to the domain's message for `control`. */
  message?: string;
  /** Optional action, e.g. "Ask my parent". Omitted when not supplied. */
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Full-panel "your guardian hasn't enabled this" state, built on the same
 * anatomy as `ServerDownScreen` — status pill, icon circle, title, description,
 * optional action — so a blocked feed reads as a deliberate app state rather
 * than a failure.
 *
 * Unlike `ServerDownScreen` this is **not** an overlay: a supervision
 * restriction is a normal condition of the page, not an interruption, so it
 * renders inline where the blocked content would have been. Use
 * `PermissionNotice` instead for a single blocked control inside an otherwise
 * working screen; this is for when the whole surface is unavailable.
 */
export const PermissionCard: React.FC<PermissionCardProps> = ({
  control,
  title = 'Restricted by your guardian',
  message,
  actionLabel,
  onAction,
  className,
}) => (
  <div
    className={`mhn-permission-card${className ? ` ${className}` : ''}`}
    role="note"
  >
    <div className="mhn-permission-card-status-pill">
      <span aria-hidden="true">●</span> PARENTAL CONTROLS
    </div>

    <div className="mhn-permission-card-icon-circle">
      <ShieldAlert size={40} aria-hidden="true" />
    </div>

    <h2 className="mhn-permission-card-title">{title}</h2>

    <p className="mhn-permission-card-description">
      {message ?? supervisionBlockedMessage(control)}
    </p>

    {actionLabel && onAction && (
      <Button onClick={onAction} className="mhn-permission-card-btn">
        {actionLabel}
      </Button>
    )}
  </div>
);
