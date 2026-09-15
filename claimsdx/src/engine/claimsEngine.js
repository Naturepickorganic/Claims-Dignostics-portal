// ═══════════════════════════════════════════════════════════════════════════
// ClaimsDx Decision Engine — pure logic, no UI
// Implements the Decision Tree & Scoring specification:
//   KPI instances (Metric+LOB+Tier) → Gap Scores → parent/child branches →
//   value pools → economic sizing → diagnostic scores → offering evidence →
//   priority scores → knockout gates → 80/20 waves → data fields to build.
// All thresholds live in ENGINE_CONFIG so Admin can tune without code change.
// ═══════════════════════════════════════════════════════════════════════════

import { BENCHMARK_DATA } from "../benchmarkData.js";
import { METRIC_BY_NAME } from "./metricMaster.js";
import { OFFERING_MAP } from "./offeringMap.js";

// ─── Configuration (Admin-tunable) ──────────────────────────────────────────
export const ENGINE_CONFIG = {
  // Status thresholds come from benchmark ranges directly; gap weights below
  diagnosticWeights: { gap: 0.45, materiality: 0.35, scale: 0.10, confidence: 0.10 },
  priorityWeights:   { economic: 0.45, evidence: 0.30, causalFit: 0.15, confidence: 0.10 },
  evidenceWeights3:  [0.60, 0.25, 0.15],
  evidenceWeights2:  [0.70, 0.30],
  // Knockout gates — cap the LABEL; value keeps the wave
  gates: { g1MinBranchGap: 40, g2MinPrimaryFit: 0.75, g4MinConfidence: 65 },
  // Prerequisite chains (offeringId → required offeringIds). Extend as agreed.
  prerequisites: {},
  // Hidden-opportunity thresholds (parent healthy, child bleeding)
  hidden: { parentBelow: 25, childAtLeast: 60 },
  // Addressability and capture defaults by value pool (assumed → confidence deduction)
  // applicable = share of annual claims the per-claim formula may touch (assumed → deduction)
  poolAssumptions: {
    INDEMNITY_ACCURACY: { addressable: 0.50, capture: 0.50, applicable: 1.00 },
    LEAKAGE:            { addressable: 0.60, capture: 0.50, applicable: 1.00 },
    LITIGATION:         { addressable: 0.60, capture: 0.45, applicable: 0.12 },
    SUBRO:              { addressable: 0.70, capture: 0.55, applicable: 1.00 },
    SALVAGE:            { addressable: 0.70, capture: 0.55, applicable: 1.00 },
    FRAUD:              { addressable: 0.40, capture: 0.40, applicable: 1.00 },
    VENDOR_NETWORK:     { addressable: 0.65, capture: 0.55, applicable: 0.60 },
    HANDLING_CAPACITY:  { addressable: 0.60, capture: 0.65, applicable: 1.00 },
    CYCLE_ECONOMY:      { addressable: 0.45, capture: 0.50, applicable: 0.50 },
    WC_MEDICAL:         { addressable: 0.50, capture: 0.45, applicable: 0.25 },
    CX_RETENTION:       { addressable: 0.30, capture: 0.30, applicable: 1.00 },
    EVIDENCE_ONLY:      { addressable: 0.00, capture: 0.00, applicable: 0.00 },
    DEFAULT:            { addressable: 0.50, capture: 0.50, applicable: 1.00 },
  },
  // Cycle-economy bridge shares of annual claims (assumed)
  bridgeShares: { autoRental: 0.40, propertyAle: 0.20 },
  // Waves
  waves: { step1Cum: 0.80, step2Cum: 0.95 },
  // Confidence deductions (start 100, floor 40)
  deductions: { missingEconField: 25, missingBenchmark: 20, addressabilityAssumed: 10, captureAssumed: 10 },
  confidenceFloor: 40,
};

const LOB_KEYS = { PL: "personal_lines", CL: "commercial_lines", WC: "workers_compensation", GL: "general_liability" };
const LOB_FROM_KEY = Object.fromEntries(Object.entries(LOB_KEYS).map(([a, b]) => [b, a]));
// Portal LOB ids (Page2) → benchmark LOB groups
const PORTAL_LOB_TO_BENCH = { pa: "personal_lines", ph: "personal_lines", ca: "commercial_lines", cp: "commercial_lines", bop: "commercial_lines", wc: "workers_compensation", gl: "general_liability" };

