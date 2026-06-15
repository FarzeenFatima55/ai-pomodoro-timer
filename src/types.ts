export type TimerMode = 'pomodoro' | 'short_break' | 'long_break';

export type TimerState = 'idle' | 'running' | 'paused';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  pomodorosExpected: number;
  pomodorosCompleted: number;
  category: string;
  createdAt: number;
}

export interface SessionLog {
  id: string;
  mode: TimerMode;
  durationMinutes: number;
  completedAt: number; // timestamp
  taskTitle: string | null; // which task it was for
  taskCategory: string; // design, development, default, etc.
}

export interface Settings {
  pomodoroDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  dailyGoal: number; // expected pomodoros per day
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  soundType: 'synth_laser' | 'digital_beep' | 'zen_ring' | 'cyber_alarm';
  tickSoundEnabled: boolean;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  focusMinutes: number;
  completedCount: number;
}
