function allVideos() {
  return Array.from(document.querySelectorAll("video"));
}

function videosForTarget(target) {
  if (!target) {
    return allVideos();
  }

  const scope = document.querySelector(`[data-video-scope="${target}"]`);
  return scope ? Array.from(scope.querySelectorAll("video")) : [];
}

function alignVideoStarts(targetVideos = allVideos()) {
  targetVideos.forEach((video) => {
    video.muted = true;

    try {
      video.currentTime = 0;
    } catch {
      // Metadata may not be ready yet; play() will still start from the beginning.
    }
  });
}

async function playAllVideos(targetVideos = allVideos()) {
  alignVideoStarts(targetVideos);
  await Promise.allSettled(targetVideos.map((video) => video.play()));
}

function pauseAllVideos(targetVideos = allVideos()) {
  targetVideos.forEach((video) => video.pause());
}

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest("[data-video-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.videoAction;
  const targetVideos = videosForTarget(button.dataset.videoTarget);

  if (action === "play") {
    playAllVideos(targetVideos);
    return;
  }

  if (action === "pause") {
    pauseAllVideos(targetVideos);
  }
});

const BAR_CHART_TASKS = {
  slalom: {
    title: "Slalom",
    metric: "Success Rate (%)",
    unit: "%",
    yMax: 40,
    tick: 10,
    note: "Simulation VLA adaptation. Values show mean success rate with error bars.",
    rows: [
      { method: "VLA", group: "VLA", value: 15.67, error: 2.1, color: "#ced4da" },
      { method: "DDPM", group: "Baseline", value: 10.7, error: 1.2, color: "#d9ed92" },
      { method: "CSA", group: "Baseline", value: 15.3, error: 1.2, color: "#95d5b2" },
      { method: "FPAS", group: "GLOVES", value: 16.0, error: 2.12, color: "#90caf9" },
      { method: "FEEG", group: "GLOVES", value: 16.67, error: 2.15, color: "#64b5f6", detail: "FEEG (w/o OOD)" },
      { method: "FEEG†", group: "GLOVES", value: 15.67, error: 2.1, color: "#42a5f5", detail: "FEEG (w/ OOD)" },
      { method: "IFAE", group: "GLOVES", value: 30.0, error: 2.6, color: "#2196f3", detail: "IFAE (w/o OOD)" },
      { method: "IFAE†", group: "GLOVES", value: 24.7, error: 2.4, color: "#1e88e5", detail: "IFAE (w/ OOD)" },
    ],
  },
  can: {
    title: "Can",
    metric: "Success Rate (%)",
    unit: "%",
    yMax: 55,
    tick: 10,
    note: "Simulation VLA adaptation. Values show mean success rate with error bars.",
    rows: [
      { method: "VLA", group: "VLA", value: 15.67, error: 2.1, color: "#ced4da" },
      { method: "DDPM", group: "Baseline", value: 32.8, error: 4.7, color: "#d9ed92" },
      { method: "CSA", group: "Baseline", value: 22.2, error: 4.4, color: "#95d5b2" },
      { method: "FPAS", group: "GLOVES", value: 35.62, error: 2.68, color: "#90caf9" },
      { method: "FEEG", group: "GLOVES", value: 39.38, error: 2.77, color: "#64b5f6", detail: "FEEG (w/o OOD)" },
      { method: "FEEG†", group: "GLOVES", value: 41.25, error: 2.78, color: "#42a5f5", detail: "FEEG (w/ OOD)" },
      { method: "IFAE", group: "GLOVES", value: 42.5, error: 5.2, color: "#2196f3", detail: "IFAE (w/o OOD)" },
      { method: "IFAE†", group: "GLOVES", value: 44.7, error: 5.0, color: "#1e88e5", detail: "IFAE (w/ OOD)" },
    ],
  },
  charger: {
    title: "Real Robot: Charger",
    metric: "Success Count",
    unit: "",
    yMax: 45,
    tick: 5,
    note: "Real-robot charger insertion. Counts are successes over 40 trials.",
    rows: [
      { method: "VLA", group: "VLA", value: 18, color: "#ced4da", detail: "18 / 40" },
      { method: "CSA", group: "Baseline", value: 21, color: "#ffc8dd", detail: "21 / 40" },
      { method: "FPAS", group: "GLOVES", value: 22, color: "#e0aaff", detail: "22 / 40" },
      { method: "FEEG", group: "GLOVES", value: 40, color: "#c77dff", detail: "40 / 40" },
      { method: "IFAE", group: "GLOVES", value: 27, color: "#9d4edd", detail: "27 / 40" },
    ],
  },
  cup: {
    title: "Real Robot: Cup Serve",
    metric: "Success Count",
    unit: "",
    yMax: 25,
    tick: 5,
    note: "Real-robot cup serving. Counts are successes over 30 trials.",
    rows: [
      { method: "VLA", group: "VLA", value: 2, color: "#ced4da", detail: "2 / 30" },
      { method: "CSA", group: "Baseline", value: 4, color: "#ffc8dd", detail: "4 / 30" },
      { method: "FPAS", group: "GLOVES", value: 17, color: "#e0aaff", detail: "17 / 30" },
      { method: "FEEG", group: "GLOVES", value: 22, color: "#c77dff", detail: "22 / 30" },
      { method: "IFAE", group: "GLOVES", value: 16, color: "#9d4edd", detail: "16 / 30" },
    ],
  },
};

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(name, attrs = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });
  return element;
}

