import { create } from 'zustand';

/** Whatever the click site already has on hand for the person clicked —
 * a feed post's author, a Who to Follow row, a Connections card. Never a
 * network fetch; `OtherUserProfileModal` fills in richer demo fields (bio,
 * position, jersey, posts, ...) when the id matches a known demo identity,
 * and falls back to just these fields (with everything else showing the
 * profile's normal "—"/empty state) otherwise. */
export interface OtherProfileClickTarget {
  id: string;
  name: string;
  avatar?: string;
  roleTag?: string;
  teamName?: string;
  location?: string;
}

interface ShellUiState {
  isProfileMenuOpen: boolean;
  isFamilyExpanded: boolean;
  isLogoutModalOpen: boolean;
  /** Bumped by the sidebar's "Create Post" button, now hoisted into
   * `(authenticated)/layout.tsx` so it lives above every page instead of
   * being remounted per-route. Whichever page owns a create-post modal
   * (currently `home-page.tsx`, `profile-page.tsx`) watches this counter to
   * open its own local modal/hook — a counter rather than a boolean so a
   * second click while already open still re-fires. */
  createPostRequestId: number;
  /** Non-null while `OtherUserProfileModal` (mounted once in `AppShell`) is
   * open — feedback 2026-08-30: "other user will be in the popup with back
   * button option... don't make separate page". */
  otherProfileTarget: OtherProfileClickTarget | null;
  setProfileMenuOpen: (open: boolean) => void;
  toggleProfileMenu: () => void;
  toggleFamilyExpanded: () => void;
  setLogoutModalOpen: (open: boolean) => void;
  requestCreatePost: () => void;
  openOtherProfile: (target: OtherProfileClickTarget) => void;
  closeOtherProfile: () => void;
}

export const useShellUiStore = create<ShellUiState>((set) => ({
  isProfileMenuOpen: false,
  isFamilyExpanded: true,
  isLogoutModalOpen: false,
  createPostRequestId: 0,
  otherProfileTarget: null,
  setProfileMenuOpen: (isProfileMenuOpen) => set({ isProfileMenuOpen }),
  toggleProfileMenu: () => set((state) => ({ isProfileMenuOpen: !state.isProfileMenuOpen })),
  toggleFamilyExpanded: () => set((state) => ({ isFamilyExpanded: !state.isFamilyExpanded })),
  setLogoutModalOpen: (isLogoutModalOpen) => set({ isLogoutModalOpen }),
  requestCreatePost: () => set((state) => ({ createPostRequestId: state.createPostRequestId + 1 })),
  openOtherProfile: (otherProfileTarget) => set({ otherProfileTarget }),
  closeOtherProfile: () => set({ otherProfileTarget: null }),
}));
