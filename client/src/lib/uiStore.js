import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isSettingsOpen: false,
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),

  musicVolume: 0.5,
  setMusicVolume: (volume) => set({ musicVolume: volume }),
  
  isMusicPlaying: false,
  toggleMusic: () => set((state) => ({ isMusicPlaying: !state.isMusicPlaying })),
}));
