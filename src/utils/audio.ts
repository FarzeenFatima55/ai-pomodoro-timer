let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a high-tech retro laser synth sweep (cyberpunk finish)
 */
function playSynthLaser(ctx: AudioContext, destination: AudioNode) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  // Sweep pitch down rapidly
  osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.6);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.6);
}

/**
 * Play futuristic double digital beep
 */
function playDigitalBeep(ctx: AudioContext, destination: AudioNode) {
  const time = ctx.currentTime;
  
  // First short beep
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'square';
  osc1.frequency.setValueAtTime(1200, time);
  gain1.gain.setValueAtTime(0.15, time);
  gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
  osc1.connect(gain1);
  gain1.connect(destination);
  osc1.start(time);
  osc1.stop(time + 0.12);

  // Second short beep
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(1500, time + 0.12);
  gain2.gain.setValueAtTime(0.15, time + 0.12);
  gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
  osc2.connect(gain2);
  gain2.connect(destination);
  osc2.start(time + 0.12);
  osc2.stop(time + 0.25);
}

/**
 * Play deep zen resonance ring
 */
function playZenRing(ctx: AudioContext, destination: AudioNode) {
  const time = ctx.currentTime;
  const frequencies = [220, 329.63, 440, 554.37, 659.25]; // Warm harmonic major-ish chord
  
  frequencies.forEach((f, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, time);
    
    // Slight pitch vibrato/instability for warmth
    osc.frequency.linearRampToValueAtTime(f + (Math.random() * 4 - 2), time + 2.0);
    
    const maxGain = 0.1 / frequencies.length;
    gain.gain.setValueAtTime(maxGain, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 2.5);
    
    osc.connect(gain);
    gain.connect(destination);
    
    osc.start(time);
    osc.stop(time + 2.5);
  });
}

/**
 * Play an urgent pulsating sci-fi alarm
 */
function playCyberAlarm(ctx: AudioContext, destination: AudioNode) {
  const time = ctx.currentTime;
  const duration = 1.6;
  
  // Modulator LFO
  const mod = ctx.createOscillator();
  const modGain = ctx.createGain();
  mod.frequency.value = 6; // 6 Hz pulsation
  modGain.gain.value = 180; // Sweeps 180 Hz around carrier frequency
  
  // Carrier oscillator
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.value = 580; // base frequency
  
  gain.gain.setValueAtTime(0.2, time);
  gain.gain.linearRampToValueAtTime(0.2, time + duration - 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
  // LFO chain: Modulator -> ModGain -> Carrier Frequency
  mod.connect(modGain);
  modGain.connect(osc.frequency);
  
  osc.connect(gain);
  gain.connect(destination);
  
  mod.start(time);
  osc.start(time);
  
  mod.stop(time + duration);
  osc.stop(time + duration);
}

/**
 * Play a beautiful UI mechanical click sound
 */
export function playClickSound(volume: number = 0.3) {
  try {
    const ctx = getAudioContext();
    const destination = ctx.destination;
    const time = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, time);
    // rapid pitch dip
    osc.frequency.exponentialRampToValueAtTime(400, time + 0.03);
    
    gain.gain.setValueAtTime(volume * 0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    
    osc.connect(gain);
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + 0.04);
  } catch (err) {
    console.warn('Audio click failed', err);
  }
}

/**
 * Play soft digital stopwatch tick
 */
export function playTickSound(volume: number = 0.15) {
  try {
    const ctx = getAudioContext();
    const destination = ctx.destination;
    const time = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, time);
    
    gain.gain.setValueAtTime(volume * 0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.008);
    
    osc.connect(gain);
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + 0.01);
  } catch (err) {
    // Silence audio error
  }
}

/**
 * Main function to play completed alerts based on choice
 */
export function playAlert(type: 'synth_laser' | 'digital_beep' | 'zen_ring' | 'cyber_alarm', volume: number = 0.5) {
  try {
    const ctx = getAudioContext();
    
    // Use master gain for volume control
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    
    switch (type) {
      case 'synth_laser':
        playSynthLaser(ctx, masterGain);
        break;
      case 'digital_beep':
        playDigitalBeep(ctx, masterGain);
        break;
      case 'zen_ring':
        playZenRing(ctx, masterGain);
        break;
      case 'cyber_alarm':
        playCyberAlarm(ctx, masterGain);
        break;
      default:
        playDigitalBeep(ctx, masterGain);
    }
  } catch (err) {
    console.error('Audio synthesizer playback failed:', err);
  }
}
