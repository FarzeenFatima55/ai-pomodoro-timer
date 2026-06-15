import { useState, useEffect } from 'react';
import { TimerMode, TimerState, Task, SessionLog, Settings } from './types';
import Timer from './components/Timer';
import Tasks from './components/Tasks';
import Stats from './components/Stats';
import SettingsComponent from './components/Settings';
import { playAlert, playClickSound } from './utils/audio';
import { Activity, Radio, Cpu, Clock as ClockIcon } from 'lucide-react';

const DEFAULT_SETTINGS: Settings = {
  pomodoroDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  dailyGoal: 8,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  soundVolume: 0.5,
  soundType: 'synth_laser',
  tickSoundEnabled: false,
};

export default function App() {
  // --- Persistent State Initialization ---
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('pomo_settings_telemetry');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('pomo_tasks_blueprint');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [logs, setLogs] = useState<SessionLog[]>(() => {
    try {
      const saved = localStorage.getItem('pomo_logs_registry');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('pomo_active_streak');
      return saved ? parseInt(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('pomo_active_task_id');
    } catch {
      return null;
    }
  });

  // --- Clock State / System UI ---
  const [systemTime, setSystemTime] = useState(new Date());

  // --- Core Timer Engine States ---
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroDuration * 60);
  const [totalDuration, setTotalDuration] = useState(settings.pomodoroDuration * 60);

  // --- Synchronize LocalStorage on updates ---
  useEffect(() => {
    localStorage.setItem('pomo_settings_telemetry', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pomo_tasks_blueprint', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('pomo_logs_registry', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('pomo_active_streak', streakCount.toString());
  }, [streakCount]);

  useEffect(() => {
    if (activeTaskId) {
      localStorage.setItem('pomo_active_task_id', activeTaskId);
    } else {
      localStorage.removeItem('pomo_active_task_id');
    }
  }, [activeTaskId]);

  // System time clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Validate focus streaks on load ---
  useEffect(() => {
    if (logs.length === 0) return;
    const pomodoros = logs.filter(l => l.mode === 'pomodoro');
    if (pomodoros.length === 0) {
      setStreakCount(0);
      return;
    }

    const sorted = [...pomodoros].sort((a, b) => b.completedAt - a.completedAt);
    const lastTime = sorted[0].completedAt;
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const lastDateStr = new Date(lastTime).toISOString().split('T')[0];

    if (lastDateStr === todayStr) {
      // Streak maintained today
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDateStr === yesterdayStr) {
      // Streak maintained yesterday
      return;
    }

    // Slip occurred, reset active streak count
    setStreakCount(0);
  }, [logs]);

  // --- Adjust timer on mode/settings change ---
  useEffect(() => {
    if (timerState === 'idle') {
      let mins = settings.pomodoroDuration;
      if (mode === 'short_break') mins = settings.shortBreakDuration;
      if (mode === 'long_break') mins = settings.longBreakDuration;
      
      setTimeLeft(mins * 60);
      setTotalDuration(mins * 60);
    }
  }, [mode, settings.pomodoroDuration, settings.shortBreakDuration, settings.longBreakDuration, timerState]);

  // --- Main Tick Countdown Trigger ---
  useEffect(() => {
    let intervalId: any = null;
    if (timerState === 'running') {
      intervalId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timerState]);

  // --- Observe Completed Clock Event ---
  useEffect(() => {
    if (timeLeft === 0 && timerState === 'running') {
      handleTimerComplete();
    }
  }, [timeLeft, timerState]);

  // --- Timer Actions ---
  const handleStartPause = () => {
    if (timerState === 'running') {
      setTimerState('paused');
    } else {
      setTimerState('running');
    }
  };

  const handleReset = () => {
    setTimerState('idle');
    let mins = settings.pomodoroDuration;
    if (mode === 'short_break') mins = settings.shortBreakDuration;
    if (mode === 'long_break') mins = settings.longBreakDuration;
    setTimeLeft(mins * 60);
    setTotalDuration(mins * 60);
  };

  const handleSkip = () => {
    transitionToNextMode();
  };

  const handleTimerComplete = () => {
    setTimerState('idle');
    
    // Play the alert
    if (settings.soundEnabled) {
      playAlert(settings.soundType, settings.soundVolume);
    }

    const completedAtTimestamp = Date.now();
    const durationMinutesVal = Math.round(totalDuration / 60);

    let relatedTaskTitle: string | null = null;
    let relatedTaskCategory = 'development';

    if (mode === 'pomodoro') {
      // Update Task completed sessions
      if (activeTaskId) {
        setTasks(prev =>
          prev.map(t => {
            if (t.id === activeTaskId) {
              relatedTaskTitle = t.title;
              relatedTaskCategory = t.category;
              return {
                ...t,
                pomodorosCompleted: t.pomodorosCompleted + 1,
              };
            }
            return t;
          })
        );
      }

      // Log Session Focus completed
      const newLog: SessionLog = {
        id: 'log_' + Math.random().toString(36).substring(2, 11),
        mode: 'pomodoro',
        durationMinutes: durationMinutesVal,
        completedAt: completedAtTimestamp,
        taskTitle: relatedTaskTitle,
        taskCategory: relatedTaskCategory,
      };

      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);

      // Focus Streak Counter update logic
      setStreakCount(prevStreak => {
        const pomodoros = updatedLogs.filter(l => l.mode === 'pomodoro');
        if (pomodoros.length <= 1) return 1;

        // Sort descending
        const sorted = [...pomodoros].sort((a, b) => b.completedAt - a.completedAt);
        const latestTime = sorted[0].completedAt;
        const secondLatestTime = sorted[1]?.completedAt;

        if (!secondLatestTime) return 1;

        const now = new Date(latestTime);
        const secondLastDate = new Date(secondLatestTime);

        const lastDateStr = now.toISOString().split('T')[0];
        const prevDateStr = secondLastDate.toISOString().split('T')[0];

        if (lastDateStr === prevDateStr) {
          // Double session completed the same day, preserve streak
          return prevStreak || 1;
        }

        const yesterday = new Date(latestTime);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (prevDateStr === yesterdayStr) {
          // Increment because preceding session was logged yesterday
          return (prevStreak || 0) + 1;
        }

        // Days slipped, start fresh
        return 1;
      });

    } else {
      // Log Break completed
      const newLog: SessionLog = {
        id: 'log_' + Math.random().toString(36).substring(2, 11),
        mode,
        durationMinutes: durationMinutesVal,
        completedAt: completedAtTimestamp,
        taskTitle: null,
        taskCategory: 'none',
      };
      setLogs([newLog, ...logs]);
    }

    // Trigger immediate loop transition
    transitionToNextMode();
  };

  const transitionToNextMode = () => {
    let nextMode: TimerMode = 'pomodoro';
    let nextTimerRunningState: TimerState = 'idle';

    if (mode === 'pomodoro') {
      // Determine if short break or long break (e.g. every 4th completed Pomodoro session today gets a long break)
      const todayStr = new Date().toISOString().split('T')[0];
      const todayPomodoroCount = logs.filter(l => {
        const logDate = new Date(l.completedAt).toISOString().split('T')[0];
        return l.mode === 'pomodoro' && logDate === todayStr;
      }).length + 1; // plus 1 for the one we just completed right now!

      if (todayPomodoroCount > 0 && todayPomodoroCount % 4 === 0) {
        nextMode = 'long_break';
      } else {
        nextMode = 'short_break';
      }

      if (settings.autoStartBreaks) {
        nextTimerRunningState = 'running';
      }
    } else {
      nextMode = 'pomodoro';
      if (settings.autoStartPomodoros) {
        nextTimerRunningState = 'running';
      }
    }

    // Switch state params
    setMode(nextMode);
    setTimerState(nextTimerRunningState);

    let nextMins = settings.pomodoroDuration;
    if (nextMode === 'short_break') nextMins = settings.shortBreakDuration;
    if (nextMode === 'long_break') nextMins = settings.longBreakDuration;

    setTimeLeft(nextMins * 60);
    setTotalDuration(nextMins * 60);
  };

  // --- Task Operations ---
  const handleAddTask = (title: string, category: string, expectedCount: number) => {
    const newTask: Task = {
      id: 'task_' + Math.random().toString(36).substring(2, 11),
      title,
      completed: false,
      pomodorosExpected: expectedCount,
      pomodorosCompleted: 0,
      category,
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    if (!activeTaskId) {
      setActiveTaskId(newTask.id);
    }
  };

  const handleToggleCompleteTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
    setStreakCount(0);
  };

  // Extract selected active task details
  const activeTask = tasks.find(t => t.id === activeTaskId) || null;

  return (
    <div id="cyber-root" className="min-h-screen bg-cyber-bg relative pb-12 text-slate-100 select-none">
      
      {/* Visual background overlays */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-neon-pink/5 via-violet-950/2 to-transparent pointer-events-none" />
      <div className="scanlines" />

      {/* Cyberpunk Top Header Nav */}
      <header className="border-b border-cyber-border bg-black/60 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center p-2 bg-neon-pink/10 border border-neon-pink/30 rounded-lg shadow-[0_0_8px_rgba(255,0,127,0.15)]">
              <Cpu size={16} className="text-neon-pink filter drop-shadow-[0_0_2px_#ff007f] animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-display font-black tracking-widest text-white uppercase flex items-center gap-1.5">
                NEON POMODORO
                <span className="text-[10px] text-neon-cyan font-mono tracking-normal animate-pulse px-1.5 py-[1px] bg-neon-cyan/10 border border-neon-cyan/20 rounded-md">
                  V1.4.2
                </span>
              </h1>
              <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">CYBERNETIC CHRONO STATION</p>
            </div>
          </div>

          {/* Diagnostics digital clocks row */}
          <div className="flex items-center gap-5 font-mono text-xs text-gray-400">
            <div className="hidden md:flex items-center gap-2 border bg-cyber-panel/50 border-cyber-border px-3 py-1 rounded">
              <Radio size={12} className="text-neon-cyan animate-pulse" />
              <span className="text-[10px] tracking-widest uppercase text-neon-cyan font-semibold">FEED: STABLE</span>
            </div>
            
            <div className="flex items-center gap-2 border bg-cyber-panel/50 border-cyber-border px-3 py-1 rounded shadow-inner">
              <ClockIcon size={12} className="text-neon-pink" />
              <span className="text-white font-digital font-semibold tracking-wider">
                {systemTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Deck */}
      <main className="max-w-7xl mx-auto px-4 mt-6 space-y-6 relative z-10">
        
        {/* Responsive Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column blocks: Timer Interface & settings (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Timer module (7 cols) */}
              <div className="md:col-span-7">
                <Timer
                  mode={mode}
                  timerState={timerState}
                  timeLeft={timeLeft}
                  totalDuration={totalDuration}
                  onStartPause={handleStartPause}
                  onReset={handleReset}
                  onSkip={handleSkip}
                  onChangeMode={setMode}
                  activeTask={activeTask}
                  soundEnabled={settings.soundEnabled}
                />
              </div>

              {/* Tasks module (5 cols on md screen size) */}
              <div className="md:col-span-5 h-full">
                <Tasks
                  tasks={tasks}
                  activeTaskId={activeTaskId}
                  onSetActiveTask={setActiveTaskId}
                  onAddTask={handleAddTask}
                  onToggleCompleteTask={handleToggleCompleteTask}
                  onDeleteTask={handleDeleteTask}
                  soundEnabled={settings.soundEnabled}
                />
              </div>

            </div>

            {/* Custom Settings Config */}
            <SettingsComponent
              settings={settings}
              onUpdateSettings={setSettings}
              activeMode={mode}
            />

          </div>

          {/* Right Column / Stats Full Spacing on lower block (4 cols side scope) */}
          <div className="lg:col-span-4 flex flex-col bg-cyber-panel border border-cyber-border rounded-xl p-5 relative overflow-hidden justify-between h-full min-h-[300px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/5 blur-3xl pointer-events-none rounded-full" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-cyber-border">
                <div>
                  <h3 className="text-sm font-mono tracking-widest text-slate-400 uppercase">SYSTEM VITALS</h3>
                  <p className="text-[10px] text-neon-cyan font-mono mt-0.5">TRANSCEIVER FREQUENCY TELEMETRY</p>
                </div>
                <Activity size={16} className="text-neon-cyan animate-pulse" />
              </div>

              <div className="space-y-3 font-mono text-xs text-gray-400">
                <div className="flex justify-between items-center bg-black/40 border border-cyber-border/40 p-2.5 rounded-lg">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Telemetry Core</span>
                  <span className="text-white text-[11px] font-semibold">Active Sync Loop</span>
                </div>
                
                <div className="flex justify-between items-center bg-black/40 border border-cyber-border/40 p-2.5 rounded-lg">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Audio Output Pin</span>
                  <span className="text-neon-pink text-[11px] font-semibold uppercase">
                    {settings.soundEnabled ? `Oscillator (${settings.soundType.replace('_', ' ')})` : 'Muted'}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-black/40 border border-cyber-border/40 p-2.5 rounded-lg">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Today's Focus Lock</span>
                  <span className="text-neon-green text-[11px] font-bold">
                    {activeTask ? `Active: ${activeTask.title}` : 'None Selected'}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-black/40 border border-cyber-border/40 p-2.5 rounded-lg">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Storage Node</span>
                  <span className="text-white text-[11px] font-semibold">Local Sandbox Registry</span>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-cyber-border/40 mt-5 flex flex-col gap-2">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest text-center">CHRONOMETRY DIAGNOSTICS</span>
              <div className="flex justify-center gap-1">
                <span className="w-2.5 h-1.5 rounded-sm bg-neon-cyan animate-pulse"></span>
                <span className="w-2.5 h-1.5 rounded-sm bg-neon-pink"></span>
                <span className="w-2.5 h-1.5 rounded-sm bg-neon-yellow animate-bounce"></span>
                <span className="w-2.5 h-1.5 rounded-sm bg-neon-green"></span>
              </div>
            </div>

          </div>

        </div>

        {/* Aggregate statistics view row metrics spanning full width at bottom */}
        <section id="aggregate-metrics-dashboard" className="pt-4">
          <Stats
            logs={logs}
            dailyGoal={settings.dailyGoal}
            streakCount={streakCount}
            onClearLogs={handleClearLogs}
            soundEnabled={settings.soundEnabled}
          />
        </section>

      </main>

      {/* Cyber Footer */}
      <footer className="mt-12 text-center text-[10px] font-mono text-gray-600 uppercase tracking-widest relative z-10 select-none">
        <div>ORBIT ENGINE PROCESSORS ACCREDITED • DEPLOYED IN CLOUD TRANSCEIVER</div>
        <div className="text-neon-cyan/20 selection:bg-transparent mt-1.5">[ SYSTEM READY ]</div>
      </footer>
    </div>
  );
}
