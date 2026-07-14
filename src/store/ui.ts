import { create } from 'zustand';

interface UIState {
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
  installPromptEvent: BeforeInstallPromptEvent | null;
  setInstallPromptEvent: (e: BeforeInstallPromptEvent | null) => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const useUIStore = create<UIState>((set) => ({
  hasOnboarded: localStorage.getItem('tracenet_onboarded') === '1',
  setHasOnboarded: (v) => {
    localStorage.setItem('tracenet_onboarded', v ? '1' : '0');
    set({ hasOnboarded: v });
  },
  installPromptEvent: null,
  setInstallPromptEvent: (e) => set({ installPromptEvent: e }),
}));
