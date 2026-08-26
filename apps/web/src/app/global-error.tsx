'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

import '@/index.css';
import { Button } from '@/components/common/Button';

/**
 * Root-level error boundary. Next.js only invokes this when an error escapes
 * the root layout itself (route-level failures are caught by `error.tsx`).
 * It must render its own <html>/<body> because it replaces the root layout,
 * so it imports global styles directly rather than relying on RootLayout.
 */
export default function GlobalError({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('mhn:application-error', { detail: { digest: error.digest } }));
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-background p-6">
          <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <AlertTriangle className="mx-auto size-10 text-destructive" aria-hidden="true" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The application failed to load. Please retry. Reference: {error.digest ?? 'unavailable'}
            </p>
            <Button className="mt-6" variant="primary" onClick={reset}>Try again</Button>
          </section>
        </main>
      </body>
    </html>
  );
}
