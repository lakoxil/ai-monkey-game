export const MODES = {
  MODE_1: "mode1",
  MODE_2: "mode2",
  MODE_3: "mode3",
};

export function scoreMode1(guess, answer) {
  if (guess === answer) {
    return { feedback: "猜中了", score: null, isCorrect: true };
  }

  return {
    feedback: guess > answer ? "太大" : "太小",
    score: null,
    isCorrect: false,
  };
}

export function scoreMode2(guess, answer) {
  const score = clampScore(100 - Math.abs(guess - answer));

  return {
    feedback: guess === answer ? "猜中了！Score = 100" : "已取得分數",
    score,
    isCorrect: guess === answer,
  };
}

export function scoreMode3(guess, answer, previousGuess) {
  const distance = Math.abs(guess - answer);
  const baseScore = 100 - Math.ceil(distance / 5) * 5;
  let adjustment = 0;

  if (Number.isInteger(previousGuess)) {
    const previousDistance = Math.abs(previousGuess - answer);
    if (distance < previousDistance) adjustment = 1;
    if (distance > previousDistance) adjustment = -1;
  }

  const score = clampScore(baseScore + adjustment);

  return {
    feedback: guess === answer ? "猜中了！Score = 100" : "已取得分數",
    score: guess === answer ? 100 : score,
    isCorrect: guess === answer,
  };
}

export function scoreGuess({ mode, guess, answer, previousGuess }) {
  if (mode === MODES.MODE_1) return scoreMode1(guess, answer);
  if (mode === MODES.MODE_2) return scoreMode2(guess, answer);
  return scoreMode3(guess, answer, previousGuess);
}

function clampScore(score) {
  return Math.max(0, Math.min(100, score));
}
