'use client';

import React from 'react';
import Image from 'next/image';
import { supervisionBlockedMessage } from '@my-hockey-network/domain';
import type { PermissionControlKey } from '@my-hockey-network/contracts';
import { useAuth } from '@/hooks/use-auth';

export interface PermissionGateProps {
  /** The supervision control this action requires, e.g. `COMMENT_ON_POSTS`. */
  control: PermissionControlKey | string;
  children: React.ReactNode;
  /**
   * What to render when the control is blocked.
   * - `children` (default): render the action but let `useGatedAction` explain
   *   on click. Use where hiding the control would make the UI confusing.
   * - `notice`: replace it with an inline locked message.
   * - `hide`: render nothing.
   */
  blockedAs?: 'children' | 'notice' | 'hide';
  /** Overrides the domain's default copy for this control. */
  message?: string;
  className?: string;
}

/**
 * Wraps a supervised action and reacts to whether the child's guardian has
 * enabled it.
 *
 * Before this existed the same decision was made three different ways — the
 * `can*` flags from `useFeedPermissions`, `checkSupervisionPermission` from the
 * auth context, and ad-hoc `title="Parent did not give permission"` attributes —
 * with three different messages. This is the single entry point; the copy comes
 * from `supervisionBlockedMessage` in the domain.
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  control,
  children,
  blockedAs = 'children',
  message,
  className,
}) => {
  const { checkSupervisionPermission } = useAuth();

  if (checkSupervisionPermission(String(control))) return <>{children}</>;
  if (blockedAs === 'hide') return null;
  if (blockedAs === 'children') return <>{children}</>;

  return <PermissionNotice control={control} message={message} className={className} />;
};

export interface PermissionNoticeProps {
  /** The supervision control that is blocked. */
  control: PermissionControlKey | string;
  /** Overrides the domain's default copy for this control. */
  message?: string;
  className?: string;
}

/**
 * The standalone "your guardian hasn't enabled this" panel.
 *
 * Use this where the caller has *already* branched on the permission (a screen
 * that swaps its whole body, for example) and only needs the message. Where the
 * component should decide for itself, use `PermissionGate` instead.
 */
export const PermissionNotice: React.FC<PermissionNoticeProps> = ({
  control,
  message,
  className,
}) => (
  <div className={`mhn-permission-notice${className ? ` ${className}` : ''}`} role="note">
    <Image
      src="/info.webp"
      alt=""
      width={16}
      height={16}
      className="mhn-permission-notice-icon"
    />
    <span>{message ?? supervisionBlockedMessage(control)}</span>
  </div>
);

export interface GatedAction {
  /** Whether the guardian has enabled this action. */
  allowed: boolean;
  /** The reason to surface when it is blocked; `undefined` when allowed. */
  blockedMessage?: string;
  /** Native `title` for the trigger — `undefined` when allowed. */
  title?: string;
  /**
   * Wraps a handler so a blocked action explains itself with a toast instead of
   * silently doing nothing.
   */
  run: (allowedAction: () => void) => void;
}

/**
 * The imperative half of `PermissionGate`, for click handlers.
 *
 * ```tsx
 * const comment = useGatedAction(PermissionControlKey.COMMENT_ON_POSTS);
 * // The control keeps its own icon; only its enabled state changes.
 * <Button
 *   disabled={!comment.allowed}
 *   title={comment.title}
 *   onClick={() => comment.run(openComments)}
 * >
 *   <CommentIcon />
 * </Button>
 * ```
 */
export function useGatedAction(control: PermissionControlKey | string, message?: string): GatedAction {
  const { checkSupervisionPermission, showToast } = useAuth();
  const allowed = checkSupervisionPermission(String(control));
  const blockedMessage = allowed ? undefined : message ?? supervisionBlockedMessage(control);

  return {
    allowed,
    blockedMessage,
    title: blockedMessage,
    run: (allowedAction: () => void) => {
      if (!allowed) {
        if (blockedMessage) showToast(blockedMessage, 'error');
        return;
      }
      allowedAction();
    },
  };
}
