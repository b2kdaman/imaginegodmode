import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PowerToolsState {
  autoRetryEnabled: boolean;
  maxRetries: number;
  cooldownSeconds: number;
  retryCount: number;
  retryStatus: string;
  cooldownRemaining: number;

  videoGoalTarget: number;
  videoGoalCurrent: number;
  videoGoalRunning: boolean;
  videoGoalStatus: string;

  setAutoRetryEnabled: (v: boolean) => void;
  setMaxRetries: (v: number) => void;
  setCooldownSeconds: (v: number) => void;
  setRetryCount: (v: number) => void;
  setRetryStatus: (s: string) => void;
  setCooldownRemaining: (v: number) => void;
  setVideoGoalTarget: (v: number) => void;
  setVideoGoalCurrent: (v: number) => void;
  setVideoGoalRunning: (v: boolean) => void;
  setVideoGoalStatus: (s: string) => void;
}

export const usePowerToolsStore = create<PowerToolsState>()(
  persist(
    (set) => ({
      autoRetryEnabled: false,
      maxRetries: 999,
      cooldownSeconds: 8,
      retryCount: 0,
      retryStatus: 'Idle',
      cooldownRemaining: 0,

      videoGoalTarget: 10,
      videoGoalCurrent: 0,
      videoGoalRunning: false,
      videoGoalStatus: 'Idle',

      setAutoRetryEnabled: (v) => set({ autoRetryEnabled: v }),
      setMaxRetries: (v) => set({ maxRetries: v }),
      setCooldownSeconds: (v) => set({ cooldownSeconds: v }),
      setRetryCount: (v) => set({ retryCount: v }),
      setRetryStatus: (s) => set({ retryStatus: s }),
      setCooldownRemaining: (v) => set({ cooldownRemaining: v }),
      setVideoGoalTarget: (v) => set({ videoGoalTarget: v }),
      setVideoGoalCurrent: (v) => set({ videoGoalCurrent: v }),
      setVideoGoalRunning: (v) => set({ videoGoalRunning: v }),
      setVideoGoalStatus: (s) => set({ videoGoalStatus: s }),
    }),
    {
      name: 'imaginegodmode-powertools',
      partialize: (s) => ({
        autoRetryEnabled: s.autoRetryEnabled,
        maxRetries: s.maxRetries,
        cooldownSeconds: s.cooldownSeconds,
        videoGoalTarget: s.videoGoalTarget,
      }),
    }
  )
);
