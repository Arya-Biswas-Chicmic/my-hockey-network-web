'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name when the modal has no visible `<h*>` heading of its own. */
  title?: string;
  /** Applied to the card, not the overlay. */
  className?: string;
  /** Applied to the overlay itself — use for a z-index override on a modal that can open nested inside another (e.g. crop-on-upload inside an edit-profile modal). */
  overlayClassName?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children: ReactNode;
}

/**
 * Shared modal/dialog primitive. Owns overlay rendering, Escape-to-close,
 * click-outside-to-close, initial focus, and dialog ARIA attributes — the
 * behavior every hand-rolled `.mhn-modal-overlay` div previously
 * implemented ad hoc (or skipped). Reuses the existing `.mhn-modal-overlay`
 * / `.mhn-modal-card` classes already defined in `index.css`, so adopting
 * it does not change any modal's visual styling — only standardizes the
 * behavior around it. Existing modal content (header/body/footer markup)
 * plugs in as `children` unchanged. See docs/COMPONENT_CATALOG.md.
 */
export function Modal({
  open,
  onClose,
  title,
  className,
  overlayClassName,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
}: Readonly<ModalProps>) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    cardRef.current?.focus();

    if (!closeOnEscape) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn('mhn-modal-overlay', overlayClassName)}
      onClick={(event) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={cardRef}
        className={cn('mhn-modal-card', className)}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
}
