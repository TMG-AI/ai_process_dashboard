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

  incrementSeconds: () => set((state) => ({
    elapsedSeconds: state.elapsedSeconds + 1,
  })),

  resetTimer: () => set({
    elapsedSeconds: 0,
    startTime: new Date(),
  }),
}));
