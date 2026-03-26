import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isSettingsOpen: false,
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),

  musicVolume: 0.5,
  setMusicVolume: (volume) => set({ musicVolume: volume }),
  
  isMusicPlaying: false,
  toggleMusic: () => set((state) => ({ isMusicPlaying: !state.isMusicPlaying })),

  incomingCall: null, // { callerName, fromUserId, offer, signalType }
  activeCall: null,   // { remoteUserId, offer, isReceiver, signalType }
  setIncomingCall: (call) => set({ incomingCall: call }),
  setActiveCall: (call) => set({ activeCall: call }),
  clearCall: () => set({ incomingCall: null, activeCall: null }),

  activeGame: null, // { roomId, gameId, opponentId, role, messageId }
  setActiveGame: (game) => set({ activeGame: game }),
  clearGame: () => set({ activeGame: null }),
}));
