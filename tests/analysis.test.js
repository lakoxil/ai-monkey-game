import assert from "node:assert/strict";
import test from "node:test";
import { buildGameAnalysis } from "../lib/analysis.js";

test("buildGameAnalysis summarizes a learning path", () => {
  const analysis = buildGameAnalysis(
    [
      { round: 1, guess: 20, score: 52, isCorrect: false },
      { round: 2, guess: 60, score: 92, isCorrect: false },
      { round: 3, guess: 67, score: 100, isCorrect: true },
    ],
    67,
  );

  assert.deepEqual(analysis.rounds, [1, 2, 3]);
  assert.deepEqual(analysis.guesses, [20, 60, 67]);
  assert.deepEqual(analysis.distances, [47, 7, 0]);
  assert.equal(analysis.improvementCount, 2);
  assert.equal(analysis.improvementRate, 100);
  assert.equal(analysis.highestScore, 100);
  assert.deepEqual(analysis.bestBeforeCorrect, { guess: 60, distance: 7 });
});

test("buildGameAnalysis handles Mode 1 without scores", () => {
  const analysis = buildGameAnalysis(
    [
      { round: 1, guess: 50, score: null, isCorrect: false },
      { round: 2, guess: 75, score: null, isCorrect: true },
    ],
    75,
  );

  assert.deepEqual(analysis.scores, [null, null]);
  assert.deepEqual(analysis.visibleScores, []);
  assert.equal(analysis.highestScore, null);
});
