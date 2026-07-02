import { renderGameAnalysis } from "../components/GameAnalysis.js";
import { renderHistory } from "../components/GuessHistory.js";
import { renderModeSelector } from "../components/ModeSelector.js";
import { streamText } from "../components/StreamingFeedback.js";
import { buildFeedbackMessage, createGameState, formatNumber, formatRange, MODE_CONFIG, parseGuess, parseRange } from "../lib/game.js";
import { scoreGuess } from "../lib/scoring.js";
import { playFeedbackSound, playThinkingSound } from "../lib/sound.js";

const elements = {
  modeTabs: document.querySelector("#modeTabs"),
  modeDescription: document.querySelector("#modeDescription"),
  rangeForm: document.querySelector("#rangeForm"),
  rangeMinInput: document.querySelector("#rangeMinInput"),
  rangeMaxInput: document.querySelector("#rangeMaxInput"),
  rangeHelp: document.querySelector("#rangeHelp"),
  rangeValue: document.querySelector("#rangeValue"),
  guessForm: document.querySelector("#guessForm"),
  guessLabel: document.querySelector("#guessLabel"),
  guessInput: document.querySelector("#guessInput"),
  guessButton: document.querySelector("#guessButton"),
  inputHelp: document.querySelector("#inputHelp"),
  feedback: document.querySelector("#streamingFeedback"),
  historyBody: document.querySelector("#historyBody"),
  analysisRoot: document.querySelector("#analysisRoot"),
  resetButton: document.querySelector("#resetButton"),
  roundCount: document.querySelector("#roundCount"),
  successStatus: document.querySelector("#successStatus"),
  exportJsonButton: document.querySelector("#exportJsonButton"),
  exportCsvButton: document.querySelector("#exportCsvButton"),
};

let state = createGameState();

function render() {
  const currentMode = MODE_CONFIG.find((mode) => mode.id === state.mode);
  renderModeSelector(elements.modeTabs, MODE_CONFIG, state.mode, changeMode);
  elements.modeDescription.textContent = currentMode.description;
  elements.rangeValue.textContent = formatRange(state.range);
  elements.rangeMinInput.value = formatNumber(state.range.min);
  elements.rangeMaxInput.value = formatNumber(state.range.max);
  elements.guessLabel.textContent = `輸入 ${formatRange(state.range)} 之間的數字`;
  elements.guessInput.min = String(state.range.min);
  elements.guessInput.max = String(state.range.max);
  elements.guessInput.placeholder = `例如 ${formatNumber((state.range.min + state.range.max) / 2)}`;
  elements.roundCount.textContent = String(state.history.length);
  elements.successStatus.hidden = !state.isComplete;
  elements.guessButton.disabled = state.isComplete;
  elements.guessInput.disabled = state.isComplete;
  renderHistory(elements.historyBody, state.history);
  renderGameAnalysis(elements.analysisRoot, {
    history: state.history,
    answer: state.answer,
    range: state.range,
    isComplete: state.isComplete,
  });
}

function changeMode(mode) {
  state = createGameState(mode, state.range);
  clearSuccessEffect();
  elements.inputHelp.textContent = "";
  elements.feedback.textContent = "已切換模式，請開始第一輪猜測。";
  render();
  elements.guessInput.focus();
}

function resetGame() {
  state = createGameState(state.mode, state.range);
  clearSuccessEffect();
  elements.inputHelp.textContent = "";
  elements.feedback.textContent = "新遊戲已開始。";
  render();
  elements.guessInput.value = "";
  elements.guessInput.focus();
}

function submitGuess(event) {
  event.preventDefault();
  if (state.isComplete) return;

  const parsed = parseGuess(elements.guessInput.value, state.range);
  if (!parsed.ok) {
    elements.inputHelp.textContent = parsed.message;
    return;
  }

  const previousGuess = state.history.at(-1)?.guess;
  const result = scoreGuess({
    mode: state.mode,
    guess: parsed.guess,
    answer: state.answer,
    previousGuess,
    range: state.range,
  });

  const round = state.history.length + 1;
  const record = {
    round,
    guess: parsed.guess,
    feedback: result.feedback,
    score: result.score,
    isCorrect: result.isCorrect,
  };

  state.history = [...state.history, record];
  state.isComplete = result.isCorrect;
  elements.inputHelp.textContent = "";
  elements.guessInput.value = "";
  render();

  const message = buildFeedbackMessage({
    mode: state.mode,
    result,
    guess: parsed.guess,
    round,
  });

  elements.guessButton.disabled = true;
  playThinkingSound();
  streamText(elements.feedback, message, () => {
    playFeedbackSound(result.isCorrect);
    if (result.isCorrect) triggerSuccessEffect();
    elements.guessButton.disabled = state.isComplete;
    elements.guessInput.disabled = state.isComplete;
    if (!state.isComplete) elements.guessInput.focus();
  });
}

function downloadHistory(format) {
  const content = format === "json" ? toJson() : toCsv();
  const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ai-monkey-history.${format}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function toJson() {
  return JSON.stringify(
    {
      mode: state.mode,
      range: state.range,
      answer: state.isComplete ? state.answer : null,
      history: state.history,
    },
    null,
    2,
  );
}

function toCsv() {
  const rows = [["Round", "Guess", "Feedback", "Score"]];
  state.history.forEach((item) => rows.push([item.round, item.guess, item.feedback, item.score ?? ""]));
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function csvCell(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function applyRange(event) {
  event.preventDefault();
  const parsed = parseRange(elements.rangeMinInput.value, elements.rangeMaxInput.value);

  if (!parsed.ok) {
    elements.rangeHelp.textContent = parsed.message;
    return;
  }

  state = createGameState(state.mode, parsed.range);
  clearSuccessEffect();
  elements.rangeHelp.textContent = "";
  elements.inputHelp.textContent = "";
  elements.feedback.textContent = `範圍已改成 ${formatRange(state.range)}，新遊戲已開始。`;
  elements.guessInput.value = "";
  render();
  elements.guessInput.focus();
}

function triggerSuccessEffect() {
  document.body.classList.remove("success-celebration");
  void document.body.offsetWidth;
  document.body.classList.add("success-celebration");
  window.setTimeout(clearSuccessEffect, 3000);
}

function clearSuccessEffect() {
  document.body.classList.remove("success-celebration");
}

elements.guessForm.addEventListener("submit", submitGuess);
elements.rangeForm.addEventListener("submit", applyRange);
elements.resetButton.addEventListener("click", resetGame);
elements.exportJsonButton.addEventListener("click", () => downloadHistory("json"));
elements.exportCsvButton.addEventListener("click", () => downloadHistory("csv"));

elements.feedback.textContent = "請選擇模式並輸入第一個數字。";
render();
