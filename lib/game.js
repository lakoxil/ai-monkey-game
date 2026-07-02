import { MODES } from "./scoring.js";

export const RANGE = { min: 1, max: 100 };

export const MODE_CONFIG = [
  {
    id: MODES.MODE_1,
    label: "Mode 1",
    title: "大於 / 小於",
    description: "這一關會告訴你太大或太小。請利用回饋縮小範圍。",
  },
  {
    id: MODES.MODE_2,
    label: "Mode 2",
    title: "分數",
    description: "這一關只會告訴你分數。分數越高，代表越接近目標。",
  },
  {
    id: MODES.MODE_3,
    label: "Mode 3",
    title: "隱藏規則",
    description: "這一關只有分數，而且規則不公開。請從每一次猜測與分數中找出規律。",
  },
];

export function createGameState(mode = MODES.MODE_1) {
  return {
    mode,
    answer: randomAnswer(),
    history: [],
    isComplete: false,
  };
}

export function randomAnswer() {
  return Math.floor(Math.random() * (RANGE.max - RANGE.min + 1)) + RANGE.min;
}

export function parseGuess(value) {
  const guess = Number(value);
  if (!Number.isInteger(guess)) return { ok: false, message: "請輸入整數。" };
  if (guess < RANGE.min || guess > RANGE.max) {
    return { ok: false, message: "請輸入 1 到 100 之間的數字。" };
  }
  return { ok: true, guess };
}

export function buildFeedbackMessage({ mode, result, guess, round }) {
  const lines = ["分析中..."];

  if (mode === MODES.MODE_1) {
    lines.push(result.isCorrect ? "猜中了！你找到答案了。" : `這一次系統回覆：${result.feedback}。`);
    lines.push(result.isCorrect ? `答案就是 ${guess}。` : "請根據回饋縮小下一次搜尋範圍。");
    return lines.join("\n");
  }

  lines.push(`這一次的 Score 是 ${result.score} 分。`);

  if (result.isCorrect) {
    lines.push(`猜中了！答案就是 ${guess}。`);
  } else if (mode === MODES.MODE_2) {
    lines.push("請比較每一輪分數，分數越高代表越接近目標。");
  } else {
    lines.push(round === 1 ? "第一筆資料已建立，接下來可以用新猜測測試規則。" : "請根據目前的歷史紀錄，思考下一次要猜哪裡。");
  }

  return lines.join("\n");
}
