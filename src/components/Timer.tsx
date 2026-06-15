import { Play, Pause, RotateCcw, SkipForward, Flame, Target } from 'lucide-react';
import { TimerMode, TimerState, Task } from '../types';
import { playClickSound } from '../utils/audio';

interface TimerProps {
  mode: TimerMode;
  timerState: TimerState;
  timeLeft: number; // in seconds
  totalDuration: number; // in seconds
  onStartPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onChangeMode: (newMode: TimerMode) => void;
  activeTask: Task | null;
  soundEnabled: boolean;
}

export default function Timer({
  mode,
  timerState,
  timeLeft,
  totalDuration,
  onStartPause,
  onReset,
  onSkip,
  onChangeMode,
  activeTask,
  soundEnabled,
}: TimerProps) {
  
  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // SVG circular path math
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
  const strokeDashoffset = circumference - progress * circumference;

  const getModeColorClass = () => {
    switch (mode) {
      case 'pomodoro':
        return {
          glowText: 'neon-text-cyan',
          glowBorder: 'neon-border-cyan',
          progressStroke: '#00f3ff',
          mainBgGlow: 'neon-bg-glow-cyan',
          buttonHover: 'hover:text-neon-cyan hover:border-neon-cyan hover:shadow-[0_0_12px_rgba(0,243,255,0.3)]',
          buttonBase: 'border-neon-cyan/20 text-neon-cyan/80 bg-neon-cyan/5',
          accentColor: 'text-neon-cyan',
          activeTab: 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.25)]',
          tabHover: 'hover:border-neon-cyan/50 hover:text-neon-cyan',
        };
      case 'short_break':
        return {
          glowText: 'neon-text-pink',
          glowBorder: 'neon-border-pink',
          progressStroke: '#ff007f',
          mainBgGlow: 'neon-bg-glow-pink',
          buttonHover: 'hover:text-neon-pink hover:border-neon-pink hover:shadow-[0_0_12px_rgba(255,0,127,0.3)]',
          buttonBase: 'border-neon-pink/20 text-neon-pink/80 bg-neon-pink/5',
          accentColor: 'text-neon-pink',
          activeTab: 'border-neon-pink bg-neon-pink/10 text-neon-pink shadow-[0_0_10px_rgba(255,0,127,0.25)]',
          tabHover: 'hover:border-neon-pink/50 hover:text-neon-pink',
        };
      case 'long_break':
        return {
          glowText: 'neon-text-violet',
          glowBorder: 'neon-border-pink', // reuse glowing shades
          progressStroke: '#bc13fe',
          mainBgGlow: 'neon-bg-glow-pink',
          buttonHover: 'hover:text-neon-violet hover:border-neon-violet hover:shadow-[0_0_12px_rgba(188,19,254,0.3)]',
          buttonBase: 'border-neon-violet/20 text-neon-violet/80 bg-neon-violet/5',
          accentColor: 'text-neon-violet',
          activeTab: 'border-neon-violet bg-neon-violet/10 text-neon-violet shadow-[0_0_10px_rgba(188,19,254,0.25)]',
          tabHover: 'hover:border-neon-violet/50 hover:text-neon-violet',
        };
    }
  };

  const scheme = getModeColorClass();

  const handleModeChangeWithPrompt = (newMode: TimerMode) => {
    if (newMode === mode) return;
    if (soundEnabled) playClickSound(0.15);
    
    if (timerState === 'running') {
      const confirmState = window.confirm("Focus matrix is currently active. Aborting sessions defaults current countdown progress. Proceed?");
      if (!confirmState) return;
    }
    onChangeMode(newMode);
  };

  return (
    <div id="pomo-timer-interface" className="bg-cyber-panel border border-cyber-border rounded-xl p-6 flex flex-col items-center justify-between relative overflow-hidden h-full min-h-[460px]">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[90px] pointer-events-none opacity-30 ${
        mode === 'pomodoro' ? 'bg-neon-cyan' : mode === 'short_break' ? 'bg-neon-pink' : 'bg-neon-violet'
      }`} />

      {/* Mode Selector Tabs at Top */}
      <div className="w-full flex justify-between p-1 bg-black/40 border border-cyber-border rounded-lg max-w-sm mb-4">
        {(['pomodoro', 'short_break', 'long_break'] as TimerMode[]).map((m) => {
          const isActive = mode === m;
          let label = 'Pomodoro';
          if (m === 'short_break') label = 'Short Break';
          if (m === 'long_break') label = 'Long Break';

          return (
            <button
              id={`tab-select-${m}`}
              key={m}
              onClick={() => handleModeChangeWithPrompt(m)}
              className={`flex-1 text-[10px] font-mono font-semibold py-1.5 rounded transition-all duration-300 uppercase select-none ${
                isActive 
                  ? scheme.activeTab
                  : `text-gray-500 border border-transparent ${scheme.tabHover}`
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Center Circle Content */}
      <div className="relative flex items-center justify-center my-6">
        
        {/* Secondary Pulsing Shadow for Running Mode */}
        {timerState === 'running' && (
          <div className={`absolute inset-3 rounded-full animate-ping opacity-10 pointer-events-none ${
            mode === 'pomodoro' ? 'bg-neon-cyan' : mode === 'short_break' ? 'bg-neon-pink' : 'bg-neon-violet'
          }`} />
        )}

        {/* The SVG ring dial */}
        <svg className="w-[220px] h-[220px]" viewBox="0 0 200 200">
          {/* Inner dim orbit layout */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className="stroke-cyber-border"
            strokeWidth="5"
            fill="none"
          />
          {/* Main glowing loading progress ring arch */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={scheme.progressStroke}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            style={{
              transition: timerState === 'running' ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.3s ease',
              filter: `drop-shadow(0 0 5px ${scheme.progressStroke})`,
            }}
          />
        </svg>

        {/* Digital content overlay inside the ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          
          {/* Status Label */}
          <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">
            {timerState === 'running' 
              ? mode === 'pomodoro' ? 'Concentrating' : 'Recharging'
              : timerState === 'paused' ? 'Suspended' : 'System Ready'
            }
          </span>
          
          {/* MM:SS Glowing dial */}
          <div id="digital-timer-clock" className={`text-4xl sm:text-5xl font-digital font-bold tracking-widest my-1 ${scheme.glowText}`}>
            {displayTime}
          </div>

          {/* Active target descriptor block */}
          <div className="max-w-[150px] px-1 h-8 flex items-center justify-center">
            {activeTask ? (
              <span className="text-[9px] font-mono text-gray-400 flex items-center gap-1.5 truncate leading-tight uppercase">
                <Target size={10} className={scheme.accentColor} />
                <span className="truncate">{activeTask.title}</span>
              </span>
            ) : mode === 'pomodoro' ? (
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider italic">
                No active task selected
              </span>
            ) : (
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                Standby wave
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Primary physical control triggers row */}
      <div className="flex items-center gap-5 mt-2">
        
        {/* Reset Trigger */}
        <button
          id="timer-reset-btn"
          onClick={() => {
            if (soundEnabled) playClickSound(0.2);
            onReset();
          }}
          className={`p-2.5 rounded-full border transition-all duration-300 ${scheme.buttonBase} ${scheme.buttonHover}`}
          title="Reset sequence"
        >
          <RotateCcw size={16} />
        </button>

        {/* Large Play trigger */}
        <button
          id="timer-play-pause-btn"
          onClick={() => {
            if (soundEnabled) playClickSound(0.2);
            onStartPause();
          }}
          className={`p-4 rounded-full border-2 transition-all duration-300 relative group flex items-center justify-center bg-black ${
            mode === 'pomodoro' 
              ? 'border-neon-cyan hover:shadow-[0_0_15px_rgba(0,243,255,0.5)] text-neon-cyan' 
              : mode === 'short_break' 
                ? 'border-neon-pink hover:shadow-[0_0_15px_rgba(255,0,127,0.5)] text-neon-pink' 
                : 'border-neon-violet hover:shadow-[0_0_15px_rgba(188,19,254,0.5)] text-neon-violet'
          }`}
          title={timerState === 'running' ? 'Pause focus cycles' : 'Initiate focus flow'}
        >
          {timerState === 'running' ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
        </button>

        {/* Skip Trigger */}
        <button
          id="timer-skip-btn"
          onClick={() => {
            if (soundEnabled) playClickSound(0.2);
            onSkip();
          }}
          className={`p-2.5 rounded-full border transition-all duration-300 ${scheme.buttonBase} ${scheme.buttonHover}`}
          title="Skip cycle interval"
        >
          <SkipForward size={16} />
        </button>
      </div>

      {/* Micro Status details footer */}
      {timerState === 'running' && mode === 'pomodoro' && (
        <div className="mt-4 flex items-center gap-1 text-[10px] font-mono text-neon-cyan/80 bg-neon-cyan/5 px-2.5 py-0.5 border border-neon-cyan/20 animate-pulse rounded-full select-none uppercase tracking-widest">
          <Flame size={12} /> Focus energy active
        </div>
      )}
    </div>
  );
}
