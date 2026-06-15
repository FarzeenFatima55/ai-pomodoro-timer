import React, { useState } from 'react';
import { Task } from '../types';
import { Plus, Trash2, CheckCircle2, Circle, Star, Award } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface TasksProps {
  tasks: Task[];
  activeTaskId: string | null;
  onSetActiveTask: (id: string | null) => void;
  onAddTask: (title: string, category: string, expectedPomodoros: number) => void;
  onToggleCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  soundEnabled: boolean;
}

export const CATEGORIES = [
  { id: 'development', label: 'Development', icon: '💻', colorClass: 'text-neon-cyan border-neon-cyan bg-neon-cyan/5' },
  { id: 'design', label: 'Design', icon: '🎨', colorClass: 'text-neon-pink border-neon-pink bg-neon-pink/5' },
  { id: 'writing', label: 'Writing', icon: '✍️', colorClass: 'text-neon-violet border-neon-violet bg-neon-violet/5' },
  { id: 'learning', label: 'Learning', icon: '🧠', colorClass: 'text-neon-green border-neon-green bg-neon-green/5' },
  { id: 'admin', label: 'Admin', icon: '📂', colorClass: 'text-neon-yellow border-neon-yellow bg-neon-yellow/5' },
];

export default function Tasks({
  tasks,
  activeTaskId,
  onSetActiveTask,
  onAddTask,
  onToggleCompleteTask,
  onDeleteTask,
  soundEnabled,
}: TasksProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('development');
  const [expectedCount, setExpectedCount] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (soundEnabled) playClickSound(0.2);
    onAddTask(title.trim(), category, expectedCount);
    setTitle('');
    setExpectedCount(1);
    setShowAddForm(false);
  };

  const currentCategoryObj = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];

  return (
    <div id="tasks-container" className="flex flex-col h-full bg-cyber-panel border border-cyber-border rounded-xl p-5 relative overflow-hidden">
      {/* Absolute background accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-neon-pink/5 blur-3xl pointer-events-none rounded-full" />
      
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyber-border">
        <div>
          <h2 className="text-sm font-mono tracking-widest text-gray-400 uppercase">Focus Tasks</h2>
          <p className="text-xs text-neon-cyan font-mono mt-0.5">TARGET ACTIVE TASK</p>
        </div>
        <button
          id="toggle-add-task-btn"
          onClick={() => {
            if (soundEnabled) playClickSound(0.15);
            setShowAddForm(!showAddForm);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
            showAddForm 
              ? 'bg-neon-pink/10 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/20' 
              : 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 hover:shadow-[0_0_10px_rgba(0,243,255,0.2)]'
          }`}
        >
          <Plus size={14} />
          {showAddForm ? 'Cancel' : 'New Task'}
        </button>
      </div>

      {showAddForm && (
        <form id="add-task-form" onSubmit={handleSubmit} className="mb-4 p-3.5 bg-black/40 border border-cyber-border rounded-lg space-y-3">
          <div>
            <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">Task Title</label>
            <input
              id="new-task-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Fix database latency"
              className="w-full bg-cyber-bg border border-cyber-border focus:border-neon-cyan focus:outline-none rounded px-3 py-1.5 font-mono text-xs text-white placeholder-gray-600 transition-all"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">Category</label>
              <select
                id="task-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-cyber-bg border border-cyber-border focus:border-neon-cyan focus:outline-none rounded px-2 py-1.5 font-mono text-xs text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id} className="bg-cyber-bg text-white">
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">Expected Pomodoros</label>
              <div className="flex items-center gap-1.5">
                <input
                  id="task-expected-pomodoros-input"
                  type="number"
                  min="1"
                  max="12"
                  value={expectedCount}
                  onChange={(e) => setExpectedCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 bg-cyber-bg border border-cyber-border focus:border-neon-cyan focus:outline-none rounded px-2 py-1.5 text-center font-mono text-xs text-white"
                />
                <span className="text-gray-600 text-xs font-mono">sessions</span>
              </div>
            </div>
          </div>

          <button
            id="submit-task-btn"
            type="submit"
            className="w-full py-1.5 bg-neon-cyan/20 border border-neon-cyan hover:bg-neon-cyan/30 text-neon-cyan font-mono text-xs uppercase tracking-widest font-bold rounded transition-all duration-300 hover:shadow-[0_0_12px_rgba(0,243,255,0.3)]"
          >
            Deploy Focus Target
          </button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[300px] md:max-h-none">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 border border-dashed border-cyber-border rounded-lg text-center p-4">
            <span className="text-xs font-mono text-gray-600">NO TARGET ENGINES RECORDED</span>
            <button
              id="empty-state-add-task-btn"
              onClick={() => {
                if (soundEnabled) playClickSound(0.2);
                setShowAddForm(true);
              }}
              className="mt-2 text-[10px] font-mono text-neon-cyan hover:underline uppercase"
            >
              + Launch First Task
            </button>
          </div>
        ) : (
          tasks.map((task) => {
            const isSelected = activeTaskId === task.id;
            const catObj = CATEGORIES.find((c) => c.id === task.category) || CATEGORIES[0];
            
            return (
              <div
                id={`task-item-${task.id}`}
                key={task.id}
                onClick={() => {
                  if (soundEnabled && !isSelected) playClickSound(0.15);
                  onSetActiveTask(isSelected ? null : task.id);
                }}
                className={`group flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-300 relative ${
                  isSelected
                    ? 'bg-cyber-bg border-neon-cyan shadow-[0_0_12px_rgba(0,243,255,0.15)] ring-1 ring-neon-cyan/20'
                    : 'bg-black/20 border-cyber-border hover:border-gray-600'
                }`}
              >
                {/* Visual active indicator bar on left side of active task */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-cyan rounded-l" />
                )}

                {/* Left check circle column */}
                <button
                  id={`toggle-complete-task-${task.id}-btn`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (soundEnabled) playClickSound(0.2);
                    onToggleCompleteTask(task.id);
                  }}
                  className="mt-0.5 text-gray-500 hover:text-neon-pink transition-colors focus:outline-none"
                >
                  {task.completed ? (
                    <CheckCircle2 size={16} className="text-neon-pink filter drop-shadow-[0_0_2px_#ff007f]" />
                  ) : (
                    <Circle size={16} className="text-gray-600 hover:border-neon-pink" />
                  )}
                </button>

                {/* Middle details column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[9px] font-mono border rounded px-1.5 py-0.2 select-none uppercase tracking-wider ${catObj.colorClass}`}
                    >
                      {catObj.icon} {catObj.label}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[9px] font-mono text-neon-cyan animate-pulse">
                        <Star size={8} fill="currentColor" /> ACTIVE FOCUS
                      </span>
                    )}
                  </div>
                  
                  <p
                    className={`text-xs font-semibold leading-normal truncate ${
                      task.completed ? 'text-gray-600 line-through' : 'text-gray-200'
                    }`}
                  >
                    {task.title}
                  </p>

                  {/* Pomodoro sessions tracking notches */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Sessions:</span>
                    <div className="flex items-center gap-1 select-none">
                      {Array.from({ length: Math.max(task.pomodorosExpected, task.pomodorosCompleted) }).map((_, idx) => {
                        const isDone = idx < task.pomodorosCompleted;
                        const isExpectedButNo = idx < task.pomodorosExpected && idx >= task.pomodorosCompleted;
                        const extraCompleted = idx >= task.pomodorosExpected;

                        let styleClass = "w-2.5 h-1.5 rounded-sm ";
                        if (isDone) {
                          styleClass += extraCompleted 
                            ? "bg-neon-pink shadow-[0_0_4px_#ff007f]" 
                            : "bg-neon-cyan shadow-[0_0_4px_#00f3ff]";
                        } else if (isExpectedButNo) {
                          styleClass += "bg-cyber-border border border-gray-700";
                        } else {
                          styleClass += "bg-black/40 border border-cyber-border";
                        }

                        return (
                          <div
                            key={idx}
                            className={styleClass}
                            title={`${task.pomodorosCompleted}/${task.pomodorosExpected} sessions completed`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">
                      {task.pomodorosCompleted}/{task.pomodorosExpected}
                    </span>
                  </div>
                </div>

                {/* Right actions column */}
                <button
                  id={`delete-task-${task.id}-btn`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (soundEnabled) playClickSound(0.25);
                    onDeleteTask(task.id);
                  }}
                  className="text-gray-700 hover:text-red-500 hover:shadow-sm opacity-0 group-hover:opacity-100 transition-all p-1 self-center"
                  title="Abstain Task"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Task status counts header */}
      {tasks.length > 0 && (
        <div className="mt-3 pt-2 border-t border-cyber-border/40 flex justify-between text-[10px] font-mono text-gray-500">
          <span>PENDING: {tasks.filter(t => !t.completed).length}</span>
          <span>COMPLETED: {tasks.filter(t => t.completed).length}</span>
        </div>
      )}
    </div>
  );
}
