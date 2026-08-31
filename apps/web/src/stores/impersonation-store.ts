import { create } from 'zustand';
import { globalQueryClient } from '@/query';

interface ImpersonationState {
  impersonatingProfileId: string | null;
  impersonatingName: string | null;
  isSwitching: boolean;
  startImpersonation: (profileId: string, name: string) => void;
  stopImpersonation: () => void;
}

export const useImpersonationStore = create<ImpersonationState>((set) => {
  // Read initial state from sessionStorage if in browser
  const initialProfileId = typeof window !== 'undefined' ? window.sessionStorage.getItem('mhn_acting_for') : null;
  const initialName = typeof window !== 'undefined' ? window.sessionStorage.getItem('mhn_acting_for_name') : null;

  return {
    impersonatingProfileId: initialProfileId,
    impersonatingName: initialName,
    isSwitching: false,
    startImpersonation: (profileId, name) => {
      set({ isSwitching: true });
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('mhn_acting_for', profileId);
        window.sessionStorage.setItem('mhn_acting_for_name', name);
        window.location.href = '/';
      }
      set({ impersonatingProfileId: profileId, impersonatingName: name });
    },
    stopImpersonation: () => {
      set({ isSwitching: true });
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('mhn_acting_for');
        window.sessionStorage.removeItem('mhn_acting_for_name');
        window.location.href = '/';
      }
      set({ impersonatingProfileId: null, impersonatingName: null });
    },
  };
});
