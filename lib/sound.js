let audioContext;

export function playThinkingSound() {
  playSequence([
    { frequency: 330, start: 0, duration: 0.06, gain: 0.08, type: "triangle" },
    { frequency: 440, start: 0.08, duration: 0.06, gain: 0.075, type: "triangle" },
  ]);
}

export function playFeedbackSound(isCorrect) {
  if (isCorrect) {
    playImpact();
    playSequence([
      { frequency: 392, start: 0.05, duration: 0.12, gain: 0.12, type: "square" },
      { frequency: 523.25, start: 0.16, duration: 0.12, gain: 0.12, type: "square" },
      { frequency: 659.25, start: 0.27, duration: 0.14, gain: 0.13, type: "square" },
      { frequency: 783.99, start: 0.4, duration: 0.16, gain: 0.13, type: "square" },
      { frequency: 1046.5, start: 0.56, duration: 0.34, gain: 0.12, type: "triangle" },
    ]);
    return;
  }

  playSequence([{ frequency: 220, start: 0, duration: 0.12, gain: 0.065, type: "triangle" }]);
}

function playSequence(notes) {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    context.resume();
  }

  const now = context.currentTime;
  notes.forEach((note) => playTone(context, now + note.start, note));
}

function playTone(context, startTime, { frequency, duration, gain, type = "sine" }) {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(gain, startTime + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function playImpact() {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    context.resume();
  }

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(120, now);
  oscillator.frequency.exponentialRampToValueAtTime(45, now + 0.22);
  gainNode.gain.setValueAtTime(0.18, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.26);
}

function getAudioContext() {
  if (audioContext) return audioContext;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  audioContext = new AudioContextClass();
  return audioContext;
}
