import { create } from 'zustand';

interface TimerState {
  activeProjectId: string | null;
  timerType: 'building' | 'debugging' | null;
  startTime: Date | null;
  elapsedSeconds: number;
  currentTimeLogId: string | null;
  setActiveTimer: (projectId: string, type: 'building' | 'debugging', timeLogId: string) => void;
  stopTimer: () => void;
  incrementSeconds: () => void;
  resetTimer: () => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  activeProjectId: null,
  timerType: null,
  startTime: null,
  elapsedSeconds: 0,
  currentTimeLogId: null,

  setActiveTimer: (projectId, type, timeLogId) => set({
    activeProjectId: projectId,
    timerType: type,
    startTime: new Date(),
    elapsedSeconds: 0,
    currentTimeLogId: timeLogId,
  }),

  stopTimer: () => set({
    activeProjectId: null,
    timerType: null,
    startTime: null,
    elapsedSeconds: 0,
    currentTimeLogId: null,
  }),

  incrementSeconds: () => set((state) => {
    // Calculate from actual time difference instead of incrementing
    // This prevents drift from setInterval inaccuracy
    if (state.startTime) {
      const now = new Date();
      const actualElapsed = Math.floor((now.getTime() - state.startTime.getTime()) / 1000);
      return { elapsedSeconds: actualElapsed };
    }
    return { elapsedSeconds: state.elapsedSeconds + 1 };
  }),

  resetTimer: () => set({
    elapsedSeconds: 0,
    startTime: new Date(),
  }),
}));
