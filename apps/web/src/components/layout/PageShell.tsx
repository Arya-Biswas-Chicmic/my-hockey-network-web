'use client';

import { useLayoutEffect } from 'react';
import { cn } from '@/utils/cn';

/**
 * The one place every authenticated route configures its own content width.
 * Renders the `<main>` that sits in `.mhn-app-shell`'s content grid track
 * (see that class in `index.css`) and, via `--page-max-width`, controls how
 * wide that track actually is — feedback 2026-08-30: "make sure... located
 * at one place and all are using that for the view... single point to
 * change [the] view[port]".
 *
 * Every route should render this (instead of its own hand-rolled
 * `<main className="... max-w-[Npx] ...">`) wrapping its page content.
 * Layout mechanics (the 48px nav gutter, equal outer margins, the 50/24/24/24
 * padding, the mobile collapse) all live in `.mhn-app-shell` / `.mhn-page-
 * container` in `index.css` — this component's only job is registering
 * `maxWidth` and rendering the padded container. Pages that need their own
 * internal layout (a 2-column grid, a flex column, ...) pass it via
 * `className`; pages that don't set `maxWidth` get Home's own 932px.
 */
export interface PageShellProps {
  /** Content width in px. Defaults to Home's own 932px — pass this only when
   * a route genuinely needs something else (e.g. a 2-pane chat layout). */
  maxWidth?: number;
  className?: string;
  children: React.ReactNode;
}

const DEFAULT_MAX_WIDTH = 932;

export function PageShell({ maxWidth = DEFAULT_MAX_WIDTH, className, children }: Readonly<PageShellProps>) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.style.getPropertyValue('--page-max-width');
    root.style.setProperty('--page-max-width', `${maxWidth}px`);
    return () => {
      // Restore whatever was set before this instance mounted (usually
      // nothing) rather than leaving the value cleared — avoids a one-frame
      // flash of the CSS default if another `PageShell` further up the tree
      // is still mounted (shouldn't normally happen, but cheap to guard).
      if (previous) {
        root.style.setProperty('--page-max-width', previous);
      } else {
        root.style.removeProperty('--page-max-width');
      }
    };
  }, [maxWidth]);

  return (
    <main className={cn('mhn-page-container', className)}>
      {children}
    </main>
  );
}
