import { create } from 'zustand';

interface ShellUiState {
  isProfileMenuOpen: boolean;
  isFamilyExpanded: boolean;
  isLogoutModalOpen: boolean;
  setProfileMenuOpen: (open: boolean) => void;
  toggleProfileMenu: () => void;
  toggleFamilyExpanded: () => void;
  setLogoutModalOpen: (open: boolean) => void;
}

export const useShellUiStore = create<ShellUiState>((set) => ({
  isProfileMenuOpen: false,
  isFamilyExpanded: true,
  isLogoutModalOpen: false,
  setProfileMenuOpen: (isProfileMenuOpen) => set({ isProfileMenuOpen }),
  toggleProfileMenu: () => set((state) => ({ isProfileMenuOpen: !state.isProfileMenuOpen })),
  toggleFamilyExpanded: () => set((state) => ({ isFamilyExpanded: !state.isFamilyExpanded })),
  setLogoutModalOpen: (isLogoutModalOpen) => set({ isLogoutModalOpen }),
}));
