import { useState, useMemo } from "react";
import { ArrowLeft, Home, AlertTriangle, Lightbulb, Target } from "lucide-react";
import { C, FONT, btnPrimary, btnSecondary, card } from "../constants.js";
import { Tag } from "../components.jsx";
import { QUESTIONS_DATA } from "../questionsData.js";

// ── Domain config ───────────────────────────────────────────────────────────
const DOMAIN_DISPLAY = {
  "Initial claims processing":       { label: "Initial Claims Processing",        short: "Initial"    },
  "Claims review and investigation": { label: "Claims Review & Investigation",    short: "Review"     },
  "Fraud detection and management":  { label: "Fraud Detection & Management",     short: "Fraud"      },
  "Claims adjustment and disbursal": { label: "Claims Adjustment & Disbursement", short: "Adjustment" },
  "Litigation and subrogation":      { label: "Litigation & Subrogation",         short: "Litigation" },
};
const DOMAIN_ORDER = Object.keys(DOMAIN_DISPLAY);

// Build l3 → { l1, l2 } lookup once at module level
const L3_MAP = {};
QUESTIONS_DATA.forEach(q => { L3_MAP[q.l3] = { l1: q.l1, l2: q.l2 }; });

// ── Score helpers ───────────────────────────────────────────────────────────
const toScore = s => s ? Math.round(((s - 1) / 4) * 80 + 20) : null;

const scoreColor = s => {
  if (s === null) return "#94A3B8";
  return s >= 80 ? "#059669" : s >= 60 ? "#D97706" : "#DC2626";
};
const scoreBg = s => {
  if (s === null) return "#F1F5F9";
  return s >= 80 ? "#ECFDF5" : s >= 60 ? "#FFFBEB" : "#FEF2F2";
};

function ScorePill({ value, size = 11 }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 36, height: 22, borderRadius: 5, fontSize: size, fontWeight: 700,
      fontFamily: "monospace", background: scoreBg(value), color: scoreColor(value),
    }}>
      {value ?? "—"}
    </span>
  );
}

// ── Score dial SVG ──────────────────────────────────────────────────────────
function ScoreDial({ score, size = 120 }) {
  const r = size / 2 - 12;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(score / 100, 1) * circ;
  const cx = size / 2, cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth={10}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.85)" strokeWidth={10}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ * 0.25} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}/>
      <text x={cx} y={cy - 5} textAnchor="middle" fill="white"
        fontSize={24} fontWeight={800} fontFamily="Arial">{score}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,.6)"
        fontSize={9} fontFamily="Arial">/ 100</text>
    </svg>
  );
}

// ── Pentagon radar ──────────────────────────────────────────────────────────
function pentaPt(cx, cy, r, i, n = 5) {
  const a = (i * 2 * Math.PI / n) - Math.PI / 2;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}
function pentaPath(cx, cy, r, n = 5) {
  return Array.from({ length: n }, (_, i) => pentaPt(cx, cy, r, i).join(",")).join(" ");
}

