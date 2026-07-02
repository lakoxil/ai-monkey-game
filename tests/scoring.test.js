import assert from "node:assert/strict";
import test from "node:test";
import { MODES, scoreGuess, scoreMode1, scoreMode2, scoreMode3 } from "../lib/scoring.js";
import { parseGuess } from "../lib/game.js";

test("Mode 1 returns direction feedback", () => {
  assert.deepEqual(scoreMode1(40, 50), { feedback: "太小", score: null, isCorrect: false });
  assert.deepEqual(scoreMode1(60, 50), { feedback: "太大", score: null, isCorrect: false });
  assert.deepEqual(scoreMode1(50, 50), { feedback: "猜中了", score: null, isCorrect: true });
});

test("Mode 2 uses 100 minus absolute distance", () => {
  assert.equal(scoreMode2(86, 100).score, 86);
  assert.equal(scoreMode2(50, 50).score, 100);
});

test("Mode 3 uses five-point buckets plus direction adjustment", () => {
  assert.equal(scoreMode3(77, 100).score, 75);
  assert.equal(scoreMode3(80, 100, 70).score, 81);
  assert.equal(scoreMode3(60, 100, 70).score, 59);
  assert.equal(scoreMode3(50, 50, 80).score, 100);
});

test("scoreGuess dispatches by mode", () => {
  assert.equal(scoreGuess({ mode: MODES.MODE_2, guess: 90, answer: 100 }).score, 90);
  assert.equal(scoreGuess({ mode: MODES.MODE_3, guess: 90, answer: 100 }).score, 90);
});

test("parseGuess accepts only integers inside 1-100", () => {
  assert.deepEqual(parseGuess("1"), { ok: true, guess: 1 });
  assert.equal(parseGuess("0").ok, false);
  assert.equal(parseGuess("101").ok, false);
  assert.equal(parseGuess("10.5").ok, false);
});
