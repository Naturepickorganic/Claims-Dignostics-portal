// ── benchmarkHelpers.js ─────────────────────────────────────────────────────
// Single source of truth utilities for benchmark data.
// All LOB-specific metric lookup, direction, and scoring lives here.
// Page4, Page5, AdminPage and AppContext all import from this file.
// ─────────────────────────────────────────────────────────────────────────────
import { BENCHMARK_DATA } from "./benchmarkData.js";

// Map carrier LOB IDs (Page2) → benchmarkData top-level keys
export const LOB_TO_BENCH_KEY = {
  pa:  "personal_lines",
  ph:  "personal_lines",
  ca:  "commercial_lines",
  cp:  "commercial_lines",
  wc:  "workers_compensation",
  gl:  "general_liability",
  bop: "commercial_lines",
};

// Display label for each bench key
export const BENCH_LOB_LABEL = {
  personal_lines:       "Personal Lines",
  commercial_lines:     "Commercial Lines",
  workers_compensation: "Workers Compensation",
  general_liability:    "General Liability",
};

// Short tab labels
export const BENCH_LOB_SHORT = {
  personal_lines:       "Personal Lines",
  commercial_lines:     "Commercial Lines",
  workers_compensation: "Workers Comp",
  general_liability:    "General Liability",
};

// Category → lens mapping (benchmarkData categories → assessment lenses)
export const BENCH_CAT_TO_LENS = {
  "Cost metrics":                        "financial_leakage",
  "Effectiveness metrics":               "quality_compliance",
  "Experience metrics":                  "quality_compliance",
  "Productivity and efficiency metrics": "process_efficiency",
  "Prevention":                          "technology",
};

// Short display names for category tabs
export const BENCH_CAT_SHORT = {
  "Cost metrics":                        "Cost",
  "Effectiveness metrics":               "Effectiveness",
  "Experience metrics":                  "Experience",
  "Productivity and efficiency metrics": "Productivity",
  "Prevention":                          "Prevention",
};

// All categories in display order
export const BENCH_CATS = [
  "Cost metrics",
  "Effectiveness metrics",
  "Experience metrics",
  "Productivity and efficiency metrics",
  "Prevention",
];

// Get unique bench LOB keys for a carrier's LOB selection (deduped, in display order)
export function getUniqueBenchKeys(carrierLobs) {
  const ORDER = ["personal_lines","commercial_lines","workers_compensation","general_liability"];
  const keys  = (carrierLobs || []).map(l => LOB_TO_BENCH_KEY[l]).filter(Boolean);
  const unique = [...new Set(keys)];
  return ORDER.filter(k => unique.includes(k));
}

// Determine direction from the benchmark data itself:
// If BIC centre > Industry centre → higher = better
// If BIC centre < Industry centre → lower = better
export function isHigherBetter(metric) {
  const t = metric.tier2 || metric.tier1 || metric.tier3;
  if (!t) return true;
  const bicC = ((t.bicMin || 0) + (t.bicMax || 0)) / 2;
  const indC = ((t.indMin || 0) + (t.indMax || 0)) / 2;
  return bicC >= indC;
}

// Retrieve benchmarkData benchmark for a metric at a given tier (1|2|3)
export function getBenchForTier(metric, tier) {
  return metric[`tier${tier || 2}`] || metric.tier2 || metric.tier1 || {};
}

// Score a single value against tier-specific benchmark ranges (returns 0-100)
// 80-100 = BIC zone  |  50-80 = industry zone  |  0-50 = below industry
export function scoreMetric(val, bench, hib) {
  const { indMin=0, indMax=0, bicMin=0, bicMax=0 } = bench;
  const sd = (a, b) => (b === 0 ? 0 : a / b);
  let score;
  if (hib) {
    if (val >= bicMax) return 100;
    if (val >= bicMin)  score = 80 + sd(val - bicMin, Math.max(0.001, bicMax - bicMin)) * 20;
    else if (val >= indMin) score = 50 + sd(val - indMin, Math.max(0.001, bicMin - indMin)) * 30;
    else score = Math.max(5, sd(val, Math.max(0.001, indMin)) * 50);
  } else {
    if (val <= bicMin) return 100;
    if (val <= bicMax)  score = 80 + sd(bicMax - val, Math.max(0.001, bicMax - bicMin)) * 20;
    else if (val <= indMax) score = 50 + sd(indMax - val, Math.max(0.001, indMax - bicMax)) * 30;
    else score = Math.max(5, sd(indMax, Math.max(0.001, val)) * 50);
  }
  return Math.min(100, Math.max(0, Math.round(score)));
}

// Get all metrics for a bench LOB key, optionally filtered by category
export function getMetricsForLob(benchLobKey, category) {
  const all = BENCHMARK_DATA[benchLobKey] || [];
  return category ? all.filter(m => m.category === category) : all;
}

// Key format used by Page4 for storing entered values: "{benchLobKey}-{metricName}"
export function makeMetricKey(benchLobKey, metricName) {
  return `${benchLobKey}-${metricName}`;
}

// Compute LOB-specific lens scores from metricsData + carrier info + optional overrides
export function computeLensScores(metricsData, carrierInfo, benchmarkOverrides = {}) {
  const tier  = carrierInfo?.tier || 2;
  const keys  = getUniqueBenchKeys(carrierInfo?.lobs || []);
  const LENSES = ["process_efficiency","financial_leakage","quality_compliance","technology","org_performance"];
  const acc   = Object.fromEntries(LENSES.map(l => [l, { total: 0, count: 0 }]));

  for (const benchLobKey of keys) {
    const metrics = BENCHMARK_DATA[benchLobKey] || [];
    for (const metric of metrics) {
      const key = makeMetricKey(benchLobKey, metric.metric);
      const raw = metricsData?.[key];
      if (!raw || raw === "") continue;
      const val = parseFloat(raw);
      if (isNaN(val)) continue;

      const lensKey = BENCH_CAT_TO_LENS[metric.category];
      if (!lensKey) continue;

      // Use override if admin has set one, else use benchmarkData default
      const overrideKey = `${benchLobKey}:${metric.metric}:${tier}`;
      const bench = benchmarkOverrides[overrideKey] || getBenchForTier(metric, tier);
      const hib   = isHigherBetter(metric);
      const score = scoreMetric(val, bench, hib);

      acc[lensKey].total += score;
      acc[lensKey].count++;
    }
  }

  const lensScores = {};
  for (const [lens, { total, count }] of Object.entries(acc)) {
    if (count > 0) lensScores[lens] = Math.round(total / count);
  }
  return lensScores;
}