function RadarChart({ domainScores }) {
  const cx = 160, cy = 155, maxR = 100;
  const techPts = DOMAIN_ORDER.map((d, i) => {
    const s = (domainScores[d]?.tech ?? 0) / 100;
    return pentaPt(cx, cy, maxR * s, i).join(",");
  }).join(" ");
  const procPts = DOMAIN_ORDER.map((d, i) => {
    const s = (domainScores[d]?.proc ?? 0) / 100;
    return pentaPt(cx, cy, maxR * s, i).join(",");
  }).join(" ");

  return (
    <svg width={320} height={310} viewBox="0 0 320 310">
      {/* Grid rings */}
      {[20, 40, 60, 80, 100].map(g => (
        <polygon key={g} points={pentaPath(cx, cy, maxR * g / 100)}
          fill="none" stroke={g === 80 ? "#94A3B8" : "#E2E8F0"}
          strokeWidth={g === 80 ? 1.5 : 1} strokeDasharray={g === 80 ? "4 3" : "none"}/>
      ))}
      {/* Axis spokes */}
      {DOMAIN_ORDER.map((_, i) => {
        const [x, y] = pentaPt(cx, cy, maxR, i);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#CBD5E1" strokeWidth={1}/>;
      })}
      {/* BIC reference */}
      <polygon points={pentaPath(cx, cy, maxR * 0.8)}
        fill="rgba(5,150,105,.06)" stroke="#059669" strokeWidth={1.5} strokeDasharray="5 3"/>
      {/* Process area */}
      <polygon points={procPts} fill="rgba(14,165,233,.1)" stroke="#0EA5E9" strokeWidth={1.5} strokeDasharray="4 2"/>
      {/* Tech area */}
      <polygon points={techPts} fill="rgba(37,99,235,.18)" stroke="#2563EB" strokeWidth={2}/>
      {/* Tech dots */}
      {DOMAIN_ORDER.map((d, i) => {
        const s = (domainScores[d]?.tech ?? 0) / 100;
        const [x, y] = pentaPt(cx, cy, maxR * s, i);
        return <circle key={i} cx={x} cy={y} r={4} fill="#2563EB" stroke="white" strokeWidth={2}/>;
      })}
      {/* Labels */}
      {DOMAIN_ORDER.map((d, i) => {
        const [x, y] = pentaPt(cx, cy, maxR + 24, i);
        const anchor = x < cx - 10 ? "end" : x > cx + 10 ? "start" : "middle";
        const avg = domainScores[d]?.avg;
        return (
          <g key={i}>
            <text x={x} y={y - 3} textAnchor={anchor} fontSize={9} fontWeight={700}
              fill="#1B2B4B" fontFamily="Arial">{DOMAIN_DISPLAY[d]?.short}</text>
            {avg !== undefined && (
              <text x={x} y={y + 9} textAnchor={anchor} fontSize={9}
                fill={scoreColor(avg)} fontFamily="Arial">{avg}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}


// ── Priority Matrix — SVG scatter chart ─────────────────────────────────────
function PriorityMatrix({ l2All }) {
  const DOMAIN_COLORS = {
    "Initial claims processing":       "#1a4731",
    "Claims review and investigation": "#2563EB",
    "Fraud detection and management":  "#DC2626",
    "Claims adjustment and disbursal": "#D97706",
    "Litigation and subrogation":      "#7C3AED",
  };
  const DOMAIN_SHORT = {
    "Initial claims processing":       "Initial",
    "Claims review and investigation": "Review",
    "Fraud detection and management":  "Fraud",
    "Claims adjustment and disbursal": "Adjustment",
    "Litigation and subrogation":      "Litigation",
  };

  // Chart geometry
  const ML=70, MR=24, MT=28, MB=64;
  const PW=470, PH=260;
  const W=ML+PW+MR, H=MT+PH+MB;
  const midX=ML+PW/2, midY=MT+PH/2;

  // Map l2 groups to x/y coords
  // X = Effort        = 100 - g.proc  (low proc → high effort → right)
  // Y = Benefit       = clamp(0, (80 - g.avg) * 1.25, 100)  (big gap → high benefit → top)
  const items = l2All.map((g, idx) => {
    const effort  = Math.min(100, Math.max(5,  100 - g.proc));
    const benefit = Math.min(100, Math.max(5,  (80 - g.avg) * 1.2));
    const x = ML + (effort  / 100) * PW;
    const y = MT + PH - (benefit / 100) * PH;   // invert: high benefit = top
    const col = DOMAIN_COLORS[g.domain] || "#64748B";
    // smart label side: right if left half, else left
    const anchor = x > ML + PW * 0.6 ? "end" : "start";
    const lx     = anchor === "start" ? x + 9 : x - 9;
    // smart label vertical: below if top 30%, else above
    const ly     = y < MT + PH * 0.3 ? y + 16 : y - 8;
    return { ...g, x, y, col, anchor, lx, ly, idx };
  });

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", maxWidth: W, display:"block" }}>

      {/* Quadrant backgrounds */}
      <rect x={ML}      y={MT}       width={PW/2} height={PH/2} fill="#FFFDF0" opacity={0.6}/>
      <rect x={ML+PW/2} y={MT}       width={PW/2} height={PH/2} fill="#EFF6FF" opacity={0.6}/>
      <rect x={ML}      y={MT+PH/2}  width={PW/2} height={PH/2} fill="#F0FDF4" opacity={0.6}/>
      <rect x={ML+PW/2} y={MT+PH/2}  width={PW/2} height={PH/2} fill="#F8FAFC" opacity={0.6}/>

      {/* Outer border */}
      <rect x={ML} y={MT} width={PW} height={PH} fill="none" stroke="#E2E8F0" strokeWidth={1}/>

      {/* Quadrant dividers */}
      <line x1={midX} y1={MT}    x2={midX}    y2={MT+PH} stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="6 4"/>
      <line x1={ML}   y1={midY}  x2={ML+PW}   y2={midY}  stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="6 4"/>

      {/* Subtle grid lines */}
      {[25,75].map(p => (
        <g key={p}>
          <line x1={ML+(p/100)*PW} y1={MT} x2={ML+(p/100)*PW} y2={MT+PH} stroke="#F1F5F9" strokeWidth={1}/>
          <line x1={ML} y1={MT+(p/100)*PH} x2={ML+PW} y2={MT+(p/100)*PH} stroke="#F1F5F9" strokeWidth={1}/>
        </g>
      ))}

      {/* Quadrant labels — faint corner text */}
      {[
        { x: ML+8,       y: MT+14,    label: "QUICK WINS",         col: "#D97706" },
        { x: ML+PW-8,    y: MT+14,    label: "STRATEGIC PRIORITY", col: "#2563EB", anchor: "end" },
        { x: ML+8,       y: MT+PH-8,  label: "MAINTAIN & SCALE",   col: "#059669" },
        { x: ML+PW-8,    y: MT+PH-8,  label: "MONITOR",            col: "#94A3B8", anchor: "end" },
      ].map(q => (
        <text key={q.label} x={q.x} y={q.y} textAnchor={q.anchor||"start"}
          fontSize={8} fontWeight={700} letterSpacing="0.1em" fill={q.col} opacity={0.55}
          fontFamily="Arial">{q.label}</text>
      ))}

      {/* Y-axis — left */}
      <line x1={ML} y1={MT} x2={ML} y2={MT+PH} stroke="#94A3B8" strokeWidth={1.5}/>
      {/* Y arrow */}
      <polygon points={`${ML},${MT} ${ML-4},${MT+9} ${ML+4},${MT+9}`} fill="#94A3B8"/>
      {/* Y axis ticks */}
      <text x={ML-6} y={MT+8}    textAnchor="end" fontSize={9} fill="#64748B" fontFamily="Arial">High</text>
      <text x={ML-6} y={MT+PH}   textAnchor="end" fontSize={9} fill="#64748B" fontFamily="Arial">Low</text>
      {/* Y axis title */}
      <text x={14} y={MT+PH/2} textAnchor="middle" fontSize={10} fontWeight={700}
        fill="#1B2B4B" fontFamily="Arial"
        transform={`rotate(-90 14 ${MT+PH/2})`}>Benefit Realization</text>

      {/* X-axis — bottom */}
      <line x1={ML} y1={MT+PH} x2={ML+PW} y2={MT+PH} stroke="#94A3B8" strokeWidth={1.5}/>
      {/* X arrow */}
      <polygon points={`${ML+PW},${MT+PH} ${ML+PW-9},${MT+PH-4} ${ML+PW-9},${MT+PH+4}`} fill="#94A3B8"/>
      {/* X axis ticks */}
      <text x={ML}     y={MT+PH+14} textAnchor="middle" fontSize={9} fill="#64748B" fontFamily="Arial">Low</text>
      <text x={ML+PW}  y={MT+PH+14} textAnchor="middle" fontSize={9} fill="#64748B" fontFamily="Arial">High</text>
      {/* X axis title */}
      <text x={ML+PW/2} y={H-8} textAnchor="middle" fontSize={10} fontWeight={700}
        fill="#1B2B4B" fontFamily="Arial">Effort to Implement</text>

      {/* Data points */}
      {items.map(item => (
        <g key={item.l2}>
          {/* Shadow ring */}
          <circle cx={item.x} cy={item.y} r={9} fill={item.col} opacity={0.12}/>
          {/* Outer ring */}
          <circle cx={item.x} cy={item.y} r={7} fill="white"
            stroke={item.col} strokeWidth={2}/>
          {/* Inner fill */}
          <circle cx={item.x} cy={item.y} r={3.5} fill={item.col}/>
          {/* Label */}
          <text x={item.lx} y={item.ly} textAnchor={item.anchor}
            fontSize={9} fill={item.col} fontWeight={600} fontFamily="Arial"
            style={{ textShadow: "0 0 3px white" }}>
            {item.l2.length > 30 ? item.l2.slice(0,30)+"…" : item.l2}
          </text>
        </g>
      ))}

      {/* Legend — domain colors */}
      {Object.entries(DOMAIN_SHORT).filter(([d]) => l2All.some(g => g.domain === d)).map(([d, short], i) => (
        <g key={d} transform={`translate(${ML + i * 94}, ${H-16})`}>
          <circle cx={5} cy={5} r={4} fill="white" stroke={DOMAIN_COLORS[d]} strokeWidth={2}/>
          <circle cx={5} cy={5} r={2} fill={DOMAIN_COLORS[d]}/>
          <text x={13} y={9} fontSize={8} fill="#64748B" fontFamily="Arial">{short}</text>
        </g>
      ))}
    </svg>
  );
}


// ── Main Page ───────────────────────────────────────────────────────────────
export default function Page8({
  onBack,
  onDashboard,
  maturityScores = {},
  carrierInfo = {},
}) {
  // ── Compute domain scores from maturityScores ──────────────────────────
  const { domainScores, activeDomains } = useMemo(() => {
    const byDomain = {};
    DOMAIN_ORDER.forEach(d => { byDomain[d] = []; });

    // Group each scored l3 key into its l1 domain
    const l3Keys = [...new Set(
      Object.keys(maturityScores)
        .filter(k => k.endsWith("_tech") || k.endsWith("_proc"))
        .map(k => k.replace(/_tech$|_proc$/, ""))
    )];

    l3Keys.forEach(k => {
      const info = L3_MAP[k];
      if (!info?.l1 || !byDomain[info.l1]) return;
      const t = toScore(maturityScores[k + "_tech"]);
      const p = toScore(maturityScores[k + "_proc"]);
      if (t !== null && p !== null) {
        byDomain[info.l1].push({ l3: k, l2: info.l2, tech: t, proc: p, avg: Math.round((t + p) / 2) });
      }
    });

    const domainScores = {};
    DOMAIN_ORDER.forEach(d => {
      const items = byDomain[d];
      if (!items.length) return;
      const avgTech = Math.round(items.reduce((a, r) => a + r.tech, 0) / items.length);
      const avgProc = Math.round(items.reduce((a, r) => a + r.proc, 0) / items.length);
      const avg     = Math.round((avgTech + avgProc) / 2);
      // Group by l2 process area
      const l2Map = {};
      items.forEach(r => {
        if (!l2Map[r.l2]) l2Map[r.l2] = [];
        l2Map[r.l2].push(r);
      });
      const l2Groups = Object.entries(l2Map).map(([l2, rows]) => ({
        l2,
        tech: Math.round(rows.reduce((a, r) => a + r.tech, 0) / rows.length),
        proc: Math.round(rows.reduce((a, r) => a + r.proc, 0) / rows.length),
        avg:  Math.round(rows.reduce((a, r) => a + r.avg, 0) / rows.length),
        count: rows.length,
      }));
      domainScores[d] = { tech: avgTech, proc: avgProc, avg, l2Groups };
    });

    return {
      domainScores,
      activeDomains: DOMAIN_ORDER.filter(d => domainScores[d]),
    };
  }, [maturityScores]);

  const scored = Object.keys(maturityScores).filter(k => k.endsWith("_tech")).length;

  // ── Overall stats ─────────────────────────────────────────────────────
  const overallTech = activeDomains.length
    ? Math.round(activeDomains.reduce((a, d) => a + domainScores[d].tech, 0) / activeDomains.length) : 0;
  const overallProc = activeDomains.length
    ? Math.round(activeDomains.reduce((a, d) => a + domainScores[d].proc, 0) / activeDomains.length) : 0;
  const overallAvg  = Math.round((overallTech + overallProc) / 2);

  const allAvgs = activeDomains.flatMap(d => domainScores[d].l2Groups.map(g => g.avg));
  const criticalCount = allAvgs.filter(s => s < 40).length;
  const bicCount      = allAvgs.filter(s => s >= 80).length;

  const overallLabel = overallAvg >= 80 ? "Best in Class" : overallAvg >= 60 ? "Intermediate" : "Basic";

  // ── Priority quadrant ────────────────────────────────────────────────
  const l2All = activeDomains.flatMap(d =>
    domainScores[d].l2Groups.map(g => ({ ...g, domain: d }))
  );
  // chart uses l2All directly — quadrant logic retained for roadmap only
  const qStrategic    = l2All.filter(g => g.avg < 50);
  const qMaintain     = l2All.filter(g => g.avg >= 80).slice(0, 5);
  const qDeprioritize = l2All.filter(g => g.avg >= 60 && g.avg < 80);

  // ── Auto-roadmap ─────────────────────────────────────────────────────
  const sorted = [...l2All].sort((a, b) => a.avg - b.avg);
  const roadmap = [
    { horizon: "Immediate (0–90 Days)",   color: "#DC2626", items: sorted.slice(0, 3) },
    { horizon: "Short-Term (3–6 Months)", color: "#D97706", items: sorted.slice(3, 6) },
    { horizon: "Strategic (6–12 Months)", color: "#059669", items: qMaintain.slice(0, 3) },
  ];

  // ── Auto-findings ─────────────────────────────────────────────────────
  const sortedDomains = [...activeDomains].sort((a, b) => domainScores[a].avg - domainScores[b].avg);
  const worstDomain   = sortedDomains[0];
  const bestDomain    = sortedDomains[sortedDomains.length - 1];
  const techLagger    = [...activeDomains]
    .sort((a, b) => (domainScores[a].proc - domainScores[a].tech) - (domainScores[b].proc - domainScores[b].tech))
    .pop();
  const techGap = techLagger ? domainScores[techLagger]?.proc - domainScores[techLagger]?.tech : 0;

  // ── Shared styles ─────────────────────────────────────────────────────
  const NAV = "#1B2B4B", BLU = "#2563EB", TEAL = "#0F766E";
  const BOX = { borderRadius: 14, border: "1px solid #E2E8F0", background: "white", overflow: "hidden", marginBottom: 18 };
  const SH  = { padding: "16px 22px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" };
  const STAG = { fontSize: 10, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 6, background: "#EFF6FF", color: BLU };

  // ── Empty state ──────────────────────────────────────────────────────
  if (scored === 0) {
    return (
      <div style={{ background: C.bg, minHeight: "calc(100vh - 64px)" }}>
        <div style={{ maxWidth: 680, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <div style={{ fontFamily: FONT.serif, fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 8 }}>
            No process scores yet
          </div>
          <div style={{ fontFamily: FONT.sans, fontSize: 14, color: C.textSoft, marginBottom: 28, lineHeight: 1.7 }}>
            Complete the Process Maturity Assessment (Step 5) to see your diagnostic results here.
          </div>
          <button onClick={onBack} style={{ ...btnSecondary, borderRadius: 8 }}>
            <ArrowLeft size={14}/> Back to Maturity Scoring
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "calc(100vh - 64px)", paddingBottom: 40 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 24px" }}>

        {/* ── HEADER BANNER ── */}
        <div style={{
          background: "linear-gradient(135deg, #1B2B4B 0%, #2D4A7A 58%, #0F766E 100%)",
          borderRadius: 16, padding: "30px 40px", marginBottom: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ marginBottom: 6 }}><Tag color="forest" style={{ opacity: .6 }}>Process Maturity Results</Tag></div>
            <div style={{ fontFamily: FONT.serif, fontSize: 24, fontWeight: 700, color: "white", letterSpacing: "-.02em", marginBottom: 4 }}>
              {carrierInfo?.name ? `${carrierInfo.name} — ` : ""}Process Maturity Assessment
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", marginBottom: 16 }}>
              {scored} sub-processes scored · {activeDomains.length} domain{activeDomains.length !== 1 ? "s" : ""} · Tier {carrierInfo?.tier || "—"}
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              {[
                ["Overall Maturity", overallLabel],
                ["Domains Assessed", activeDomains.length],
                ["Processes Scored", scored],
              ].map(([lbl, val]) => (
                <div key={lbl}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", letterSpacing: ".07em", textTransform: "uppercase" }}>{lbl}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <ScoreDial score={overallAvg} size={120}/>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", letterSpacing: ".08em", textTransform: "uppercase", marginTop: 6 }}>
              Overall Score
            </div>
          </div>
        </div>

        {/* ── KPI STRIP ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
          {[
            { label: "Technology Maturity", value: overallTech, sub: "Avg across all processes", accent: BLU },
            { label: "Process Maturity",    value: overallProc, sub: "Avg across all processes", accent: TEAL },
            { label: "Critical Gaps",       value: criticalCount, sub: "Processes scoring < 40", accent: "#DC2626" },
            { label: "Best-in-Class",       value: bicCount,      sub: "Processes scoring ≥ 80", accent: "#059669" },
          ].map(k => (
            <div key={k.label} style={{ ...card, padding: "18px 20px", borderTop: `3px solid ${k.accent}` }}>
              <div style={{ fontFamily: FONT.sans, fontSize: 9, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontFamily: FONT.mono, fontSize: 30, fontWeight: 800, color: k.accent, lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, marginTop: 4 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── RADAR + DOMAIN TABLE ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>

          <div style={BOX}>
            <div style={SH}>
              <div>
                <div style={{ fontFamily: FONT.serif, fontSize: 14, fontWeight: 700, color: NAV }}>Domain Maturity Radar</div>
                <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, marginTop: 2 }}>Technology vs Process scores by domain</div>
              </div>
              <span style={STAG}>Radar</span>
            </div>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <RadarChart domainScores={domainScores}/>
              <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                {[
                  { color: BLU, label: "Technology", dash: false },
                  { color: "#0EA5E9", label: "Process", dash: true },
                  { color: "#059669", label: "BIC (80)", dash: true },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.textMuted }}>
                    <svg width={16} height={8}>
                      <line x1={0} y1={4} x2={16} y2={4} stroke={r.color} strokeWidth={r.dash ? 1.5 : 2}
                        strokeDasharray={r.dash ? "4 2" : "none"}/>
                    </svg>
                    {r.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ ...BOX, marginBottom: 0 }}>
            <div style={SH}>
              <div>
                <div style={{ fontFamily: FONT.serif, fontSize: 14, fontWeight: 700, color: NAV }}>Domain Score Summary</div>
                <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, marginTop: 2 }}>Technology · Process · Gap to Best-in-Class</div>
              </div>
              <span style={STAG}>{activeDomains.length} Domains</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["Domain", "Tech", "Process", "Avg", "Gap to BIC"].map((h, i) => (
                    <th key={h} style={{ padding: "9px 14px", fontSize: 9, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: C.textMuted, textAlign: i > 0 ? "center" : "left", borderBottom: "2px solid #E2E8F0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeDomains.map((d, i) => {
                  const ds = domainScores[d];
                  const gap = Math.max(0, 80 - ds.avg);
                  return (
                    <tr key={d} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "white" : "#FAFAFA" }}>
                      <td style={{ padding: "11px 14px", fontSize: 11, fontWeight: 600, color: NAV }}>{DOMAIN_DISPLAY[d]?.label}</td>
                      <td style={{ textAlign: "center", padding: "11px 8px" }}><ScorePill value={ds.tech}/></td>
                      <td style={{ textAlign: "center", padding: "11px 8px" }}><ScorePill value={ds.proc}/></td>
                      <td style={{ textAlign: "center", padding: "11px 8px" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: scoreColor(ds.avg) }}>{ds.avg}</span>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div style={{ flex: 1, height: 5, background: "#E2E8F0", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${Math.min((ds.avg / 80) * 100, 100)}%`, background: scoreColor(ds.avg), borderRadius: 3 }}/>
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: gap > 20 ? "#DC2626" : gap > 10 ? "#D97706" : "#059669", width: 36 }}>
                            {gap > 0 ? `▼ ${gap}` : "✓ BIC"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── PROCESS HEATMAP ── */}
        <div style={BOX}>
          <div style={{ ...SH, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontFamily: FONT.serif, fontSize: 14, fontWeight: 700, color: NAV }}>Process-Level Maturity Heatmap</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, marginTop: 2 }}>Technology and Process scores for each assessed process area</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {[["#059669", "≥ 80 Best in Class"], ["#D97706", "60–79 Intermediate"], ["#DC2626", "< 60 Basic"]].map(([c, l]) => (
                <span key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: c }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: scoreBg(c === "#059669" ? 80 : c === "#D97706" ? 65 : 40), border: `1px solid ${c}`, display: "inline-block" }}/>
                  {l}
                </span>
              ))}
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["Process Area", "Technology", "Process", "Average", "Maturity Bar", "Priority"].map((h, i) => (
                  <th key={h} style={{ padding: "9px 14px", fontSize: 9, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: C.textMuted, textAlign: i > 0 ? "center" : "left", borderBottom: "2px solid #1B2B4B", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeDomains.map(d => {
                const ds = domainScores[d];
                return [
                  <tr key={`hdr-${d}`}>
                    <td colSpan={6} style={{ padding: "7px 14px 4px", fontSize: 9, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: C.textMuted, background: "#F8FAFC", borderTop: "2px solid #E2E8F0", borderBottom: "1px solid #E2E8F0" }}>
                      {DOMAIN_DISPLAY[d]?.label} — Domain avg: {ds.avg}
                    </td>
                  </tr>,
                  ...ds.l2Groups.map((g, gi) => {
                    const pri      = g.avg < 40 ? "🔴 Critical" : g.avg < 60 ? "🟠 High" : g.avg < 80 ? "🟡 Medium" : "✅ Sustain";
                    const priColor = g.avg < 40 ? "#DC2626" : g.avg < 60 ? "#D97706" : g.avg < 80 ? "#92400E" : "#059669";
                    const name     = g.l2.length > 42 ? g.l2.slice(0, 42) + "…" : g.l2;
                    return (
                      <tr key={g.l2} style={{ borderBottom: "1px solid #f1f5f9", background: gi % 2 === 0 ? "white" : "#FAFAFA" }}>
                        <td style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: NAV }}>{name}</td>
                        <td style={{ textAlign: "center", padding: "10px 8px" }}><ScorePill value={g.tech}/></td>
                        <td style={{ textAlign: "center", padding: "10px 8px" }}><ScorePill value={g.proc}/></td>
                        <td style={{ textAlign: "center", padding: "10px 8px" }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor(g.avg) }}>{g.avg}</span>
                        </td>
                        <td style={{ padding: "10px 14px", minWidth: 130 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ flex: 1, height: 7, background: "#E2E8F0", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                              <div style={{ position: "absolute", left: "80%", top: 0, bottom: 0, width: 1, background: "#94A3B8", opacity: .5 }}/>
                              <div style={{ height: "100%", width: `${g.avg}%`, background: scoreColor(g.avg), borderRadius: 4 }}/>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: scoreColor(g.avg), width: 22, textAlign: "right" }}>{g.avg}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 14px", fontSize: 11, fontWeight: 600, color: priColor, whiteSpace: "nowrap" }}>{pri}</td>
                      </tr>
                    );
                  }),
                ];
              })}
            </tbody>
          </table>
        </div>

        {/* ── PRIORITY MATRIX + FINDINGS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>

          {/* Priority Matrix — SVG scatter chart */}
          <div style={BOX}>
            <div style={SH}>
              <div>
                <div style={{ fontFamily: FONT.serif, fontSize: 14, fontWeight: 700, color: NAV }}>Improvement Priority Matrix</div>
                <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                  Y-axis: Benefit Realization (gap to Best-in-Class) · X-axis: Effort to implement
                </div>
              </div>
              <span style={STAG}>Scatter</span>
            </div>
            <div style={{ padding: "12px 16px 16px" }}>
              <PriorityMatrix l2All={l2All}/>
            </div>
          </div>

          {/* Findings */}
          <div style={{ ...BOX, marginBottom: 0 }}>
            <div style={SH}>
              <div>
                <div style={{ fontFamily: FONT.serif, fontSize: 14, fontWeight: 700, color: NAV }}>Key Findings</div>
                <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, marginTop: 2 }}>Auto-generated diagnostic insights</div>
              </div>
              <span style={STAG}>Insights</span>
            </div>
            <div style={{ padding: "12px 20px" }}>
              {[
                worstDomain && {
                  Icon: AlertTriangle, iconColor: "#DC2626", bg: "#FEF2F2",
                  title: `${DOMAIN_DISPLAY[worstDomain]?.label} is the critical gap — ${domainScores[worstDomain]?.avg}/100`,
                  body: `This domain has the lowest combined maturity score. Targeted investment here will deliver the highest ROI on maturity improvement. Consider immediate action items from the Priority Matrix above.`,
                  tag: { l: "Critical Gap", c: "#DC2626", bg: "#FEF2F2" },
                },
                bestDomain && domainScores[bestDomain]?.avg >= 55 && {
                  Icon: Lightbulb, iconColor: "#D97706", bg: "#FFFBEB",
                  title: `${DOMAIN_DISPLAY[bestDomain]?.label} is your strongest anchor — ${domainScores[bestDomain]?.avg}/100`,
                  body: `This domain shows the highest combined maturity. Document the workflows and tools driving these scores and use them as templates for lower-performing domains.`,
                  tag: { l: "Strength", c: "#059669", bg: "#ECFDF5" },
                },
                techGap > 8 && techLagger && {
                  Icon: Target, iconColor: "#2563EB", bg: "#EFF6FF",
                  title: `Technology lags Process in ${DOMAIN_DISPLAY[techLagger]?.label} (gap: +${techGap}pts)`,
                  body: `Process discipline outpaces enabling technology in this domain. Strong institutional knowledge exists — the priority is technology uplift to automate and scale what practitioners already do well.`,
                  tag: { l: "Tech Uplift", c: "#1D4ED8", bg: "#EFF6FF" },
                },
              ].filter(Boolean).map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <f.Icon size={15} color={f.iconColor} strokeWidth={2}/>
                  </div>
                  <div>
                    <div style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 700, color: NAV, marginBottom: 3 }}>{f.title}</div>
                    <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textSoft, lineHeight: 1.6 }}>{f.body}</div>
                    <span style={{ display: "inline-flex", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, color: f.tag.c, background: f.tag.bg, marginTop: 6 }}>{f.tag.l}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROADMAP ── */}
        <div style={BOX}>
          <div style={SH}>
            <div>
              <div style={{ fontFamily: FONT.serif, fontSize: 14, fontWeight: 700, color: NAV }}>Recommended Transformation Roadmap</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, marginTop: 2 }}>Sequenced improvement actions across three planning horizons — based on your scores</div>
            </div>
            <span style={STAG}>90-Day · 6-Month · 12-Month</span>
          </div>
          <div style={{ padding: 22, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {roadmap.map(col => (
              <div key={col.horizon}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: col.color, marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${col.color}33` }}>
                  {col.horizon}
                </div>
                {col.items.length ? col.items.map((g, i) => (
                  <div key={g.l2} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${col.color}22`, border: `1.5px solid ${col.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: col.color, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                    <div>
                      <div style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 700, color: NAV, lineHeight: 1.4 }}>
                        {g.l2.length > 40 ? g.l2.slice(0, 40) + "…" : g.l2}
                      </div>
                      <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, marginTop: 2, lineHeight: 1.5 }}>
                        {col.color === "#059669"
                          ? `Score ${g.avg}/100 — already strong; scale and institutionalise`
                          : `Score ${g.avg}/100 — ${g.avg < 40 ? "standardise process & deploy quick-win technology" : "structured programme with technology investment"}`}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, fontStyle: "italic" }}>No items in this horizon</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 8px" }}>
          <button onClick={onBack} style={{ ...btnSecondary, borderRadius: 7 }}>
            <ArrowLeft size={14}/> Back to Scoring
          </button>
          <div style={{ fontFamily: FONT.sans, fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>
            Combined Results (Metrics + Process) — coming next
          </div>
          <button onClick={onDashboard} style={{ ...btnSecondary, borderRadius: 7, display: "flex", alignItems: "center", gap: 6 }}>
            <Home size={14}/> Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