const num = v => {
  const s = String(v ?? "").replace(/[, ]/g, "");
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round1 = v => Math.round(v * 10) / 10;

// ─── Benchmark resolution: Metric + LOB + Tier ──────────────────────────────
function benchFor(entry, tier) {
  const t = entry[`tier${tier}`] || entry.tier2 || entry.tier1 || entry.tier3;
  if (!t) return null;
  return { bicLow: t.bicMin ?? null, bicHigh: t.bicMax ?? null, industryLow: t.indMin ?? null, industryHigh: t.indMax ?? null };
}

// ─── Gap Score (0–100 continuous; null = unknown, never zero) ───────────────
export function calculateGapScore(actual, bench, direction) {
  if (actual == null || !bench || direction === "CONTEXT_ONLY") return null;
  const { bicLow, bicHigh, industryLow, industryHigh } = bench;
  let gap;
  if (direction === "HIGH_BAD") {
    const bicLimit = bicHigh ?? bicLow, worst = industryHigh ?? industryLow;
    if (bicLimit == null || worst == null || worst - bicLimit <= 0) return null;
    gap = (actual - bicLimit) / (worst - bicLimit);
  } else if (direction === "LOW_BAD") {
    const bicLimit = bicLow ?? bicHigh, worst = industryLow ?? industryHigh;
    if (bicLimit == null || worst == null || bicLimit - worst <= 0) return null;
    gap = (bicLimit - actual) / (bicLimit - worst);
  } else if (direction === "TARGET_RANGE") {
    if (bicLow == null || bicHigh == null) return null;
    if (actual >= bicLow && actual <= bicHigh) return 0;
    if (actual < bicLow) {
      const worst = industryLow ?? bicLow * 0.5;
      if (bicLow - worst <= 0) return null;
      gap = (bicLow - actual) / (bicLow - worst);
    } else {
      const worst = industryHigh ?? bicHigh * 1.5;
      if (worst - bicHigh <= 0) return null;
      gap = (actual - bicHigh) / (worst - bicHigh);
    }
  } else return null;
  return clamp(Math.round(gap * 100), 0, 100);
}

// ─── Status (display language, separate from the score) ─────────────────────
export function deriveStatus(actual, bench, direction) {
  if (actual == null || !bench) return "NEEDS_INPUT";
  const { bicLow, bicHigh, industryLow, industryHigh } = bench;
  const inBic = bicLow != null && bicHigh != null && actual >= bicLow && actual <= bicHigh;
  if (direction === "HIGH_BAD") {
    if (bicLow != null && actual < bicLow) return "EXCEPTIONAL";
    if (inBic) return "BEST_IN_CLASS";
    const worst = industryHigh ?? industryLow;
    if (worst != null && actual > worst) return "CRITICAL";
    return "COMPETITIVE";
  }
  if (direction === "LOW_BAD") {
    if (bicHigh != null && actual > bicHigh) return "EXCEPTIONAL";
    if (inBic) return "BEST_IN_CLASS";
    const worst = industryLow ?? industryHigh;
    if (worst != null && actual < worst) return "CRITICAL";
    return "COMPETITIVE";
  }
  if (direction === "TARGET_RANGE") {
    if (inBic) return "BEST_IN_CLASS";
    const lowW = industryLow, highW = industryHigh;
    if ((lowW != null && actual < lowW) || (highW != null && actual > highW)) return "CRITICAL";
    return "COMPETITIVE";
  }
  return "CONTEXT";
}

// ─── Economics parsing ──────────────────────────────────────────────────────
function parseEconomics(eco) {
  const e = eco || {};
  const M = 1_000_000;
  return {
    dep: num(e.dep) != null ? num(e.dep) * M : null,
    dwp: num(e.dwp) != null ? num(e.dwp) * M : null,
    annualClaims: num(e.annualClaims),
    incurredLoss: num(e.incurredLoss) != null ? num(e.incurredLoss) * M : null,
    paidAlae: num(e.paidAlae) != null ? num(e.paidAlae) * M : null,
    paidUlae: num(e.paidUlae) != null ? num(e.paidUlae) * M : null,
    subroRecoverable: num(e.subroRecoverable) != null ? num(e.subroRecoverable) * M : null,
    salvageEligible: num(e.salvageEligible) != null ? num(e.salvageEligible) * M : null,
    adjusterCount: num(e.adjusterCount),
    loadedFteCost: num(e.loadedFteCost),
    productiveHours: num(e.productiveHours),
    rentalCostDay: num(e.rentalCostDay),
    aleCostDay: num(e.aleCostDay),
    costPerCall: num(e.costPerCall),
  };
}

// ─── Per-instance economic sizing (theoretical → addressable) ───────────────
function sizeInstance(inst, eco, cfg) {
  const m = inst.master;
  const asm = cfg.poolAssumptions[m.valuePool] || cfg.poolAssumptions.DEFAULT;
  const deductions = [];
  let theoretical = null;

  const target = (() => {
    const b = inst.bench;
    if (!b) return null;
    if (m.direction === "HIGH_BAD") return b.bicHigh ?? b.bicLow;
    if (m.direction === "LOW_BAD") return b.bicLow ?? b.bicHigh;
    return null;
  })();

  switch (m.formulaType) {
    case "LOSS_RATIO":
      if (inst.actual != null && target != null && eco.dep != null)
        theoretical = Math.max(0, (inst.actual - target) / 100) * eco.dep;
      else if (eco.dep == null) deductions.push("missingEconField");
      break;
    case "PER_CLAIM_COST": {
      const applicable = asm.applicable ?? 1;
      if (inst.actual != null && target != null && eco.annualClaims != null) {
        theoretical = Math.max(0, inst.actual - target) * eco.annualClaims * applicable;
        if (applicable < 1) deductions.push("addressabilityAssumed");
      } else if (eco.annualClaims == null) deductions.push("missingEconField");
      break;
    }
    case "RECOVERY_RATE": {
      const base = m.valuePool === "SALVAGE" ? eco.salvageEligible : eco.subroRecoverable;
      if (inst.actual != null && target != null && base != null)
        theoretical = Math.max(0, (target - inst.actual) / 100) * base;
      else if (base == null) deductions.push("missingEconField");
      break;
    }
    case "CYCLE_TIME": {
      // Monetize only where an economic bridge exists (rental / ALE)
      const name = m.name;
      if (name === "Average length of auto rental paid" && inst.actual != null && target != null && eco.rentalCostDay != null && eco.annualClaims != null) {
        theoretical = Math.max(0, inst.actual - target) * eco.rentalCostDay * eco.annualClaims * cfg.bridgeShares.autoRental;
        deductions.push("addressabilityAssumed");
      } else if (name === "Additional living expense (ALE) days per claim" && inst.actual != null && target != null && eco.aleCostDay != null && eco.annualClaims != null) {
        theoretical = Math.max(0, inst.actual - target) * eco.aleCostDay * eco.annualClaims * cfg.bridgeShares.propertyAle;
        deductions.push("addressabilityAssumed");
      }
      // other cycle metrics: no defensible bridge → stays null (VALUE_NOT_SIZED)
      break;
    }
    case "PERCENTAGE_DRIVER":
    case "PRODUCTIVITY":
    case "CUSTOMER":
    case "CONTEXT_ONLY":
    default:
      break; // sized via pool peers or intentionally unsized
  }

  let addressable = null;
  if (theoretical != null && theoretical > 0) {
    addressable = theoretical * asm.addressable * asm.capture;
    deductions.push("addressabilityAssumed", "captureAssumed");
  }
  return { theoretical, addressable, deductions, valueNotSized: theoretical == null };
}

// ─── Materiality base per pool ──────────────────────────────────────────────
function materialityBase(pool, eco) {
  switch (pool) {
    case "HANDLING_CAPACITY": return eco.paidUlae ?? eco.incurredLoss;
    case "LITIGATION": case "VENDOR_NETWORK": return eco.paidAlae ?? eco.incurredLoss;
    case "SUBRO": return eco.subroRecoverable;
    case "SALVAGE": return eco.salvageEligible;
    case "LEAKAGE": case "INDEMNITY_ACCURACY": case "WC_MEDICAL": case "FRAUD": case "EVIDENCE_ONLY": return eco.incurredLoss;
    case "CYCLE_ECONOMY": return eco.incurredLoss;
    default: return null;
  }
}

// ─── Main entry ─────────────────────────────────────────────────────────────
export function runEngine({ metricsData, carrierInfo, benchmarkOverrides = {}, config = {} }) {
  const cfg = { ...ENGINE_CONFIG, ...config, gates: { ...ENGINE_CONFIG.gates, ...(config.gates || {}) } };
  const tier = carrierInfo?.tier || 2;
  const eco = parseEconomics(carrierInfo?.economics);

  // Selected benchmark LOB groups from carrier's chosen LOBs
  const benchKeys = [...new Set((carrierInfo?.lobs || []).map(l => PORTAL_LOB_TO_BENCH[l]).filter(Boolean))];
  const selectedLobs = benchKeys.map(k => LOB_FROM_KEY[k]);

  // ── 1. KPI Instances ──
  const instances = [];
  for (const bk of benchKeys) {
    for (const entry of (BENCHMARK_DATA[bk] || [])) {
      const master = METRIC_BY_NAME[entry.metric];
      if (!master) continue;
      const key = `${bk}-${entry.metric}`;
      const actual = num(metricsData?.[key]);
      const ovKey = `${bk}:${entry.metric}:${tier}`;
      const bench = benchmarkOverrides[ovKey] || benchFor(entry, tier);
      const benchStatus = !bench ? "MISSING" : "VALID";
      const gapScore = calculateGapScore(actual, bench, master.direction);
      const inst = {
        kpiInstanceId: `${LOB_FROM_KEY[bk]}_${master.metricId}`,
        metricName: entry.metric, lob: LOB_FROM_KEY[bk], tier,
        master, actual, bench, benchmarkValidationStatus: benchStatus,
        gapScore, status: master.direction === "CONTEXT_ONLY" ? "CONTEXT" : deriveStatus(actual, bench, master.direction),
        hiddenOpportunity: false, diagnosticGap: false,
      };
      instances.push(inst);
    }
  }
  const instIndex = {};
  instances.forEach(i => { instIndex[`${i.lob}|${i.metricName}`] = i; });

  // ── 2. Parent/child branches per LOB ──
  const branches = [];
  for (const inst of instances) {
    const kids = instances.filter(x => x.lob === inst.lob && x.master.parentName === inst.metricName);
    if (!kids.length) continue;
    const childScores = kids.map(k => k.gapScore).filter(s => s != null);
    const maxChild = childScores.length ? Math.max(...childScores) : null;
    const parentScore = inst.gapScore ?? 0;
    const branchScore = Math.max(parentScore, maxChild ?? 0);
    const hiddenOpportunity = parentScore < cfg.hidden.parentBelow && maxChild != null && maxChild >= cfg.hidden.childAtLeast;
    const diagnosticGap = parentScore >= 60 && childScores.length > 0 && Math.max(...childScores) < 25;
    if (hiddenOpportunity) kids.forEach(k => { if ((k.gapScore ?? 0) >= cfg.hidden.childAtLeast) k.hiddenOpportunity = true; });
    if (diagnosticGap) inst.diagnosticGap = true;
    branches.push({ lob: inst.lob, parent: inst.metricName, parentScore: inst.gapScore, children: kids.map(k => ({ name: k.metricName, gapScore: k.gapScore })), branchScore, hiddenOpportunity, diagnosticGap });
  }

  // ── 3. Economic sizing + diagnostic score per instance ──
  const totalLobs = selectedLobs.length || 1;
  for (const inst of instances) {
    const m = inst.master;
    const sized = sizeInstance(inst, eco, cfg);
    inst.theoreticalOpportunity = sized.theoretical;
    inst.addressableValue = m.valuePool === "EVIDENCE_ONLY" ? null : sized.addressable; // parents never carry pool dollars
    inst.valueNotSized = sized.valueNotSized;

    // Confidence: start 100, deduct
    let conf = 100;
    const seen = new Set();
    for (const d of sized.deductions) { if (!seen.has(d)) { conf -= cfg.deductions[d] || 0; seen.add(d); } }
    if (inst.benchmarkValidationStatus !== "VALID") conf -= cfg.deductions.missingBenchmark;
    inst.confidenceScore = Math.max(cfg.confidenceFloor, conf);

    // Materiality (relative to pool base)
    const base = materialityBase(m.valuePool, eco);
    inst.economicMateriality = (inst.addressableValue != null && base != null && base > 0)
      ? clamp(Math.round((inst.addressableValue / base) * 100 * 4), 0, 100) // 25% of base = 100
      : null;

    // Scale: share of selected LOBs this metric covers
    inst.scaleScore = clamp(Math.round((m.lobs.filter(l => selectedLobs.includes(l)).length / totalLobs) * 100), 0, 100);

    // Diagnostic score with renormalized weights over available components
    const w = cfg.diagnosticWeights;
    const parts = [];
    if (inst.gapScore != null) parts.push([w.gap, inst.gapScore]);
    if (inst.economicMateriality != null) parts.push([w.materiality, inst.economicMateriality]);
    parts.push([w.scale, inst.scaleScore]);
    parts.push([w.confidence, inst.confidenceScore]);
    const wSum = parts.reduce((s, [ww]) => s + ww, 0);
    inst.diagnosticScore = inst.gapScore == null ? null
      : Math.round(parts.reduce((s, [ww, v]) => s + ww * v, 0) / wSum);
  }

  // ── 4. Value pools (each dollar counted once: max sized member) ──
  const pools = {};
  for (const inst of instances) {
    const p = inst.master.valuePool;
    if (!p || p === "CONTEXT" || p === "EVIDENCE_ONLY" || p === "UNMAPPED") continue;
    if (inst.addressableValue == null) continue;
    if (!pools[p] || inst.addressableValue > pools[p].addressableValue) {
      pools[p] = { poolId: p, addressableValue: inst.addressableValue, theoretical: inst.theoreticalOpportunity, sizedBy: inst.kpiInstanceId, lob: inst.lob, confidence: inst.confidenceScore };
    }
  }

  // ── 5. Offerings: evidence, value, priority, gates ──
  const byOffering = {};
  for (const row of OFFERING_MAP) {
    if (row.mappingType === "CONTEXT_SCALE" || row.causalFit <= 0) continue;
    for (const lob of row.lobs) {
      if (!selectedLobs.includes(lob)) continue;
      const inst = instIndex[`${lob}|${row.metricName}`];
      if (!inst) continue;
      const o = (byOffering[row.offeringId] ||= { offeringId: row.offeringId, offering: row.offering, theme: row.theme, mapped: [], primaryFitMax: 0, pools: new Set() });
      o.mapped.push({ inst, fit: row.causalFit, type: row.mappingType, pool: row.valuePoolId });
      if (row.mappingType === "PRIMARY") o.primaryFitMax = Math.max(o.primaryFitMax, row.causalFit);
      // Pool credit requires a strong causal link; weak tags never inherit pool dollars
      if (row.causalFit >= 0.75 && row.valuePoolId && !["CONTEXT", "EVIDENCE_ONLY"].includes(row.valuePoolId)) o.pools.add(row.valuePoolId);
    }
  }

  let offerings = Object.values(byOffering).map(o => {
    const adj = o.mapped
      .filter(x => x.inst.diagnosticScore != null)
      .map(x => ({ score: x.inst.diagnosticScore * x.fit, name: x.inst.metricName, lob: x.inst.lob, fit: x.fit }))
      .sort((a, b) => b.score - a.score);
    let evidence = null;
    if (adj.length === 1) evidence = adj[0].score;
    else if (adj.length === 2) evidence = adj[0].score * cfg.evidenceWeights2[0] + adj[1].score * cfg.evidenceWeights2[1];
    else if (adj.length >= 3) evidence = adj[0].score * cfg.evidenceWeights3[0] + adj[1].score * cfg.evidenceWeights3[1] + adj[2].score * cfg.evidenceWeights3[2];

    const addressableValue = [...o.pools].reduce((s, p) => s + (pools[p]?.addressableValue || 0), 0) || null;
    const topKpis = adj.slice(0, 3);
    const confidence = topKpis.length ? Math.round(topKpis.reduce((s, x) => s + o.mapped.find(m2 => m2.inst.metricName === x.name && m2.inst.lob === x.lob).inst.confidenceScore, 0) / topKpis.length) : cfg.confidenceFloor;
    const branchHit = o.mapped.some(x => (x.inst.gapScore ?? 0) >= cfg.gates.g1MinBranchGap || x.inst.hiddenOpportunity);
    return { ...o, pools: [...o.pools], evidence: evidence != null ? Math.round(evidence) : null, topKpis, addressableValue, confidence, branchHit };
  });

  const maxVal = Math.max(1, ...offerings.map(o => o.addressableValue || 0));
  offerings.forEach(o => {
    const econScore = o.addressableValue != null ? Math.round((o.addressableValue / maxVal) * 100) : 0;
    const fitScore = Math.round((o.mapped.reduce((m2, x) => Math.max(m2, x.fit), 0)) * 100);
    const w = cfg.priorityWeights;
    o.priorityScore = Math.round(econScore * w.economic + (o.evidence ?? 0) * w.evidence + fitScore * w.causalFit + o.confidence * w.confidence);

    // Gates: cap the label, never the rank
    o.gates = {
      G1_materialProblem: o.branchHit,
      G2_causalAnchor: o.primaryFitMax >= cfg.gates.g2MinPrimaryFit,
      G3_valueSized: o.addressableValue != null && o.addressableValue > 0,
      G4_confidence: o.confidence >= cfg.gates.g4MinConfidence,
      G5_prerequisites: (cfg.prerequisites[o.offeringId] || []).every(pr =>
        offerings.find(x => x.offeringId === pr)?.gates?.G3_valueSized !== false),
    };
    const failed = Object.entries(o.gates).filter(([, ok]) => !ok).map(([g]) => g);
    o.failedGates = failed;
    o.label = !o.gates.G3_valueSized ? "SIZE_IT_FIRST"
      : failed.length ? "VALIDATE_FIRST"
      : o.priorityScore >= 80 ? "ACT_NOW"
      : o.priorityScore >= 65 ? "PRIORITY"
      : o.priorityScore >= 50 ? "VALIDATE_PILOT" : "WATCH";
  });

  // ── 6. 80/20 waves (value governs the wave; gated stay ranked) ──
  const ranked = offerings.filter(o => (o.addressableValue || 0) > 0).sort((a, b) => b.addressableValue - a.addressableValue);
  const totalVal = ranked.reduce((s, o) => s + o.addressableValue, 0);
  let cum = 0;
  ranked.forEach(o => {
    const before = totalVal ? cum / totalVal : 0;
    cum += o.addressableValue;
    o.cumulativeValueShare = totalVal ? round1((cum / totalVal) * 100) : null;
    o.wave = before < cfg.waves.step1Cum ? "STEP_1_80_20" : before < cfg.waves.step2Cum ? "STEP_2_NEXT_WAVE" : "STEP_3_TARGET_STATE";
  });
  offerings.filter(o => !(o.addressableValue > 0)).forEach(o => { o.wave = "STEP_3_TARGET_STATE"; o.cumulativeValueShare = null; });
  offerings = offerings.sort((a, b) => (b.addressableValue || 0) - (a.addressableValue || 0) || b.priorityScore - a.priorityScore);

  // ── 7. Data fields to build ──
  const dataFields = [];
  const ecoNeeds = [
    ["dep", "DEP (Direct Earned Premium)", ["LOSS_RATIO economics"], eco.dep],
    ["annualClaims", "Annual Claims Volume", ["Every per-claim value pool"], eco.annualClaims],
    ["paidAlae", "ALAE Paid $", ["LITIGATION and VENDOR materiality"], eco.paidAlae],
    ["paidUlae", "ULAE Paid $", ["HANDLING_CAPACITY materiality"], eco.paidUlae],
    ["subroRecoverable", "Subrogation Recoverable Base $", ["SUBRO pool sizing"], eco.subroRecoverable],
    ["incurredLoss", "Incurred Losses $", ["Severity pool materiality"], eco.incurredLoss],
  ];
  for (const [field, label, blocks, val] of ecoNeeds) {
    if (val == null) dataFields.push({ field, label, requiredFor: blocks, kind: "ECONOMIC", priority: "HIGH" });
  }
  instances.filter(i => i.status === "NEEDS_INPUT" && i.master.role !== "CONTEXT").slice(0, 40).forEach(i => {
    dataFields.push({ field: i.metricName, label: `${i.metricName} (${i.lob})`, requiredFor: [i.master.valuePool], kind: "KPI_ACTUAL", priority: (i.master.role === "OUTCOME" ? "HIGH" : "MEDIUM") });
  });
  branches.filter(b => b.diagnosticGap).forEach(b => {
    dataFields.push({ field: `${b.parent} drivers (${b.lob})`, label: `Unexplained gap under ${b.parent}`, requiredFor: ["Root-cause drill-down"], kind: "DIAGNOSTIC_GAP", priority: "HIGH" });
  });
  const gatedEvidence = offerings.filter(o => !o.gates.G2_causalAnchor).map(o => o.offering);
  if (gatedEvidence.length) {
    dataFields.push({ field: "Manual touches per claim, Document handling effort, AI assist adoption", label: "Capability metrics for evidence-starved offerings", requiredFor: gatedEvidence, kind: "NEW_METRIC", priority: "MEDIUM" });
  }

  return {
    meta: { tier, selectedLobs, generatedAt: new Date().toISOString(), config: { gates: cfg.gates, waves: cfg.waves } },
    instances, branches, pools: Object.values(pools), offerings, dataFieldsToBuild: dataFields,
  };
}
