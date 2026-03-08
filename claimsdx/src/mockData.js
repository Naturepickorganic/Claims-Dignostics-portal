// ─── Mock data for local development (no Supabase needed) ────────────────────
// 10 realistic P&C carriers with assessment history

export const MOCK_CARRIERS = [
  { id: "c1", carrier_name: "Acme Mutual Insurance",     naic: "10234", tier: 2, lobs: ["pa","ph","ca"] },
  { id: "c2", carrier_name: "BlueStar P&C Group",        naic: "20145", tier: 3, lobs: ["pa","ph","wc","gl"] },
  { id: "c3", carrier_name: "Cornerstone Casualty",      naic: "30567", tier: 1, lobs: ["pa","wc"] },
  { id: "c4", carrier_name: "Delta National Insurance",  naic: "40892", tier: 3, lobs: ["ca","cp","bop","gl"] },
  { id: "c5", carrier_name: "Eastern Farmers Mutual",    naic: "50321", tier: 1, lobs: ["ph","cp"] },
  { id: "c6", carrier_name: "Frontier Fire & Casualty",  naic: "60744", tier: 2, lobs: ["pa","ph","ca","wc"] },
  { id: "c7", carrier_name: "Great Lakes Indemnity",     naic: "70198", tier: 2, lobs: ["wc","gl"] },
  { id: "c8", carrier_name: "Horizon Specialty Lines",   naic: "80456", tier: 3, lobs: ["gl","bop","cp"] },
  { id: "c9", carrier_name: "Inland Empire Insurance",   naic: "90672", tier: 1, lobs: ["pa","wc"] },
  { id: "c10",carrier_name: "Keystone Commercial Group", naic: "11083", tier: 2, lobs: ["ca","cp","bop","wc","gl"] },
];

const LENS_KEYS = ["process_efficiency","financial_leakage","quality_compliance","technology","org_performance"];
const LENS_LABELS = {
  process_efficiency: "Process Efficiency",
  financial_leakage:  "Financial Leakage",
  quality_compliance: "Quality & Compliance",
  technology:         "Technology Utilization",
  org_performance:    "Org. Performance",
};

function randScore(base, spread = 15) {
  return Math.min(98, Math.max(18, Math.round(base + (Math.random() - 0.5) * spread)));
}
function maturity(s) { return s >= 80 ? "Leading" : s >= 65 ? "Advanced" : s >= 50 ? "Developing" : "Foundational"; }

function makeResult(carrierId, offset = 0) {
  const bases = {
    c1:  [68, 55, 80, 42, 63],
    c2:  [82, 74, 88, 71, 78],
    c3:  [45, 42, 60, 35, 50],
    c4:  [75, 68, 77, 65, 72],
    c5:  [52, 48, 70, 38, 55],
    c6:  [70, 62, 75, 58, 67],
    c7:  [63, 57, 72, 50, 61],
    c8:  [88, 82, 91, 78, 85],
    c9:  [40, 38, 55, 30, 45],
    c10: [71, 65, 78, 60, 69],
  }[carrierId] || [60, 55, 70, 50, 60];

  const lens_scores = {};
  LENS_KEYS.forEach((k, i) => { lens_scores[k] = randScore(bases[i] + offset); });
  const overall = Math.round(Object.values(lens_scores).reduce((a, b) => a + b, 0) / 5);
  const lens_gaps = {};
  LENS_KEYS.forEach(k => { lens_gaps[k] = lens_scores[k] - 65; });

  return { overall_score: overall, maturity_level: maturity(overall), lens_scores, lens_gaps };
}

// Build assessment history (some carriers have 2 runs = trend)
let asmId = 1;
function makeAssessment(carrierId, status, daysAgo, hasSecondRun = false, path = "metrics") {
  const carrier = MOCK_CARRIERS.find(c => c.id === carrierId);
  const date = new Date(Date.now() - daysAgo * 86400000);
  const id = "a" + (asmId++);
  const result = status === "complete" ? makeResult(carrierId) : null;
  return {
    assessment_id:    id,
    user_id:          "local",
    carrier_id:       carrierId,
    carrier_name:     carrier.carrier_name,
    naic:             carrier.naic,
    tier:             carrier.tier,
    lobs:             carrier.lobs,
    path,
    assessment_type:  "baseline",
    status,
    started_at:       date.toISOString(),
    completed_at:     status === "complete" ? date.toISOString() : null,
    consultant_name:  "Local User",
    ...(result || {}),
    // for trend: attach previous score if this is a repeat
    prev_score: hasSecondRun ? makeResult(carrierId, -8).overall_score : null,
  };
}

export const MOCK_ASSESSMENTS = [
  makeAssessment("c1",  "complete",    45, true),
  makeAssessment("c1",  "complete",   180, false),  // older run for c1
  makeAssessment("c2",  "complete",    12),
  makeAssessment("c3",  "in_progress",  3),
  makeAssessment("c4",  "complete",    30, true),
  makeAssessment("c5",  "in_progress",  8),
  makeAssessment("c6",  "complete",    60),
  makeAssessment("c7",  "complete",    22, false, "process"),
  makeAssessment("c8",  "complete",     5),
  makeAssessment("c9",  "in_progress",  1),
  makeAssessment("c10", "complete",    90, true),
  makeAssessment("c4",  "complete",   270, false),  // older c4
];

// Aggregate stats helpers
export function getMockStats() {
  const complete    = MOCK_ASSESSMENTS.filter(a => a.status === "complete");
  const inProgress  = MOCK_ASSESSMENTS.filter(a => a.status === "in_progress");
  const thisMonth   = complete.filter(a => new Date(a.completed_at) > new Date(Date.now() - 30 * 86400000));
  const avgScore    = Math.round(complete.reduce((s, a) => s + (a.overall_score || 0), 0) / (complete.length || 1));
  const byTier      = { 1: [], 2: [], 3: [] };
  complete.forEach(a => { if (a.tier) byTier[a.tier].push(a.overall_score); });
  const tierAvg     = {};
  Object.entries(byTier).forEach(([t, scores]) => {
    tierAvg[t] = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  });
  return { total: MOCK_ASSESSMENTS.length, complete: complete.length, inProgress: inProgress.length, thisMonth: thisMonth.length, avgScore, tierAvg };
}

export function getLensAverages() {
  const complete = MOCK_ASSESSMENTS.filter(a => a.status === "complete" && a.lens_scores);
  const totals = {};
  LENS_KEYS.forEach(k => { totals[k] = 0; });
  complete.forEach(a => { LENS_KEYS.forEach(k => { totals[k] += a.lens_scores[k] || 0; }); });
  const avgs = {};
  LENS_KEYS.forEach(k => { avgs[k] = Math.round(totals[k] / complete.length); });
  return avgs;
}

export { LENS_LABELS, LENS_KEYS };
