'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button';

export interface CompactPageHeaderProps {
  title: string;
  /** Extra controls rendered at the right edge (e.g. Supervision's "Add player" button). */
  actions?: React.ReactNode;
  /** Overrides the default `router.back()` navigation. */
  onBack?: () => void;
}

/**
 * Back-arrow + title bar for the "drilled in from the profile dropdown"
 * pages (Settings, Supervision, Help & Support) that render without the
 * persistent app sidebar — see `.mhn-app-shell--compact` in `index.css`
 * and `AppShell.tsx`'s `COMPACT_SHELL_ROUTES`. Matches Figma node
 * 2176:19341's own back-arrow-then-title row exactly (a 24px icon button,
 * a 20px semibold title), reused here rather than re-implemented per page.
 */
export function CompactPageHeader({ title, actions, onBack }: Readonly<CompactPageHeaderProps>) {
  const router = useRouter();

  return (
    <div className="mhn-compact-page-header">
      <div className="mhn-compact-page-header-left">
        <Button
          type="button"
          variant="unstyled"
          className="mhn-compact-page-back-btn"
          aria-label="Go back"
          onClick={onBack ?? (() => router.back())}
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </Button>
        <h1 className="mhn-compact-page-title">{title}</h1>
      </div>
      {actions && <div className="mhn-compact-page-header-actions">{actions}</div>}
    </div>
  );
}
