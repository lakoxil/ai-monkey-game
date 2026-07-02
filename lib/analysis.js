export function buildGameAnalysis(history, answer) {
  const rounds = history.map((item) => item.round);
  const guesses = history.map((item) => item.guess);
  const distances = history.map((item) => Math.abs(item.guess - answer));
  const scores = history.map((item) => (Number.isFinite(item.score) ? item.score : null));
  const visibleScores = scores.filter((score) => score !== null);
  const improvementCount = distances.reduce((count, distance, index) => {
    if (index === 0) return count;
    return distance < distances[index - 1] ? count + 1 : count;
  }, 0);
  const bestBeforeCorrect = history
    .filter((item) => !item.isCorrect)
    .map((item) => ({
      guess: item.guess,
      distance: Math.abs(item.guess - answer),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  return {
    answer,
    rounds,
    guesses,
    distances,
    scores,
    visibleScores,
    totalRounds: history.length,
    improvementCount,
    improvementRate: history.length > 1 ? Math.round((improvementCount / (history.length - 1)) * 100) : 0,
    highestScore: visibleScores.length ? Math.max(...visibleScores) : null,
    bestBeforeCorrect: bestBeforeCorrect ?? null,
    observation: buildObservation(history.length, improvementCount),
  };
}

function buildObservation(totalRounds, improvementCount) {
  if (totalRounds <= 1) {
    return "這一局第一輪就猜中，代表第一次 Action 直接找到答案。";
  }

  if (improvementCount === totalRounds - 1) {
    return "這一局每一次修正都比上一輪更接近答案，學習路徑非常清楚。";
  }

  if (improvementCount >= Math.ceil((totalRounds - 1) / 2)) {
    return "這一局多數修正都讓猜測更接近答案，代表玩家有參考前面的回饋調整策略。";
  }

  return "這一局有一些探索與試錯，適合回頭觀察哪些回饋真正改變了下一次猜測。";
}
