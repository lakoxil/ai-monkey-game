export const MODES = {
  MODE_1: "mode1",
  MODE_2: "mode2",
  MODE_3: "mode3",
};

const DEFAULT_RANGE = { min: 1, max: 100, precision: 0 };

export function scoreMode1(guess, answer) {
  if (isSameNumber(guess, answer)) {
    return { feedback: "猜中了", score: null, isCorrect: true };
  }

  return {
    feedback: guess > answer ? "太大" : "太小",
    score: null,
    isCorrect: false,
  };
}

export function scoreMode2(guess, answer, range = DEFAULT_RANGE) {
  const score = clampScore(100 - (Math.abs(guess - answer) / rangeSize(range)) * 100);
  const isCorrect = isSameNumber(guess, answer);

  return {
    feedback: isCorrect ? "猜中了！Score = 100" : "已取得分數",
    score: isCorrect ? 100 : score,
    isCorrect,
  };
}

export function scoreMode3(guess, answer, previousGuess, range = DEFAULT_RANGE) {
  const distance = Math.abs(guess - answer);
  const bucketSize = rangeSize(range) / 20;
  const baseScore = 100 - Math.ceil(distance / bucketSize) * 5;
  let adjustment = 0;

  if (Number.isFinite(previousGuess)) {
    const previousDistance = Math.abs(previousGuess - answer);
    if (distance < previousDistance) adjustment = 1;
    if (distance > previousDistance) adjustment = -1;
  }

  const score = clampScore(baseScore + adjustment);
  const isCorrect = isSameNumber(guess, answer);

  return {
    feedback: isCorrect ? "猜中了！Score = 100" : "已取得分數",
    score: isCorrect ? 100 : score,
    isCorrect,
  };
}

export function scoreGuess({ mode, guess, answer, previousGuess, range = DEFAULT_RANGE }) {
  if (mode === MODES.MODE_1) return scoreMode1(guess, answer);
  if (mode === MODES.MODE_2) return scoreMode2(guess, answer, range);
  return scoreMode3(guess, answer, previousGuess, range);
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function rangeSize(range) {
  const span = Math.abs(range.max - range.min);
  if (span === 0) return 1;
  return range.precision === 0 ? span + 1 : span;
}

function isSameNumber(a, b) {
  return Math.abs(a - b) < 1e-9;
}
