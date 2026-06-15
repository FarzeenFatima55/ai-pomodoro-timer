import { Settings } from '../types';
import { Volume2, VolumeX, Bell, Play, Timer, Zap, Loader2 } from 'lucide-react';
import { playClickSound, playAlert } from '../utils/audio';

interface SettingsProps {
  settings: Settings;
  onUpdateSettings: (settings: Settings) => void;
  activeMode: string;
}

export default function SettingsComponent({
  settings,
  onUpdateSettings,
  activeMode,
}: SettingsProps) {
  
  const handleToggleSound = () => {
    onUpdateSettings({
      ...settings,
      soundEnabled: !settings.soundEnabled,
    });
    if (!settings.soundEnabled) {
      setTimeout(() => playClickSound(0.2), 30);
    }
  };

  const handleTestAlert = () => {
    playAlert(settings.soundType, settings.soundVolume);
  };

  const handleMinutesChange = (key: keyof Settings, val: number) => {
    // clamp between 1 and 180 mins
    const clamped = Math.max(1, Math.min(180, val));
    onUpdateSettings({
      ...settings,
      [key]: clamped,
    });
  };

  return (
    <div id="settings-container" className="bg-cyber-panel border border-cyber-border rounded-xl p-5 relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-24 h-24 bg-neon-yellow/5 blur-3xl pointer-events-none rounded-full" />
      
      <div className="flex items-center justify-between pb-3.5 border-b border-cyber-border">
        <div>
          <h2 className="text-sm font-mono tracking-widest text-gray-400 uppercase">TELEMETRY PREFERENCES</h2>
          <p className="text-xs text-neon-yellow font-mono mt-0.5">FINE-TUNE TIMER GRID parameters</p>
        </div>
        <Timer size={18} className="text-neon-yellow filter drop-shadow-[0_0_2px_#ffd700]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Durations controls column */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-mono tracking-wider text-gray-500 uppercase border-b border-cyber-border/40 pb-1">TIMING PARAMETERS (MINUTES)</h4>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-gray-400 mb-1 uppercase">Focus Pomo</label>
              <input
                id="setting-pomodoro-val"
                type="number"
                min="1"
                max="180"
                value={settings.pomodoroDuration}
                onChange={(e) => handleMinutesChange('pomodoroDuration', parseInt(e.target.value) || 25)}
                className="w-full bg-cyber-bg border border-cyber-border focus:border-neon-yellow focus:outline-none rounded py-1 px-2.5 text-center font-mono text-sm text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-gray-400 mb-1 uppercase">Short break</label>
              <input
                id="setting-short-break-val"
                type="number"
                min="1"
                max="180"
                value={settings.shortBreakDuration}
                onChange={(e) => handleMinutesChange('shortBreakDuration', parseInt(e.target.value) || 5)}
                className="w-full bg-cyber-bg border border-cyber-border focus:border-neon-yellow focus:outline-none rounded py-1 px-2.5 text-center font-mono text-sm text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-gray-400 mb-1 uppercase">Long break</label>
              <input
                id="setting-long-break-val"
                type="number"
                min="1"
                max="180"
                value={settings.longBreakDuration}
                onChange={(e) => handleMinutesChange('longBreakDuration', parseInt(e.target.value) || 15)}
                className="w-full bg-cyber-bg border border-cyber-border focus:border-neon-yellow focus:outline-none rounded py-1 px-2.5 text-center font-mono text-sm text-white transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-mono text-gray-400 uppercase">Daily Goal Target</label>
              <span className="text-xs font-mono font-bold text-neon-yellow">{settings.dailyGoal} Pomodoros</span>
            </div>
            <input
              id="setting-daily-goal-range"
              type="range"
              min="1"
              max="24"
              value={settings.dailyGoal}
              onChange={(e) => onUpdateSettings({ ...settings, dailyGoal: parseInt(e.target.value) })}
              className="w-full accent-neon-yellow bg-cyber-bg h-1 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-3.5 pt-1.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-gray-200">Auto Deploy Breaks</label>
                <span className="text-[9px] font-mono text-gray-500 block uppercase">Continuous trigger cycle</span>
              </div>
              <button
                id="toggle-settings-autostartbreaks-btn"
                type="button"
                onClick={() => {
                  if (settings.soundEnabled) playClickSound(0.12);
                  onUpdateSettings({ ...settings, autoStartBreaks: !settings.autoStartBreaks });
                }}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                  settings.autoStartBreaks ? 'bg-neon-yellow' : 'bg-gray-800'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform ${
                    settings.autoStartBreaks ? 'translate-x-[22px]' : 'translate-x-[4px]'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-gray-200">Auto Deploy Pomodoros</label>
                <span className="text-[9px] font-mono text-gray-500 block uppercase">Start focus cycle immediately</span>
              </div>
              <button
                id="toggle-settings-autostartpomodoros-btn"
                type="button"
                onClick={() => {
                  if (settings.soundEnabled) playClickSound(0.12);
                  onUpdateSettings({ ...settings, autoStartPomodoros: !settings.autoStartPomodoros });
                }}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                  settings.autoStartPomodoros ? 'bg-neon-yellow' : 'bg-gray-800'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform ${
                    settings.autoStartPomodoros ? 'translate-x-[22px]' : 'translate-x-[4px]'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Alerts and Synthesizer Panel column */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-mono tracking-wider text-gray-500 uppercase border-b border-cyber-border/40 pb-1">ALERT & AUDIO SYNTH PORT</h4>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-200 block">Master Sound Port</span>
              <span className="text-[10px] font-mono text-gray-500 block uppercase">Toggle alerts and clicks</span>
            </div>
            <button
              id="settings-sound-master-toggle"
              type="button"
              onClick={handleToggleSound}
              className={`p-2 rounded border transition-all ${
                settings.soundEnabled
                  ? 'bg-neon-yellow/10 border-neon-yellow text-neon-yellow shadow-[0_0_8px_rgba(255,215,0,0.15)]'
                  : 'bg-black/40 border-cyber-border text-gray-500 hover:text-gray-400'
              }`}
            >
              {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1.5">Alert Wave Pattern</label>
              <select
                id="settings-sound-type-select"
                value={settings.soundType}
                onChange={(e) => {
                  if (settings.soundEnabled) playClickSound(0.12);
                  onUpdateSettings({
                    ...settings,
                    soundType: e.target.value as any,
                  });
                }}
                disabled={!settings.soundEnabled}
                className="w-full bg-cyber-bg border border-cyber-border focus:border-neon-yellow focus:outline-none rounded p-1.5 font-mono text-xs text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <option value="synth_laser" className="bg-cyber-bg">📟 Retro Cyber-Laser</option>
                <option value="digital_beep" className="bg-cyber-bg">⏰ Digital Micro-Beep</option>
                <option value="zen_ring" className="bg-cyber-bg">🧘 Buddhist Zen Ring</option>
                <option value="cyber_alarm" className="bg-cyber-bg">🚨 Cyber Pulsating Alarm</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-mono text-gray-400 uppercase">Decibel Gain (Volume)</span>
                <span className="text-[10px] font-mono text-gray-400">{Math.round(settings.soundVolume * 100)}%</span>
              </div>
              <input
                id="settings-sound-volume-range"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => onUpdateSettings({ ...settings, soundVolume: parseFloat(e.target.value) })}
                disabled={!settings.soundEnabled}
                className="w-full accent-neon-yellow bg-cyber-bg h-1 rounded-lg cursor-pointer disabled:opacity-35"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-gray-200">Rhythmic Ticking Engine</label>
                <span className="text-[9px] font-mono text-gray-500 block uppercase">Gentle continuous focus beeps</span>
              </div>
              <button
                id="toggle-settings-ticksand-btn"
                type="button"
                onClick={() => {
                  if (settings.soundEnabled) playClickSound(0.12);
                  onUpdateSettings({ ...settings, tickSoundEnabled: !settings.tickSoundEnabled });
                }}
                disabled={!settings.soundEnabled}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors disabled:opacity-30 ${
                  settings.tickSoundEnabled && settings.soundEnabled ? 'bg-neon-yellow' : 'bg-gray-800'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform ${
                    settings.tickSoundEnabled && settings.soundEnabled ? 'translate-x-[22px]' : 'translate-x-[4px]'
                  }`}
                />
              </button>
            </div>

            <button
              id="test-sound-alert-btn"
              type="button"
              onClick={handleTestAlert}
              disabled={!settings.soundEnabled}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-black/40 hover:bg-neon-yellow/10 border border-cyber-border hover:border-neon-yellow text-gray-400 hover:text-neon-yellow font-mono text-xs uppercase tracking-widest font-bold rounded transition-all duration-300 disabled:opacity-20 disabled:pointer-events-none"
            >
              <Zap size={13} />
              Query Alert Synth Frequencies
            </button>
          </div>
        </div>
      </div>

      {activeMode && (
        <div className="mt-5 p-3.5 bg-black/40 border border-cyber-border/40 rounded-lg text-center font-mono text-[10px] text-gray-500 uppercase">
          Changes take effect instantly. Active cycle mode: <span className="text-neon-yellow font-bold">{activeMode.replace('_', ' ')}</span>
        </div>
      )}
    </div>
  );
}
