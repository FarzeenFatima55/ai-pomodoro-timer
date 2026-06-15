import { SessionLog, Task } from '../types';
import { CATEGORIES } from './Tasks';
import { Flame, Clock, Trophy, Calendar, RefreshCcw, Trash2, ListFilter, Activity } from 'lucide-react';
import { playClickSound } from '../utils/audio';
import { useState } from 'react';

interface StatsProps {
  logs: SessionLog[];
  dailyGoal: number;
  streakCount: number;
  onClearLogs: () => void;
  soundEnabled: boolean;
}

export default function Stats({
  logs,
  dailyGoal,
  streakCount,
  onClearLogs,
  soundEnabled,
}: StatsProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'pomodoro' | 'break'>('all');

  // Compute total aggregates
  const totalCompletedSessions = logs.filter(l => l.mode === 'pomodoro').length;
  const totalFocusMinutes = logs
    .filter(l => l.mode === 'pomodoro')
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  // Compute category breakdown
  const categoryStats: Record<string, number> = {
    development: 0,
    design: 0,
    writing: 0,
    learning: 0,
    admin: 0,
  };

  logs.forEach(log => {
    if (log.mode === 'pomodoro') {
      const cat = log.taskCategory || 'development';
      categoryStats[cat] = (categoryStats[cat] || 0) + log.durationMinutes;
    }
  });

  const maxMinutesVal = Math.max(...Object.values(categoryStats), 10); // clamp min 10 for visual scale

  // Compute daily progress
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessionsCount = logs.filter(l => {
    const isPomo = l.mode === 'pomodoro';
    const logDate = new Date(l.completedAt).toISOString().split('T')[0];
    return isPomo && logDate === todayStr;
  }).length;

  const todayProgressPercent = Math.min(100, Math.round((todaySessionsCount / dailyGoal) * 100));

  const filteredLogs = logs.filter(l => {
    if (filterMode === 'pomodoro') return l.mode === 'pomodoro';
    if (filterMode === 'break') return l.mode === 'short_break' || l.mode === 'long_break';
    return true;
  });

  const handleClear = () => {
    if (soundEnabled) playClickSound(0.25);
    if (window.confirm("Are you sure you want to scrub all mainframe session registry histories? This defaults statistics to zero.")) {
      onClearLogs();
    }
  };

  return (
    <div id="stats-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Overview Cards Panel (1st Column) */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-mono tracking-widest text-slate-500 uppercase">SYSTEM DIAGNOSTICS</h3>

        {/* Focus Odometer Card */}
        <div className="bg-cyber-panel border border-cyber-border rounded-xl p-5 relative overflow-hidden flex items-center gap-4">
          <div className="absolute top-0 right-0 w-20 h-20 bg-neon-cyan/5 blur-2xl pointer-events-none rounded-full" />
          <div className="p-3.5 bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 rounded-lg shadow-[0_0_8px_rgba(0,243,255,0.1)]">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Focus Output</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-digital font-bold text-neon-cyan tracking-wider truncate">
                {totalFocusMinutes}
              </span>
              <span className="text-xs font-mono text-gray-400">MINS</span>
            </div>
          </div>
        </div>

        {/* Sessions Completed Card */}
        <div className="bg-cyber-panel border border-cyber-border rounded-xl p-5 relative overflow-hidden flex items-center gap-4">
          <div className="absolute top-0 right-0 w-20 h-20 bg-neon-violet/5 blur-2xl pointer-events-none rounded-full" />
          <div className="p-3.5 bg-neon-violet/10 text-neon-violet border border-neon-violet/20 rounded-lg shadow-[0_0_8px_rgba(188,19,254,0.1)]">
            <Trophy size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Mainframes Completed</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-digital font-bold text-neon-violet tracking-wider">
                {totalCompletedSessions}
              </span>
              <span className="text-xs font-mono text-gray-400">LOOPS</span>
            </div>
          </div>
        </div>

        {/* Focus Streak Card */}
        <div className="bg-cyber-panel border border-cyber-border rounded-xl p-5 relative overflow-hidden flex items-center gap-4">
          <div className="absolute top-0 right-0 w-20 h-20 bg-neon-pink/5 blur-2xl pointer-events-none rounded-full" />
          <div className="p-3.5 bg-neon-pink/10 text-neon-pink border border-neon-pink/20 rounded-lg shadow-[0_0_8px_rgba(255,0,127,0.1)]">
            <Flame size={20} className="animate-pulse text-neon-pink filter drop-shadow-[0_0_4px_#ff007f]" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Active Burn Streak</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-digital font-bold text-neon-pink tracking-wider">
                {streakCount}
              </span>
              <span className="text-xs font-mono text-gray-400">DAYS 🔥</span>
            </div>
          </div>
        </div>

        {/* Daily Goal Gauge */}
        <div className="bg-cyber-panel border border-cyber-border rounded-xl p-5 relative overflow-hidden flex flex-col justify-center">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-3">Today's Focus Budget</span>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-neon-cyan transition-all duration-1000 ease-out"
                  strokeDasharray={`${todayProgressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  style={{ filter: 'drop-shadow(0 0 4px #00f3ff)' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-digital text-sm font-bold text-white">
                {todayProgressPercent}%
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-lg font-mono font-bold leading-none text-white">
                {todaySessionsCount} <span className="text-gray-500 font-normal text-xs">/ {dailyGoal} Completed</span>
              </div>
              <p className="text-[10px] text-neon-cyan font-mono tracking-wider mt-1 uppercase">
                {todaySessionsCount >= dailyGoal ? '⚡ TARGET REACHED' : '🕒 DEPLOYING FREQUENCIES'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Allocations & Weekly Output (2nd Column) */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-mono tracking-widest text-slate-500 uppercase">WEEKLY PRODUCTION</h3>
        
        {/* Weekly Output Chart Block */}
        <div className="bg-cyber-panel border border-cyber-border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between h-[230px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/5 blur-3xl pointer-events-none rounded-full" />
          
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white/70">Workload Output</h3>
            <span className="text-[10px] font-mono text-neon-cyan select-none">
              {(logs.filter(l => l.mode === 'pomodoro').length > 0) ? '+12% vs base cycle' : 'STANDBY IDLE'}
            </span>
          </div>

          {/* Vertical Bars layout */}
          <div className="flex-1 flex items-end justify-between gap-3 px-1">
            {(() => {
              const weekdayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
              
              // Assemble last 7 days starting from 6 days ago up to today
              const last7Days = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dayStr = d.toISOString().split('T')[0];
                const label = weekdayNames[d.getDay()];
                return { dateStr: dayStr, label };
              });

              // Extract actual duration minutes per day
              const dailyMinsMap: Record<string, number> = {};
              logs.forEach(l => {
                if (l.mode === 'pomodoro') {
                  const logDateStr = new Date(l.completedAt).toISOString().split('T')[0];
                  dailyMinsMap[logDateStr] = (dailyMinsMap[logDateStr] || 0) + l.durationMinutes;
                }
              });

              // Max value for relative scale (min 25 for visual grid)
              const maxVal = Math.max(...last7Days.map(d => dailyMinsMap[d.dateStr] || 0), 25);

              return last7Days.map((day, idx) => {
                const mins = dailyMinsMap[day.dateStr] || 0;
                // Minimum peak 5% for visual indicator representation
                const heightPercent = Math.max(5, Math.round((mins / maxVal) * 100));
                const isToday = day.dateStr === new Date().toISOString().split('T')[0];

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/90 text-white border border-cyber-border text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                      {mins} mins
                    </div>

                    <div className="w-full bg-[#1a1c23] h-full rounded-t-sm relative overflow-hidden">
                      <div
                        className={`absolute bottom-0 w-full transition-all duration-1000 ease-out rounded-t-sm ${
                          isToday 
                            ? 'bg-neon-cyan/40 border-t-2 border-neon-cyan shadow-[0_0_10px_#00f3ff]'
                            : 'bg-neon-cyan/20 border-t border-neon-cyan/50 hover:bg-neon-cyan/30'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    
                    <span className={`text-[9px] font-mono mt-2 select-none ${isToday ? 'text-neon-cyan font-bold' : 'opacity-40'}`}>
                      {day.label}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Categories Allocations Info Section */}
        <div className="bg-cyber-panel border border-cyber-border rounded-xl p-4 flex flex-col flex-1 justify-center space-y-3.5">
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">ALLOCATIONS TELEMETRY</h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              {CATEGORIES.map(cat => {
                const countMinutes = categoryStats[cat.id] || 0;
                return (
                  <div key={cat.id} className="flex items-center justify-between p-1 px-2 border border-cyber-border/40 bg-black/20 rounded">
                    <span className="text-gray-500 truncate">{cat.icon} {cat.label}</span>
                    <span className="text-white font-semibold">{countMinutes}m</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mainframe session history log table (3rd Column) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono tracking-widest text-slate-500 uppercase">SESSION REGISTRY</h3>
          {logs.length > 0 && (
            <button
              id="clear-logs-btn"
              onClick={handleClear}
              className="flex items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-neon-pink transition-colors uppercase select-none"
            >
              <Trash2 size={11} /> Clear Log
            </button>
          )}
        </div>

        <div className="flex-1 bg-cyber-panel border border-cyber-border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between max-h-[360px] lg:max-h-none">
          <div className="flex flex-col h-full justify-between">
            
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-cyber-border/60 mb-3">
                {/* Log filters */}
                <div className="flex items-center gap-1.5">
                  <ListFilter size={11} className="text-gray-500" />
                  <button
                    id="filter-all-btn"
                    onClick={() => {
                      if (soundEnabled) playClickSound(0.12);
                      setFilterMode('all');
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest ${
                      filterMode === 'all' ? 'text-neon-cyan border border-neon-cyan/20 bg-neon-cyan/5' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    All
                  </button>
                  <button
                    id="filter-pomo-btn"
                    onClick={() => {
                      if (soundEnabled) playClickSound(0.12);
                      setFilterMode('pomodoro');
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest ${
                      filterMode === 'pomodoro' ? 'text-neon-cyan border border-neon-cyan/20 bg-neon-cyan/5' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Focus
                  </button>
                  <button
                    id="filter-break-btn"
                    onClick={() => {
                      if (soundEnabled) playClickSound(0.12);
                      setFilterMode('break');
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest ${
                      filterMode === 'break' ? 'text-neon-cyan border border-neon-cyan/20 bg-neon-cyan/5' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Breaks
                  </button>
                </div>
                <span className="text-[9px] font-mono text-neon-cyan bg-neon-cyan/5 px-2 py-0.5 rounded border border-neon-cyan/10">
                  LOGS: {filteredLogs.length}
                </span>
              </div>

              {/* Logs scrollbox */}
              <div className="overflow-y-auto pr-1 space-y-2.5 max-h-[160px] lg:max-h-[220px]">
                {filteredLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 opacity-40">
                    <Calendar className="text-gray-700 mb-2" size={24} />
                    <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">REGISTRY VACANT</span>
                  </div>
                ) : (
                  filteredLogs.slice(0, 30).map(log => {
                    const isPomo = log.mode === 'pomodoro';
                    const formattedTime = new Date(log.completedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const cleanCategory = CATEGORIES.find(c => c.id === log.taskCategory) || CATEGORIES[0];
                    
                    return (
                      <div
                        key={log.id}
                        id={`log-item-${log.id}`}
                        className="flex items-center justify-between p-2.5 bg-black/40 border border-cyber-border/40 rounded-lg hover:border-gray-800 transition-all text-xs font-mono"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[9px] px-1 rounded-sm uppercase tracking-wider ${
                                isPomo 
                                  ? 'text-neon-cyan bg-neon-cyan/5 border border-neon-cyan/10' 
                                  : 'text-neon-pink bg-neon-pink/5 border border-neon-pink/10'
                              }`}
                            >
                              {isPomo ? 'Focus' : 'Break'}
                            </span>
                            {isPomo && log.taskCategory && (
                              <span className="text-[9px] text-gray-500">
                                {cleanCategory.icon} {cleanCategory.label}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-300 text-[11px] truncate leading-tight">
                            {isPomo ? log.taskTitle || 'General Focus Block' : `${log.durationMinutes}m Idle Recharge`}
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0 ml-3">
                          <span className="text-[10px] font-digital font-semibold text-white block">
                            +{log.durationMinutes}M
                          </span>
                          <span className="text-[9px] text-gray-600 block mt-0.5">{formattedTime}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Export CVS Button exactly matching the design specification */}
            <button
              id="export-csv-btn"
              onClick={() => {
                if (soundEnabled) playClickSound(0.25);
                if (logs.length === 0) {
                  alert("Registry logs vacant. Log a session to export telemetry.");
                  return;
                }
                const csvHeaders = "ID,Mode,DurationMinutes,CompletedAt,TaskTitle,Category\n";
                const csvRows = logs.map(l => 
                  `${l.id},${l.mode},${l.durationMinutes},"${new Date(l.completedAt).toISOString()}","${(l.taskTitle || '').replace(/"/g, '""')}",${l.taskCategory}`
                ).join("\n");
                const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = "neon_focus_telemetry.csv";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className="mt-4 w-full py-2.5 bg-neon-cyan/5 border border-neon-cyan/40 hover:bg-neon-cyan/10 text-neon-cyan text-xs font-mono uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_12px_rgba(0,243,255,0.25)] flex items-center justify-center gap-2"
            >
              Export Data (.CSV)
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
