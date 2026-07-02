import { formatScore, MODES } from "./scoring.js";

export const DEFAULT_RANGE = { min: 1, max: 100, precision: 0 };
export const DEFAULT_NUMBER_SETTINGS = { numberType: "integer", allowNegative: false };

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

export function createGameState(mode = MODES.MODE_1, range = DEFAULT_RANGE, settings = DEFAULT_NUMBER_SETTINGS) {
  return {
    mode,
    range,
    settings,
    answer: randomAnswer(range),
    history: [],
    isComplete: false,
    endReason: null,
  };
}

export function randomAnswer(range = DEFAULT_RANGE) {
  const factor = 10 ** range.precision;
  const min = Math.round(range.min * factor);
  const max = Math.round(range.max * factor);
  const value = Math.floor(Math.random() * (max - min + 1)) + min;
  return normalizeNumber(value / factor, range.precision);
}

export function parseGuess(value, range = DEFAULT_RANGE, settings = DEFAULT_NUMBER_SETTINGS) {
  const guess = Number(value);
  if (!Number.isFinite(guess)) return { ok: false, message: "請輸入有效數字。" };
  if (settings.numberType === "integer" && !Number.isInteger(guess)) {
    return { ok: false, message: "整數模式請輸入整數。" };
  }
  if (guess < range.min || guess > range.max) {
    return { ok: false, message: `請輸入 ${formatNumber(range.min)} 到 ${formatNumber(range.max)} 之間的數字。` };
  }
  return { ok: true, guess };
}

export function parseRange(minValue, maxValue, settings = DEFAULT_NUMBER_SETTINGS) {
  const min = Number(minValue);
  const max = Number(maxValue);

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { ok: false, message: "範圍請輸入有效數字。" };
  }

  if (min >= max) {
    return { ok: false, message: "最小值必須小於最大值。" };
  }

  if (!settings.allowNegative && (min < 0 || max < 0)) {
    return { ok: false, message: "若要使用負數，請先開啟「負數」。" };
  }

  if (settings.numberType === "integer" && (!Number.isInteger(min) || !Number.isInteger(max))) {
    return { ok: false, message: "整數模式的最小值與最大值都必須是整數。" };
  }

  const precision = settings.numberType === "integer" ? 0 : Math.min(Math.max(decimalPlaces(minValue), decimalPlaces(maxValue), 1), 6);
  const normalizedMin = normalizeNumber(min, precision);
  const normalizedMax = normalizeNumber(max, precision);

  if (normalizedMin >= normalizedMax) {
    return { ok: false, message: "範圍太小，請加大最大值與最小值的差距。" };
  }

  return {
    ok: true,
    range: {
      min: normalizedMin,
      max: normalizedMax,
      precision,
    },
  };
}

export function rangeForSettings(settings = DEFAULT_NUMBER_SETTINGS) {
  if (settings.numberType === "decimal") {
    return settings.allowNegative ? { min: -10, max: 10, precision: 1 } : { min: 0, max: 10, precision: 1 };
  }

  return settings.allowNegative ? { min: -100, max: 100, precision: 0 } : DEFAULT_RANGE;
}

export function formatRange(range = DEFAULT_RANGE) {
  return `${formatNumber(range.min)}–${formatNumber(range.max)}`;
}

export function formatNumber(value) {
  if (!Number.isFinite(value)) return "";
  return String(Number(value.toFixed(6)));
}

function decimalPlaces(value) {
  const text = String(value).trim();
  if (!text.includes(".")) return 0;
  return text.split(".")[1]?.length ?? 0;
}

function normalizeNumber(value, precision) {
  return Number(value.toFixed(precision));
}

export function exampleGuess(range = DEFAULT_RANGE, settings = DEFAULT_NUMBER_SETTINGS) {
  const preferred = settings.numberType === "decimal" ? (settings.allowNegative ? -2.5 : 2.5) : (settings.allowNegative ? -20 : 50);
  const value = preferred >= range.min && preferred <= range.max ? preferred : (range.min + range.max) / 2;
  return settings.numberType === "integer" ? String(Math.round(value)) : formatNumber(normalizeNumber(value, Math.max(range.precision, 1)));
}

export function describeNumberSettings(settings = DEFAULT_NUMBER_SETTINGS) {
  const typeText = settings.numberType === "integer" ? "整數" : "小數";
  return settings.allowNegative ? `${typeText}，可含負數` : `${typeText}，不含負數`;
}

export function buildFeedbackMessage({ mode, result, guess, round }) {
  const lines = ["分析中..."];

  if (mode === MODES.MODE_1) {
    lines.push(result.isCorrect ? "猜中了！你找到答案了。" : `這一次系統回覆：${result.feedback}。`);
    lines.push(result.isCorrect ? `答案就是 ${guess}。` : "請根據回饋縮小下一次搜尋範圍。");
    return lines.join("\n");
  }

  lines.push(`這一次的 Score 是 ${formatScore(result.score)} 分。`);

  if (result.isCorrect) {
    lines.push(`猜中了！答案就是 ${guess}。`);
  } else if (mode === MODES.MODE_2) {
    lines.push("請比較每一輪分數，分數越高代表越接近目標。");
  } else {
    lines.push(round === 1 ? "第一筆資料已建立，接下來可以用新猜測測試規則。" : "請根據目前的歷史紀錄，思考下一次要猜哪裡。");
  }

  return lines.join("\n");
}
