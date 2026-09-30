// Lightweight Web Audio API Synthesizer for UI sound effects (zero external files)
let audioCtx = null;
let soundEnabled = localStorage.getItem('westy_sound_enabled') !== 'false';

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('westy_sound_enabled', String(soundEnabled));
  if (soundEnabled) {
    playPop();
  }
  return soundEnabled;
}

// Gentle pleasant pop on message send
export function playPop() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  } catch (e) {
    // Ignore audio errors if blocked by browser policy
  }
}

// Subtle pleasant chime when message completes
export function playChime() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.04, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.26);
    });
  } catch (e) {}
}

// Click tick
export function playTick() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.035);
  } catch (e) {}
}

// -------------------------------------------------------------
// Speech Synthesis (Text-To-Speech) Controls
// -------------------------------------------------------------
let activeUtterance = null;

export function isSpeakingTTS() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}

export function stopSpeakingTTS() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    activeUtterance = null;
    window.dispatchEvent(new CustomEvent('westy-tts-change', { detail: { speaking: false } }));
  } catch (e) {
    console.error('Failed to cancel speech synthesis:', e);
  }
}

export function speakText(rawText, onStart, onEnd) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    alert('Speech synthesis is not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech first
  stopSpeakingTTS();

  // Strip code blocks, markdown symbols, and suggestions
  const clean = rawText
    .replace(/```[\s\S]*?```/g, ' [code block] ')
    .replace(/\[SUGGESTIONS:[^\]]*\]/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_~#>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return;

  const utterance = new SpeechSynthesisUtterance(clean);
  activeUtterance = utterance; // keep module-level reference to prevent garbage-collection bug

  utterance.onstart = () => {
    window.dispatchEvent(new CustomEvent('westy-tts-change', { detail: { speaking: true } }));
    if (onStart) onStart();
  };

  utterance.onend = () => {
    activeUtterance = null;
    window.dispatchEvent(new CustomEvent('westy-tts-change', { detail: { speaking: false } }));
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    activeUtterance = null;
    window.dispatchEvent(new CustomEvent('westy-tts-change', { detail: { speaking: false } }));
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