function formatChartValue(row, task) {
  if (task.unit === "%") {
    return `${row.value.toFixed(row.value % 1 === 0 ? 0 : 2)}%`;
  }

  return `${Math.round(row.value)}`;
}

function updateChartSelection(row, task) {
  const selection = document.getElementById("chart-selection");
  if (!selection) {
    return;
  }

  const errorText =
    typeof row.error === "number" ? ` ± ${row.error.toFixed(2)}${task.unit}` : "";
  const detailText = row.detail ? `<span>${row.detail}</span>` : `<span>${row.group}</span>`;
  selection.innerHTML = `
    <strong>${row.method}</strong>
    <span>${task.metric}: ${formatChartValue(row, task)}${errorText}</span>
    ${detailText}
  `;
}

function renderLegend(task) {
  const legend = document.getElementById("chart-legend");
  if (!legend) {
    return;
  }

  const groups = [];
  task.rows.forEach((row) => {
    if (!groups.some((entry) => entry.group === row.group)) {
      groups.push(row);
    }
  });

  legend.innerHTML = groups
    .map(
      (row) => `
        <div class="legend-item">
          <span class="legend-swatch" style="background:${row.color}"></span>
          <span>${row.group}</span>
        </div>
      `
    )
    .join("");
}

function renderAssistiveChart(taskId = "slalom") {
  const task = BAR_CHART_TASKS[taskId];
  const svg = document.getElementById("assistive-chart");
  const title = document.getElementById("chart-title");
  const description = document.getElementById("chart-description");

  if (!task || !svg || !title || !description) {
    return;
  }

  const width = 900;
  const height = 420;
  const margin = { top: 28, right: 24, bottom: 72, left: 70 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const yMax = task.yMax;
  const yScale = (value) => margin.top + plotHeight - (value / yMax) * plotHeight;

  svg.innerHTML = "";
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("aria-label", `${task.title} ${task.metric} bar chart`);
  title.textContent = task.title;
  description.textContent = task.note;

  const axisGroup = svgEl("g", { class: "chart-axis" });
  const plotBottom = margin.top + plotHeight;
  const plotLeft = margin.left;
  const plotRight = margin.left + plotWidth;

  axisGroup.appendChild(svgEl("line", { x1: plotLeft, y1: plotBottom, x2: plotRight, y2: plotBottom, stroke: "#bfc7bd", "stroke-width": 1 }));
  axisGroup.appendChild(svgEl("line", { x1: plotLeft, y1: margin.top, x2: plotLeft, y2: plotBottom, stroke: "#bfc7bd", "stroke-width": 1 }));

  for (let tick = 0; tick <= yMax; tick += task.tick) {
    const y = yScale(tick);
    axisGroup.appendChild(svgEl("line", { x1: plotLeft, y1: y, x2: plotRight, y2: y, stroke: "#eeeeee", "stroke-width": 1 }));
    const label = svgEl("text", { x: plotLeft - 10, y: y + 4, "text-anchor": "end", "font-size": 12 });
    label.textContent = String(tick);
    axisGroup.appendChild(label);
  }

  const metricLabel = svgEl("text", {
    x: 18,
    y: margin.top + plotHeight / 2,
    transform: `rotate(-90 18 ${margin.top + plotHeight / 2})`,
    "text-anchor": "middle",
    "font-size": 13,
    fill: "#646860",
  });
  metricLabel.textContent = task.metric;
  axisGroup.appendChild(metricLabel);
  svg.appendChild(axisGroup);

  const rows = task.rows;
  const step = plotWidth / rows.length;
  const barWidth = Math.min(58, step * 0.62);
  const barGroup = svgEl("g");

  rows.forEach((row, index) => {
    const x = margin.left + step * index + step / 2 - barWidth / 2;
    const y = yScale(row.value);
    const barHeight = plotBottom - y;
    const rect = svgEl("rect", {
      class: "chart-bar",
      x,
      y,
      width: barWidth,
      height: Math.max(0, barHeight),
      rx: 3,
      fill: row.color,
      tabindex: 0,
      role: "button",
      "aria-label": `${row.method}: ${formatChartValue(row, task)}`,
    });

    ["mouseenter", "focus", "click"].forEach((eventName) => {
      rect.addEventListener(eventName, () => updateChartSelection(row, task));
    });
    barGroup.appendChild(rect);

    if (typeof row.error === "number") {
      const errorTop = yScale(Math.min(yMax, row.value + row.error));
      const errorBottom = yScale(Math.max(0, row.value - row.error));
      const center = x + barWidth / 2;
      barGroup.appendChild(svgEl("line", { x1: center, y1: errorTop, x2: center, y2: errorBottom, stroke: "#222222", "stroke-width": 1.4 }));
      barGroup.appendChild(svgEl("line", { x1: center - 6, y1: errorTop, x2: center + 6, y2: errorTop, stroke: "#222222", "stroke-width": 1.4 }));
      barGroup.appendChild(svgEl("line", { x1: center - 6, y1: errorBottom, x2: center + 6, y2: errorBottom, stroke: "#222222", "stroke-width": 1.4 }));
    }

    const valueLabel = svgEl("text", {
      class: "chart-value",
      x: x + barWidth / 2,
      y: yScale(row.value + (row.error || 0)) - 8,
      "text-anchor": "middle",
    });
    valueLabel.textContent = formatChartValue(row, task);
    barGroup.appendChild(valueLabel);

    const methodLabel = svgEl("text", {
      class: "chart-label",
      x: x + barWidth / 2,
      y: plotBottom + 24,
      "text-anchor": "middle",
    });
    methodLabel.textContent = row.method;
    barGroup.appendChild(methodLabel);
  });

  svg.appendChild(barGroup);
  updateChartSelection(rows[0], task);
  renderLegend(task);
}

function initAssistiveChart() {
  const tabButtons = document.querySelectorAll("[data-chart-task]");
  if (!tabButtons.length) {
    return;
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((tab) => {
        tab.classList.remove("active");
        tab.setAttribute("aria-selected", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");
      renderAssistiveChart(button.dataset.chartTask);
    });
  });

  renderAssistiveChart("slalom");
}

initAssistiveChart();

const WRAPPER_METHODS = [
  { key: "DDPM", group: "Baseline", color: "#d9ed92" },
  { key: "CSA", group: "Baseline", color: "#95d5b2" },
  { key: "FPAS", group: "GLOVES", color: "#90caf9" },
  { key: "FEEG", group: "GLOVES", color: "#64b5f6" },
  { key: "FEEG†", group: "GLOVES", color: "#42a5f5" },
  { key: "IFAE", group: "GLOVES", color: "#2196f3" },
  { key: "IFAE†", group: "GLOVES", color: "#1e88e5" },
];

const WRAPPER_RESULTS = [
  { task: "Slalom", agent: "laggy", source: 38.7, values: { DDPM: 15.3, CSA: 43.6, FPAS: 41.0, FEEG: 31.7, "FEEG†": 31.0, IFAE: 39.4, "IFAE†": 39.3 } },
  { task: "Slalom", agent: "noised", source: 40.0, values: { DDPM: 33.3, CSA: 42.7, FPAS: 46.0, FEEG: 46.7, "FEEG†": 45.7, IFAE: 53.7, "IFAE†": 53.6 } },
  { task: "Slalom", agent: "slow", source: 55.7, values: { DDPM: 35.7, CSA: 42.3, FPAS: 60.0, FEEG: 49.3, "FEEG†": 49.3, IFAE: 74.6, "IFAE†": 74.0 } },
  { task: "Slalom", agent: "shift", source: 28.0, values: { DDPM: 15.0, CSA: 69.7, FPAS: 47.7, FEEG: 40.0, "FEEG†": 36.7, IFAE: 65.0, "IFAE†": 70.0 } },
  { task: "Can", agent: "laggy", source: 48.1, values: { DDPM: 53.8, CSA: 51.5, FPAS: 53.8, FEEG: 55.0, "FEEG†": 53.1, IFAE: 66.6, "IFAE†": 81.9 } },
  { task: "Can", agent: "noised", source: 50.9, values: { DDPM: 1.6, CSA: 60.3, FPAS: 48.4, FEEG: 52.5, "FEEG†": 50.6, IFAE: 55.9, "IFAE†": 55.6 } },
  { task: "Can", agent: "slow", source: 23.1, values: { DDPM: 62.2, CSA: 70.9, FPAS: 29.4, FEEG: 62.8, "FEEG†": 60.9, IFAE: 72.2, "IFAE†": 71.6 } },
  { task: "Can", agent: "shift", source: 54.7, values: { DDPM: 80.3, CSA: 52.5, FPAS: 57.2, FEEG: 93.4, "FEEG†": 92.2, IFAE: 56.9, "IFAE†": 58.1 } },
  { task: "Keypad", agent: "laggy", source: 54.0, values: { DDPM: 57.3, CSA: 64.0, FPAS: 62.3, FEEG: 61.3, "FEEG†": 62.3, IFAE: 82.0, "IFAE†": 81.7 } },
  { task: "Keypad", agent: "noised", source: 34.7, values: { DDPM: 47.7, CSA: 25.7, FPAS: 36.0, FEEG: 51.3, "FEEG†": 50.7, IFAE: 46.0, "IFAE†": 44.8 } },
  { task: "Keypad", agent: "slow", source: 52.7, values: { DDPM: 81.3, CSA: 92.0, FPAS: 94.0, FEEG: 95.0, "FEEG†": 96.0, IFAE: 79.3, "IFAE†": 88.0 } },
  { task: "Keypad", agent: "shift", source: 52.7, values: { DDPM: 66.0, CSA: 68.0, FPAS: 68.3, FEEG: 82.0, "FEEG†": 80.7, IFAE: 61.4, "IFAE†": 57.3 } },
  { task: "Charger", agent: "laggy", source: 38.5, values: { DDPM: 0.0, CSA: 40.0, FPAS: 41.0, FEEG: 39.0, "FEEG†": 41.0, IFAE: 40.0, "IFAE†": 44.5 } },
  { task: "Charger", agent: "noised", source: 33.0, values: { DDPM: 0.0, CSA: 48.0, FPAS: 61.5, FEEG: 68.5, "FEEG†": 73.0, IFAE: 65.5, "IFAE†": 66.4 } },
  { task: "Charger", agent: "slow", source: 45.0, values: { DDPM: 0.0, CSA: 49.9, FPAS: 44.5, FEEG: 46.0, "FEEG†": 47.5, IFAE: 46.0, "IFAE†": 44.5 } },
  { task: "Charger", agent: "shift", source: 36.0, values: { DDPM: 0.0, CSA: 60.5, FPAS: 49.0, FEEG: 68.0, "FEEG†": 64.5, IFAE: 36.0, "IFAE†": 40.4 } },
];

function rankWrapperCondition(condition) {
  return WRAPPER_METHODS.map((method) => ({
    ...method,
    value: condition.values[method.key],
    gain: condition.values[method.key] - condition.source,
  }))
    .sort((a, b) => b.value - a.value)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function filteredWrapperResults() {
  const taskValue = document.getElementById("wrapper-task-filter")?.value || "all";
  const agentValue = document.getElementById("wrapper-agent-filter")?.value || "all";

  return WRAPPER_RESULTS.filter((condition) => {
    const taskMatch = taskValue === "all" || condition.task === taskValue;
    const agentMatch = agentValue === "all" || condition.agent === agentValue;
    return taskMatch && agentMatch;
  });
}

function summarizeWrapperMethods(conditions) {
  const stats = new Map();
  WRAPPER_METHODS.forEach((method) => {
    stats.set(method.key, {
      ...method,
      top1: 0,
      top2: 0,
      top3: 0,
      rankTotal: 0,
      successTotal: 0,
      gainTotal: 0,
      count: 0,
    });
  });

  conditions.forEach((condition) => {
    rankWrapperCondition(condition).forEach((row) => {
      const methodStats = stats.get(row.key);
      methodStats.count += 1;
      methodStats.rankTotal += row.rank;
      methodStats.successTotal += row.value;
      methodStats.gainTotal += row.gain;
      if (row.rank === 1) methodStats.top1 += 1;
      if (row.rank <= 2) methodStats.top2 += 1;
      if (row.rank <= 3) methodStats.top3 += 1;
    });
  });

  return Array.from(stats.values())
    .map((method) => ({
      ...method,
      avgRank: method.count ? method.rankTotal / method.count : 0,
      avgSuccess: method.count ? method.successTotal / method.count : 0,
      avgGain: method.count ? method.gainTotal / method.count : 0,
    }))
    .sort((a, b) => b.top1 - a.top1 || b.top3 - a.top3 || a.avgRank - b.avgRank);
}

function renderWrapperSummary(conditions, summaries) {
  const summary = document.getElementById("wrapper-summary");
  if (!summary) return;

  const glovesWins = conditions.filter((condition) => rankWrapperCondition(condition)[0].group === "GLOVES").length;
  const glovesTop3 = conditions.filter((condition) =>
    rankWrapperCondition(condition).slice(0, 3).some((row) => row.group === "GLOVES")
  ).length;
  const bestMethod = summaries[0];

  summary.innerHTML = `
    <div class="summary-tile">
      <strong>${glovesWins}/${conditions.length}</strong>
      <span>conditions won by GLOVES</span>
    </div>
    <div class="summary-tile">
      <strong>${glovesTop3}/${conditions.length}</strong>
      <span>conditions with GLOVES in top 3</span>
    </div>
    <div class="summary-tile">
      <strong>${bestMethod ? bestMethod.key : "-"}</strong>
      <span>best aggregate method</span>
    </div>
  `;
}

function renderWrapperLeaderboard() {
  const tbody = document.getElementById("wrapper-leaderboard");
  const conditionsEl = document.getElementById("wrapper-conditions");
  if (!tbody || !conditionsEl) return;

  const conditions = filteredWrapperResults();
  const summaries = summarizeWrapperMethods(conditions);

  renderWrapperSummary(conditions, summaries);

  tbody.innerHTML = summaries
    .map(
      (method) => `
        <tr>
          <td>
            <span class="method-pill">
              <span class="method-dot" style="background:${method.color}"></span>
              <span>
                ${method.key}
                <span class="group-label">${method.group}</span>
              </span>
            </span>
          </td>
          <td>${method.top1}</td>
          <td>${method.top2}</td>
          <td>${method.top3}</td>
          <td>${method.avgRank.toFixed(2)}</td>
          <td>${method.avgSuccess.toFixed(1)}%</td>
          <td>${method.avgGain >= 0 ? "+" : ""}${method.avgGain.toFixed(1)}%</td>
        </tr>
      `
    )
    .join("");

  conditionsEl.innerHTML = conditions
    .map((condition) => {
      const topRows = rankWrapperCondition(condition).slice(0, 3);
      return `
        <div class="condition-row">
          <div class="condition-title">
            <span>${condition.task}</span>
            <span>${condition.agent}</span>
          </div>
          <div class="condition-source">agent: ${condition.source.toFixed(1)}%</div>
          <div class="rank-list">
            ${topRows
              .map(
                (row) => `
                  <div class="rank-item">
                    <span class="rank-medal">#${row.rank}</span>
                    <span class="method-pill">
                      <span class="method-dot" style="background:${row.color}"></span>
                      <span>${row.key}</span>
                    </span>
                    <span>${row.value.toFixed(1)}%</span>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      `;
    })
    .join("");
}

function initWrapperLeaderboard() {
  const taskFilter = document.getElementById("wrapper-task-filter");
  const agentFilter = document.getElementById("wrapper-agent-filter");
  if (!taskFilter || !agentFilter) return;

  [taskFilter, agentFilter].forEach((filter) => {
    filter.addEventListener("change", renderWrapperLeaderboard);
  });
  renderWrapperLeaderboard();
}

initWrapperLeaderboard();

const SIMULATION_DEFAULT_METHODS = ["fpas", "feeg", "ifae"];

const simulationState = {
  task: "slalom",
  base: "vla",
  methods: new Set(SIMULATION_DEFAULT_METHODS),
  activeVideos: new Map(),
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function simulationData() {
  return window.SIMULATION_SHOWCASE;
}

function simulationTaskEntries(taskId = simulationState.task) {
  return simulationData()?.entries?.[taskId] || {};
}

function simulationBaseEntry(taskId = simulationState.task, baseId = simulationState.base) {
  return simulationTaskEntries(taskId)[baseId] || null;
}

function simulationLabel(list, id) {
  return list.find((entry) => entry.id === id)?.label || id;
}

function availableSimulationBases(taskId = simulationState.task) {
  const entries = simulationTaskEntries(taskId);
  return (simulationData()?.bases || []).filter((base) => Boolean(entries[base.id]));
}

function isSimulationMethodAvailable(methodId) {
  const entry = simulationBaseEntry();
  return Boolean(entry?.[methodId]?.videos?.length);
}

function normalizeSimulationSelection() {
  const data = simulationData();
  if (!data) {
    return;
  }

  const taskIds = data.tasks.map((task) => task.id);
  if (!taskIds.includes(simulationState.task)) {
    simulationState.task = taskIds[0];
  }

  const bases = availableSimulationBases();
  if (!bases.some((base) => base.id === simulationState.base)) {
    simulationState.base = bases[0]?.id || "";
  }

  const availableMethods = data.methods
    .map((method) => method.id)
    .filter((methodId) => isSimulationMethodAvailable(methodId));
  simulationState.methods = new Set(
    Array.from(simulationState.methods).filter((methodId) => availableMethods.includes(methodId))
  );

  if (!simulationState.methods.size) {
    SIMULATION_DEFAULT_METHODS.forEach((methodId) => {
      if (availableMethods.includes(methodId)) {
        simulationState.methods.add(methodId);
      }
    });
  }
}

function renderSimulationButton(container, item, options) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = item.label;
  button.disabled = Boolean(options.disabled);
  if (options.multi) {
    button.setAttribute("aria-pressed", String(options.active));
  } else {
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(options.active));
  }
  button.addEventListener("click", options.onClick);
  container.appendChild(button);
}

function renderSimulationControls() {
  const data = simulationData();
  const taskControls = document.getElementById("simulation-task-controls");
  const baseControls = document.getElementById("simulation-base-controls");
  const methodControls = document.getElementById("simulation-method-controls");
  if (!data || !taskControls || !baseControls || !methodControls) {
    return;
  }

  taskControls.innerHTML = "";
  data.tasks.forEach((task) => {
    renderSimulationButton(taskControls, task, {
      active: task.id === simulationState.task,
      onClick: () => {
        simulationState.task = task.id;
        normalizeSimulationSelection();
        renderSimulationShowcase();
      },
    });
  });

  baseControls.innerHTML = "";
  data.bases.forEach((base) => {
    const disabled = !simulationTaskEntries()[base.id];
    renderSimulationButton(baseControls, base, {
      active: base.id === simulationState.base,
      disabled,
      onClick: () => {
        if (disabled) return;
        simulationState.base = base.id;
        normalizeSimulationSelection();
        renderSimulationShowcase();
      },
    });
  });

  methodControls.innerHTML = "";
  data.methods.forEach((method) => {
    const disabled = !isSimulationMethodAvailable(method.id);
    renderSimulationButton(methodControls, method, {
      active: simulationState.methods.has(method.id),
      disabled,
      multi: true,
      onClick: () => {
        if (disabled) return;
        if (simulationState.methods.has(method.id)) {
          simulationState.methods.delete(method.id);
        } else {
          simulationState.methods.add(method.id);
        }
        renderSimulationShowcase();
      },
    });
  });
}

function simulationOutcomeSummary(videos) {
  const successes = videos.filter((video) => video.outcome === "success").length;
  const failures = videos.length - successes;
  if (!failures) {
    return `${successes} success videos`;
  }
  if (!successes) {
    return `${failures} failure videos`;
  }
  return `${successes} success, ${failures} failure`;
}

function simulationCategoryHtml(category) {
  const activeIndex = Math.min(
    simulationState.activeVideos.get(category.id) || 0,
    category.videos.length - 1
  );
  const video = category.videos[activeIndex];

  return `
    <article class="simulation-category" data-simulation-category="${escapeHtml(category.id)}">
      <header>
        <h4>${escapeHtml(category.label)}</h4>
        <p>${escapeHtml(simulationOutcomeSummary(category.videos))}</p>
      </header>
      <div class="simulation-canvas" data-simulation-outcome="${escapeHtml(video.outcome)}">
        <video
          src="${escapeHtml(video.src)}"
          controls
          muted
          playsinline
          preload="metadata"
        ></video>
      </div>
      <div class="simulation-browser">
        <button type="button" data-simulation-step="-1" aria-label="Previous rollout">‹</button>
        <span>${activeIndex + 1} / ${category.videos.length}</span>
        <button type="button" data-simulation-step="1" aria-label="Next rollout">›</button>
      </div>
      <div class="simulation-slide-buttons" aria-label="${escapeHtml(category.label)} rollouts">
        ${category.videos
          .map(
            (_, index) => `
              <button
                type="button"
                data-simulation-index="${index}"
                aria-label="Rollout ${index + 1}"
                aria-pressed="${index === activeIndex ? "true" : "false"}"
              >
                ${index + 1}
              </button>
            `
          )
          .join("")}
      </div>
      <p class="simulation-caption">${escapeHtml(video.caption)}</p>
    </article>
  `;
}

function renderSimulationShowcase() {
  const data = simulationData();
  const grid = document.getElementById("simulation-grid");
  const status = document.getElementById("simulation-status");
  if (!grid || !status) {
    return;
  }

  if (!data) {
    status.textContent = "Simulation manifest is not available.";
    grid.innerHTML = `<div class="simulation-empty">No simulation videos are available.</div>`;
    return;
  }

  normalizeSimulationSelection();
  renderSimulationControls();

  const entry = simulationBaseEntry();
  if (!entry?.base?.videos?.length) {
    status.textContent = "This task/base-policy combination is not available.";
    grid.innerHTML = `<div class="simulation-empty">Choose another task or base policy.</div>`;
    return;
  }

  const categories = [
    {
      id: "base",
      label: simulationLabel(data.bases, simulationState.base),
      videos: entry.base.videos,
    },
  ];

  data.methods.forEach((method) => {
    if (!simulationState.methods.has(method.id) || !entry[method.id]) {
      return;
    }
    categories.push({
      id: method.id,
      label: method.label,
      videos: entry[method.id].videos,
    });
  });

  const totalVideos = categories.reduce((total, category) => total + category.videos.length, 0);
  const missingOverlays = categories
    .flatMap((category) => category.videos)
    .filter((video) => video.overlayMissing).length;
  const overlayNote = missingOverlays
    ? ` ${missingOverlays} Slalom base-policy videos use raw footage while overlay is pending.`
    : "";
  status.textContent = `${simulationLabel(data.tasks, simulationState.task)} / ${simulationLabel(
    data.bases,
    simulationState.base
  )}: ${categories.length} categories, ${totalVideos} videos.${overlayNote}`;
  grid.innerHTML = categories.map(simulationCategoryHtml).join("");
  bindSimulationVideoFrames();
}

function initSimulationShowcase() {
  const grid = document.getElementById("simulation-grid");
  if (!grid) {
    return;
  }
  renderSimulationShowcase();
}

initSimulationShowcase();

function bindSimulationVideoFrames() {
  document.querySelectorAll(".simulation-canvas video").forEach((video) => {
    const canvas = video.closest(".simulation-canvas");
    if (!canvas) {
      return;
    }

    video.addEventListener("play", () => {
      canvas.classList.remove("is-ended");
    });
    video.addEventListener("seeking", () => {
      canvas.classList.remove("is-ended");
    });
    video.addEventListener("ended", () => {
      canvas.classList.add("is-ended");
    });
  });
}

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const categoryEl = event.target.closest("[data-simulation-category]");
  if (!categoryEl) {
    return;
  }

  const categoryId = categoryEl.dataset.simulationCategory;
  const currentIndex = simulationState.activeVideos.get(categoryId) || 0;
  const slideButton = event.target.closest("[data-simulation-index]");
  if (slideButton) {
    simulationState.activeVideos.set(categoryId, Number(slideButton.dataset.simulationIndex));
    renderSimulationShowcase();
    return;
  }

  const stepButton = event.target.closest("[data-simulation-step]");
  if (stepButton) {
    const videos = simulationBaseEntry()?.[categoryId]?.videos || [];
    if (!videos.length) {
      return;
    }
    const nextIndex =
      (currentIndex + Number(stepButton.dataset.simulationStep) + videos.length) % videos.length;
    simulationState.activeVideos.set(categoryId, nextIndex);
    renderSimulationShowcase();
  }
});

requestAnimationFrame(() => {
  playAllVideos(Array.from(document.querySelectorAll("video[autoplay]")));
});
