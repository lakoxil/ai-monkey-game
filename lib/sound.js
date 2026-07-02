let audioContext;

export function playThinkingSound() {
  playSequence([
    { frequency: 330, start: 0, duration: 0.06, gain: 0.06 },
    { frequency: 440, start: 0.08, duration: 0.06, gain: 0.055 },
  ]);
}

export function playFeedbackSound(isCorrect) {
  if (isCorrect) {
    playSequence([
      { frequency: 523.25, start: 0, duration: 0.1, gain: 0.08 },
      { frequency: 659.25, start: 0.12, duration: 0.1, gain: 0.08 },
      { frequency: 783.99, start: 0.24, duration: 0.18, gain: 0.09 },
    ]);
    return;
  }

  playSequence([{ frequency: 220, start: 0, duration: 0.12, gain: 0.045 }]);
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

function playTone(context, startTime, { frequency, duration, gain }) {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(gain, startTime + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function getAudioContext() {
  if (audioContext) return audioContext;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  audioContext = new AudioContextClass();
  return audioContext;
}
