import assert from "node:assert/strict";
import test from "node:test";
import { MODES, scoreGuess, scoreMode1, scoreMode2, scoreMode3 } from "../lib/scoring.js";
import { parseGuess, parseRange } from "../lib/game.js";

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

test("parseGuess accepts decimals inside the configured range", () => {
  assert.deepEqual(parseGuess("1"), { ok: true, guess: 1 });
  assert.deepEqual(parseGuess("-1.5", { min: -2, max: 2, precision: 1 }), { ok: true, guess: -1.5 });
  assert.deepEqual(parseGuess("10.5"), { ok: true, guess: 10.5 });
  assert.equal(parseGuess("-2.1", { min: -2, max: 2, precision: 1 }).ok, false);
  assert.equal(parseGuess("101").ok, false);
});

test("parseRange accepts negative and decimal ranges", () => {
  assert.deepEqual(parseRange("-5.5", "10.25"), {
    ok: true,
    range: { min: -5.5, max: 10.25, precision: 2 },
  });
  assert.equal(parseRange("10", "10").ok, false);
  assert.equal(parseRange("abc", "10").ok, false);
});

test("scores scale to the configured range and stay integer 0-100", () => {
  const largeRange = { min: 1, max: 1000, precision: 0 };
  assert.equal(scoreMode2(500, 1000, largeRange).score, 50);
  assert.equal(scoreMode2(1, 1000, largeRange).score, 0);

  const decimalRange = { min: -1, max: 1, precision: 1 };
  assert.equal(scoreMode2(0.5, 1, decimalRange).score, 75);
  assert.equal(scoreMode3(-1, 1, 0, decimalRange).score, 0);
});
