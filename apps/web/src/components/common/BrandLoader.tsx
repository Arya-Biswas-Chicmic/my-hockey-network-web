import React from 'react';
import Image from 'next/image';

export interface BrandLoaderProps {
  /** Announced to assistive technology. Defaults to a generic loading message. */
  label?: string;
  /**
   * Fills the viewport and paints the page background. Use for a first paint
   * (root layout, auth bootstrap); leave off to centre inside an existing
   * container.
   */
  fullScreen?: boolean;
  className?: string;
}

/**
 * The app's branded loading state: the MHN logo centred with a pulsing glow and
 * a progress track beneath it.
 *
 * This is the *first* thing shown while the app has nothing to lay out yet —
 * before it is known whether the visitor is signed in, and therefore before any
 * route-shaped skeleton would be honest. Once that resolves, the route's own
 * skeleton (`(authenticated)/loading.tsx`, `(auth)/loading.tsx`, ...) takes over
 * and shimmers the real layout. Showing a route skeleton first would guess at a
 * layout that may not be the one that loads.
 */
export const BrandLoader: React.FC<BrandLoaderProps> = ({
  label = 'Loading My Hockey Network',
  fullScreen = false,
  className,
}) => (
  <div
    className={`mhn-brand-loader${fullScreen ? ' mhn-brand-loader--full' : ''}${className ? ` ${className}` : ''}`}
    role="status"
    aria-live="polite"
    aria-label={label}
  >
    <div className="mhn-brand-loader-mark">
      {/* Same asset the sidebar uses (`LeftSidebar.tsx`) — `/logo.png` doesn't
          exist in `public/` and rendered as a broken image. */}
      <Image
        src="/dark/logo.webp"
        alt=""
        width={180}
        height={49}
        priority
        className="mhn-brand-loader-logo"
      />
      <div className="mhn-brand-loader-shine" aria-hidden="true" />
    </div>

    <div className="mhn-brand-loader-track" aria-hidden="true">
      <div className="mhn-brand-loader-bar" />
    </div>
  </div>
);
