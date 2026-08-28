import { create } from 'zustand';

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
  setProfileMenuOpen: (open: boolean) => void;
  toggleProfileMenu: () => void;
  toggleFamilyExpanded: () => void;
  setLogoutModalOpen: (open: boolean) => void;
  requestCreatePost: () => void;
}

export const useShellUiStore = create<ShellUiState>((set) => ({
  isProfileMenuOpen: false,
  isFamilyExpanded: true,
  isLogoutModalOpen: false,
  createPostRequestId: 0,
  setProfileMenuOpen: (isProfileMenuOpen) => set({ isProfileMenuOpen }),
  toggleProfileMenu: () => set((state) => ({ isProfileMenuOpen: !state.isProfileMenuOpen })),
  toggleFamilyExpanded: () => set((state) => ({ isFamilyExpanded: !state.isFamilyExpanded })),
  setLogoutModalOpen: (isLogoutModalOpen) => set({ isLogoutModalOpen }),
  requestCreatePost: () => set((state) => ({ createPostRequestId: state.createPostRequestId + 1 })),
}));
