import { buildGameAnalysis } from "../lib/analysis.js";
import { formatNumber } from "../lib/game.js";
import { formatScore } from "../lib/scoring.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export function renderGameAnalysis(container, { history, answer, range, isComplete, endReason }) {
  container.innerHTML = "";

  if (!isComplete) {
    container.hidden = false;
    container.append(createPlaceholder());
    return;
  }

  const analysis = buildGameAnalysis(history, answer, range);
  container.hidden = false;

  container.append(createSummary(analysis, endReason));
  container.append(
    createLineChart({
      title: "距離答案折線圖",
      helpText: "線越往下，代表越接近答案。",
      rounds: analysis.rounds,
      values: analysis.distances,
      minValue: 0,
      maxValue: analysis.maxDistance,
      yLabel: "距離",
      lineColor: "#0f5c54",
      focusValue: 0,
    }),
  );

  container.append(
    createLineChart({
      title: "猜測位置折線圖",
      helpText: `灰色虛線是答案 ${formatNumber(answer)}，可以看出每一次 Action 在數線上的移動。`,
      rounds: analysis.rounds,
      values: analysis.guesses,
      minValue: analysis.range.min,
      maxValue: analysis.range.max,
      yLabel: "Guess",
      lineColor: "#b95f18",
      referenceValue: answer,
      referenceLabel: `答案 ${formatNumber(answer)}`,
      focusValue: answer,
    }),
  );

  if (analysis.visibleScores.length > 0) {
    container.append(
      createLineChart({
        title: "Score / Reward 折線圖",
        helpText: "線越往上，代表 Reward 越高。",
        rounds: analysis.rounds,
        values: analysis.scores,
        minValue: 0,
        maxValue: 100,
        yLabel: "Score",
        lineColor: "#3457a6",
        focusValue: 100,
        valueFormatter: formatScore,
      }),
    );
  }
}

function createPlaceholder() {
  const wrapper = document.createElement("section");
  wrapper.className = "analysis-section";
  wrapper.setAttribute("aria-labelledby", "analysis-title");

  const header = document.createElement("div");
  header.className = "section-row";

  const title = document.createElement("h2");
  title.id = "analysis-title";
  title.textContent = "本局學習分析";

  const hint = document.createElement("span");
  hint.textContent = "猜中或放棄後會自動產生折線圖。";

  header.append(title, hint);

  const message = document.createElement("p");
  message.className = "analysis-placeholder";
  message.textContent = "先完成這一局，或在有歷史紀錄後按放棄，系統會把你的 Action、Feedback、Reward 變成學習過程圖。";

  wrapper.append(header, message);
  return wrapper;
}

function createSummary(analysis, endReason) {
  const wrapper = document.createElement("section");
  wrapper.className = "analysis-section";
  wrapper.setAttribute("aria-labelledby", "analysis-title");

  const header = document.createElement("div");
  header.className = "section-row";

  const title = document.createElement("h2");
  title.id = "analysis-title";
  title.textContent = "本局學習分析";

  const hint = document.createElement("span");
  hint.textContent = endReason === "gave-up" ? "雖然本局放棄，資料仍然可以用來觀察策略。" : "從每一步看出如何靠回饋修正策略。";

  header.append(title, hint);

  const cards = document.createElement("div");
  cards.className = "analysis-summary";

  cards.append(
    createMetricCard(endReason === "gave-up" ? "放棄時回合" : "猜中回合", `${analysis.totalRounds} 輪`),
    createMetricCard("進步次數", `${analysis.improvementCount} 次`),
    createMetricCard("進步率", `${analysis.improvementRate}%`),
    createMetricCard("最高 Score", analysis.highestScore === null ? "Mode 1 不顯示" : formatScore(analysis.highestScore)),
  );

  const observation = document.createElement("p");
  observation.className = "analysis-observation";
  observation.textContent = endReason === "gave-up" ? `這一局在找到答案前先停止了。${analysis.observation}` : analysis.observation;

  wrapper.append(header, cards, observation);
  return wrapper;
}

function createMetricCard(label, value) {
  const card = document.createElement("div");
  card.className = "analysis-card";

  const labelNode = document.createElement("span");
  labelNode.textContent = label;

  const valueNode = document.createElement("strong");
  valueNode.textContent = value;

  card.append(labelNode, valueNode);
  return card;
}

function createLineChart({ title, helpText, rounds, values, minValue, maxValue, yLabel, lineColor, referenceValue, referenceLabel, focusValue, valueFormatter = formatNumber }) {
  const wrapper = document.createElement("section");
  wrapper.className = "chart-card";

  const heading = document.createElement("div");
  heading.className = "chart-heading";

  const titleNode = document.createElement("h3");
  titleNode.textContent = title;

  const help = document.createElement("p");
  help.textContent = helpText;

  heading.append(titleNode, help);

  const zoomControls = document.createElement("label");
  zoomControls.className = "chart-zoom";
  zoomControls.innerHTML = '<span>縱軸放大</span>';

  const zoomInput = document.createElement("input");
  zoomInput.type = "range";
  zoomInput.min = "1";
  zoomInput.max = "10";
  zoomInput.step = "1";
  zoomInput.value = "1";

  const zoomValue = document.createElement("strong");
  zoomValue.textContent = "1x";

  zoomControls.append(zoomInput, zoomValue);

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 680 260");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", title);

  const redraw = () => {
    const zoom = Number(zoomInput.value);
    const domain = zoomDomain({ minValue, maxValue, focusValue, zoom });
    zoomValue.textContent = `${zoom}x`;
    svg.textContent = "";
    drawChart(svg, {
      rounds,
      values,
      minValue: domain.minValue,
      maxValue: domain.maxValue,
      yLabel,
      lineColor,
      referenceValue,
      referenceLabel,
      valueFormatter,
    });
  };

  zoomInput.addEventListener("input", redraw);
  redraw();

  wrapper.append(heading, zoomControls, svg);
  return wrapper;
}

