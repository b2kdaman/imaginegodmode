/**
 * Audio utilities using Web Audio API
 * Cyberpunk/aggressive sound design
 */

/**
 * Play a tone using Web Audio API with optional distortion
 */
export const playTone = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain: number = 0.4
): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.error('[Audio] Error playing tone:', error);
  }
};

/**
 * Play a glitchy digital beep with frequency sweep
 */
const playFrequencySweep = (startFreq: number, endFreq: number, duration: number): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + duration);

    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.error('[Audio] Error playing frequency sweep:', error);
  }
};

/**
 * Play cyberpunk correct key sound - digital blip with pitch rise
 */
export const playCorrectKeySound = (): void => {
  // Sharp digital blip with upward sweep
  playFrequencySweep(800, 1600, 0.08);
  // Add harmonic layer
  setTimeout(() => playTone(1200, 0.06, 'square', 0.3), 10);
};

/**
 * Play cyberpunk wrong key sound - harsh glitch
 */
export const playWrongKeySound = (): void => {
  // Deep harsh buzz with downward pitch
  playFrequencySweep(400, 80, 0.25);
  // Add distorted layer
  setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.6), 20);
  // Glitch click
  playTone(60, 0.05, 'square', 0.4);
};

/**
 * Play cyberpunk success sound - aggressive digital fanfare with melody
 */
export const playSuccessChord = (): void => {
  // Melody notes (in Hz) - cyberpunk style ascending pattern
  const melody = [
    { freq: 523.25, duration: 0.15 },  // C5
    { freq: 659.25, duration: 0.15 },  // E5
    { freq: 783.99, duration: 0.15 },  // G5
    { freq: 1046.50, duration: 0.15 }, // C6
    { freq: 1318.51, duration: 0.2 },  // E6
    { freq: 1567.98, duration: 0.3 },  // G6 - held longer for emphasis
  ];

  // Play melody notes in sequence with overlapping harmonics
  let delay = 0;
  melody.forEach(({ freq, duration }, index) => {
    setTimeout(() => {
      // Main melody note (square wave for aggressive sound)
      playTone(freq, duration, 'square', 0.5);

      // Add harmonic layer (octave below for depth)
      playTone(freq / 2, duration, 'square', 0.3);

      // Add a slight frequency sweep on alternating notes for texture
      if (index % 2 === 0) {
        playFrequencySweep(freq, freq * 1.1, duration * 0.5);
      }
    }, delay);

    delay += duration * 1000 * 0.7; // 70% overlap for smoother flow
  });

  // Final ascending sweep for dramatic finish
  setTimeout(() => {
    playFrequencySweep(1567.98, 3135.96, 0.4); // G6 to G7
  }, delay + 100);
};
