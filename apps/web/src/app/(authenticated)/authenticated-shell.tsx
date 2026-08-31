"use client";

import type { ReactNode } from "react";
import { ImpersonationBanner } from "@/components/common/ImpersonationBanner";
import { useImpersonationStore } from "@/stores/impersonation-store";
import { BrandLoader } from "@/components/common/BrandLoader";

import { AppShell } from "@/components/layout/AppShell";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useShellUiStore } from "@/stores/shell-ui-store";

/**
 * Owns the one `<LeftSidebar>`/`<MobileNavigation>` instance for the whole
 * authenticated app (via `AppShell`) instead of each page mounting its own
 * copy inside `.mhn-app-shell`. Every individual route's `page.tsx` used to
 * do `{...useAppNavigation()}` itself and render the shell — navigating
 * between them unmounted and remounted the sidebar every time (Next's
 * `(authenticated)/loading.tsx` Suspense fallback swapped in over the whole
 * previous tree while the next route rendered), which read as the sidebar
 * reloading on every tab click (feedback 2026-08-28: "I don't want mount
 * and remount why we need to do just to show selected tab"). Hoisting the
 * shell up here means only `{children}` — the actual page content — is
 * what gets replaced by the Suspense fallback; the sidebar persists.
 *
 * Split into its own `'use client'` file rather than living directly in
 * `layout.tsx`: a client-component layout can't export route segment config
 * (`export const dynamic`) — Next only reads that from Server Components —
 * so `layout.tsx` stays a plain server component and only this leaf is
 * client-rendered.
 */
export function AuthenticatedShell({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { onNavigate, onLogout } = useAppNavigation();
  const requestCreatePost = useShellUiStore((state) => state.requestCreatePost);
  const isSwitching = useImpersonationStore((state) => state.isSwitching);

  if (isSwitching) {
    return <BrandLoader fullScreen label="Switching session..." />;
  }

  return (
    <div className="flex flex-col h-dvh w-screen overflow-hidden">
      <div className="flex-1 min-h-0 relative">
        <ImpersonationBanner />
        <AppShell
          onTabChange={onNavigate}
          onLogout={onLogout}
          onCreatePostClick={requestCreatePost}
        >
          {children}
        </AppShell>
      </div>
    </div>
  );
}
