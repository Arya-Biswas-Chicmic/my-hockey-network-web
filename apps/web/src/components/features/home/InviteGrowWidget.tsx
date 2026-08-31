import Image from 'next/image';
import React from 'react';
import { Button } from '@/components/common/Button';

interface InviteGrowWidgetProps {
  onInviteClick?: () => void;
  illustrationUrl?: string;
  lightIllustrationUrl?: string;
}

/** Matches Figma node 1806:16060/1993:19390 exactly (feedback 2026-08-29:
 * "check figma keep that section exactly same" / "background color used in
 * the invite & grow is not matching figma... check figma again") — border-
 * only card (no fill), `#1d2432` border, `--color-primary` button, and the
 * design's own glowing skater illustration exported as one flattened PNG
 * (`download_assets` on node 1806:16066 — that subtree is ~30 tiny mix-
 * blend-mode SVG layers, not something to hand-port piece by piece) rather
 * than the generic `/player.webp` placeholder this used before.
 * Styling lives entirely in `index.css`'s `.mhn-invite-grow-*` classes, not
 * Tailwind utilities on this element — a prior pass here added `border`/
 * `bg-*`/spacing utilities directly in this file's `className`, which
 * silently lost to a leftover legacy `.mhn-invite-grow-card` rule (same
 * specificity, so only source order decided) and to a `:root.dark`
 * override two classes deep (which always won regardless of order) —
 * see that CSS class's own comment for the full story. Structural chrome
 * for a shared component belongs in its one `index.css` definition. */
export const InviteGrowWidget: React.FC<InviteGrowWidgetProps> = ({
  onInviteClick,
  illustrationUrl = '/invite-grow-illustration.png',
  lightIllustrationUrl = '/InviteGrow.webp',
}) => {
  return (
    <div className="mhn-invite-grow-card">
      <div className="mhn-invite-grow-content">
        <div>
          <h4 className="mhn-invite-grow-title">Invite &amp; Grow</h4>
          <p className="mhn-invite-grow-desc">
            Invite players, coaches, and families to grow your hockey network.
          </p>
        </div>

        <Button onClick={onInviteClick} className="mhn-btn-invite-now">
          Invite Now
        </Button>
      </div>

      <div className="mhn-invite-grow-illustration">
        <Image
          src={illustrationUrl}
          alt=""
          fill
          aria-hidden="true"
          className="mhn-invite-illustration-img mhn-invite-illustration-img-dark object-contain object-bottom-right"
        />
        <Image
          src={lightIllustrationUrl}
          alt=""
          fill
          aria-hidden="true"
          className="mhn-invite-illustration-img mhn-invite-illustration-img-light object-contain object-bottom-right"
        />
      </div>
    </div>
  );
};