function drawChart(svg, options) {
  const width = 680;
  const height = 260;
  const padding = { top: 24, right: 28, bottom: 44, left: 54 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const validPoints = options.values
    .map((value, index) => ({ value, round: options.rounds[index], index }))
    .filter((point) => Number.isFinite(point.value));

  drawGrid(svg, { width, height, padding, chartWidth, chartHeight, ...options });

  if (Number.isFinite(options.referenceValue)) {
    drawReference(svg, { width, padding, chartWidth, chartHeight, ...options });
  }

  const points = validPoints.map((point) => ({
    ...point,
    x: xForIndex(point.index, options.rounds.length, padding.left, chartWidth),
    y: yForValue(point.value, options.minValue, options.maxValue, padding.top, chartHeight),
  }));

  const polyline = document.createElementNS(SVG_NS, "polyline");
  polyline.setAttribute("points", points.map((point) => `${point.x},${point.y}`).join(" "));
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke", options.lineColor);
  polyline.setAttribute("stroke-width", "4");
  polyline.setAttribute("stroke-linecap", "round");
  polyline.setAttribute("stroke-linejoin", "round");
  svg.append(polyline);

  points.forEach((point) => {
    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", String(point.x));
    circle.setAttribute("cy", String(point.y));
    circle.setAttribute("r", "6");
    circle.setAttribute("fill", "#ffffff");
    circle.setAttribute("stroke", options.lineColor);
    circle.setAttribute("stroke-width", "4");
    svg.append(circle);

    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("x", String(point.x));
    label.setAttribute("y", String(point.y - 12));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "chart-point-label");
    label.textContent = options.valueFormatter(point.value);
    svg.append(label);
  });
}

function drawGrid(svg, { width, height, padding, chartWidth, chartHeight, minValue, maxValue, yLabel, rounds, valueFormatter }) {
  const axis = document.createElementNS(SVG_NS, "path");
  axis.setAttribute("d", `M ${padding.left} ${padding.top} V ${height - padding.bottom} H ${width - padding.right}`);
  axis.setAttribute("fill", "none");
  axis.setAttribute("stroke", "#9aa4a0");
  axis.setAttribute("stroke-width", "2");
  svg.append(axis);

  [minValue, (minValue + maxValue) / 2, maxValue].forEach((tick) => {
    const y = yForValue(tick, minValue, maxValue, padding.top, chartHeight);
    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", String(padding.left));
    line.setAttribute("x2", String(width - padding.right));
    line.setAttribute("y1", String(y));
    line.setAttribute("y2", String(y));
    line.setAttribute("class", "chart-grid-line");
    svg.append(line);

    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("x", String(padding.left - 12));
    text.setAttribute("y", String(y + 5));
    text.setAttribute("text-anchor", "end");
    text.setAttribute("class", "chart-axis-label");
    text.textContent = valueFormatter(tick);
    svg.append(text);
  });

  rounds.forEach((round, index) => {
    const x = xForIndex(index, rounds.length, padding.left, chartWidth);
    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("x", String(x));
    text.setAttribute("y", String(height - 14));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("class", "chart-axis-label");
    text.textContent = `R${round}`;
    svg.append(text);
  });

  const yText = document.createElementNS(SVG_NS, "text");
  yText.setAttribute("x", "18");
  yText.setAttribute("y", "22");
  yText.setAttribute("class", "chart-axis-label");
  yText.textContent = yLabel;
  svg.append(yText);
}

function drawReference(svg, { width, padding, chartHeight, minValue, maxValue, referenceValue, referenceLabel }) {
  const y = yForValue(referenceValue, minValue, maxValue, padding.top, chartHeight);
  const line = document.createElementNS(SVG_NS, "line");
  line.setAttribute("x1", String(padding.left));
  line.setAttribute("x2", String(width - padding.right));
  line.setAttribute("y1", String(y));
  line.setAttribute("y2", String(y));
  line.setAttribute("class", "chart-reference-line");
  svg.append(line);

  const text = document.createElementNS(SVG_NS, "text");
  text.setAttribute("x", String(width - padding.right - 4));
  text.setAttribute("y", String(y - 8));
  text.setAttribute("text-anchor", "end");
  text.setAttribute("class", "chart-reference-label");
  text.textContent = referenceLabel;
  svg.append(text);
}

function xForIndex(index, length, left, chartWidth) {
  if (length <= 1) return left + chartWidth / 2;
  return left + (index / (length - 1)) * chartWidth;
}

function yForValue(value, minValue, maxValue, top, chartHeight) {
  const ratio = (value - minValue) / (maxValue - minValue);
  const y = top + chartHeight - ratio * chartHeight;
  return Math.max(top, Math.min(top + chartHeight, y));
}

function zoomDomain({ minValue, maxValue, focusValue, zoom }) {
  const fullRange = Math.max(maxValue - minValue, 1);
  if (zoom <= 1) return { minValue, maxValue };

  const center = Number.isFinite(focusValue) ? focusValue : (minValue + maxValue) / 2;
  const zoomedRange = fullRange / zoom;
  let nextMin = center - zoomedRange / 2;
  let nextMax = center + zoomedRange / 2;

  if (nextMin < minValue) {
    nextMax += minValue - nextMin;
    nextMin = minValue;
  }

  if (nextMax > maxValue) {
    nextMin -= nextMax - maxValue;
    nextMax = maxValue;
  }

  return {
    minValue: Math.max(minValue, nextMin),
    maxValue: Math.min(maxValue, nextMax),
  };
}
