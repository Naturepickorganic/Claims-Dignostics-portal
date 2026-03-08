import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronRight, Info, CheckCircle2 } from "lucide-react";
import { C, FONT, btnPrimary, btnSecondary, btnGold, card } from "../constants.js";
import { Tag } from "../components.jsx";
import { QUESTIONS_DATA } from "../questionsData.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const L1_MATCH = {
  "Initial Claims Processing":          "Initial claims processing",
  "Claims Review & Investigation":      "Claims review and investigation",
  "Fraud Detection & Management":       "Fraud detection and management",
  "Claims Adjustment & Disbursement":   "Claims adjustment and disbursal",
  "Litigation & Subrogation":           "Litigation and subrogation",
};

const SCALE_LABELS = [
  "1 — Minimal or no alignment with best-in-class practices; significant improvements needed",
  "2 — Partial alignment with best-in-class practices; multiple areas require enhancement",
  "3 — Some alignment with best-in-class practices; opportunities exist for optimization",
  "4 — Strong alignment with best-in-class practices; minor gaps remain",
  "5 — Fully aligned with best-in-class practices; no significant improvements required",
];
const SCALE_SHORT  = ["1 — Minimal","2 — Partial","3 — Some","4 — Strong","5 — Fully Aligned"];
const SCALE_COLORS = ["#dc2626","#ea580c","#ca8a04","#16a34a","#166534"];
const SCALE_BG     = ["#fef2f2","#fff7ed","#fefce8","#f0fdf4","#dcfce7"];
const SCALE_BORDER = ["#fca5a5","#fdba74","#fde047","#86efac","#4ade80"];

// Map l2 names from Page6 selections to questionsData l2 names (fuzzy)
function normalise(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchL2(selName, dataL2) {
  const sn = normalise(selName);
  return normalise(dataL2).includes(sn.slice(0, 12)) || sn.includes(normalise(dataL2).slice(0, 12));
}

// ─── Score pill ───────────────────────────────────────────────────────────────
function ScorePill({ value, onChange, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <div style={{ fontSize: 11, fontWeight: 600, color: C.textMid, marginBottom: 2 }}>{label}</div>}
      <div style={{ display: "flex", gap: 4 }}>
        {[1,2,3,4,5].map(n => (
          <button
            key={n}
            onClick={() => onChange(n === value ? null : n)}
            title={SCALE_LABELS[n-1]}
            style={{
              width: 36, height: 36, borderRadius: 7, border: "2px solid",
              borderColor: value === n ? SCALE_COLORS[n-1] : "#e2e8f0",
              background: value === n ? SCALE_BG[n-1] : "white",
              color: value === n ? SCALE_COLORS[n-1] : C.textMuted,
              fontWeight: value === n ? 800 : 400,
              fontSize: 13, cursor: "pointer", transition: "all 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {n}
          </button>
        ))}
      </div>
      {value && (
        <div style={{ fontSize: 10, color: SCALE_COLORS[value-1], background: SCALE_BG[value-1], border: "1px solid " + SCALE_BORDER[value-1], borderRadius: 4, padding: "3px 8px", lineHeight: 1.4, maxWidth: 280 }}>
          {SCALE_LABELS[value-1]}
        </div>
      )}
    </div>
  );
}

// ─── L3 question row ──────────────────────────────────────────────────────────
function L3Row({ item, scores, onScore }) {
  const [expanded, setExpanded] = useState(false);
  const techScore = scores[item.l3 + "_tech"] || null;
  const procScore = scores[item.l3 + "_proc"] || null;
  const bothScored = techScore && procScore;

  return (
    <div style={{
      border: "1px solid " + (bothScored ? "#bbf7d0" : "#e2e8f0"),
      borderRadius: 10, marginBottom: 8, overflow: "hidden",
      background: bothScored ? "#f9fffe" : "white",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      {/* Row header */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", cursor: "pointer" }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {bothScored
              ? <CheckCircle2 size={13} color="#166534" />
              : <div style={{ width: 13, height: 13, borderRadius: "50%", border: "1.5px solid #cbd5e1" }} />
            }
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{item.l3}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {/* Mini score display */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: C.textMuted }}>Tech</span>
            {techScore
              ? <span style={{ fontSize: 11, fontWeight: 700, color: SCALE_COLORS[techScore-1], background: SCALE_BG[techScore-1], borderRadius: 4, padding: "1px 7px" }}>{techScore}</span>
              : <span style={{ fontSize: 10, color: "#cbd5e1" }}>--</span>
            }
            <span style={{ fontSize: 10, color: C.textMuted }}>Process</span>
            {procScore
              ? <span style={{ fontSize: 11, fontWeight: 700, color: SCALE_COLORS[procScore-1], background: SCALE_BG[procScore-1], borderRadius: 4, padding: "1px 7px" }}>{procScore}</span>
              : <span style={{ fontSize: 10, color: "#cbd5e1" }}>--</span>
            }
          </div>
          {expanded ? <ChevronDown size={14} color={C.textMuted} /> : <ChevronRight size={14} color={C.textMuted} />}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "14px 16px", background: "#fafbfc" }}>
          {/* Maturity levels reference */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
            {["Basic","Intermediate","BestInClass"].map((lvl, i) => {
              const label = lvl === "BestInClass" ? "Best-in-Class" : lvl;
              const bgs = ["#fff1f2","#fffbeb","#f0fdf4"];
              const brs = ["#fecdd3","#fde68a","#bbf7d0"];
              const clrs = ["#e11d48","#b45309","#166534"];
              return (
                <div key={lvl} style={{ background: bgs[i], border: "1px solid " + brs[i], borderRadius: 8, padding: "9px 11px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: clrs[i], marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                  {item[lvl]?.tech && (
                    <div style={{ marginBottom: 5 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, marginBottom: 2 }}>TECHNOLOGY</div>
                      <div style={{ fontSize: 11, color: C.textMid, lineHeight: 1.55 }}>{item[lvl].tech}</div>
                    </div>
                  )}
                  {item[lvl]?.proc && (
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, marginBottom: 2 }}>PROCESS</div>
                      <div style={{ fontSize: 11, color: C.textMid, lineHeight: 1.55 }}>{item[lvl].proc}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Scoring — Process first, then Technology */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Section divider label */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Score this sub-process</span>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 16, alignItems: "flex-start" }}>
              {/* Process first */}
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
                  <span>◎</span> Process Maturity
                </div>
                <ScorePill value={procScore} onChange={v => onScore(item.l3 + "_proc", v)} />
              </div>
              {/* Technology second */}
              <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
                  <span>⚙</span> Technology Maturity
                </div>
                <ScorePill value={techScore} onChange={v => onScore(item.l3 + "_tech", v)} />
              </div>
              {/* Combined score */}
              {techScore && procScore && (
                <div style={{ textAlign: "center", padding: "14px 16px", background: "white", border: "2px solid " + SCALE_COLORS[Math.round((techScore+procScore)/2)-1], borderRadius: 8, alignSelf: "center" }}>
                  <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Combined</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: SCALE_COLORS[Math.round((techScore+procScore)/2)-1], fontFamily: "monospace", lineHeight: 1 }}>
                    {((techScore + procScore) / 2).toFixed(1)}
                  </div>
                  <div style={{ fontSize: 9, color: SCALE_COLORS[Math.round((techScore+procScore)/2)-1], marginTop: 3 }}>avg</div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ─── L2 section ───────────────────────────────────────────────────────────────
function L2Section({ l2Name, items, scores, onScore }) {
  const [open, setOpen] = useState(true);
  const scored = items.filter(it => scores[it.l3+"_tech"] && scores[it.l3+"_proc"]).length;
  const pct = Math.round((scored / items.length) * 100);

  return (
    <div style={{ ...card, marginBottom: 14, overflow: "hidden" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", cursor: "pointer", background: open ? "#f8fafc" : "white", borderBottom: open ? "1px solid #e2e8f0" : "none" }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{l2Name}</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{items.length} sub-processes · {scored} scored</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 80, height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: pct + "%", background: pct === 100 ? "#166534" : "#1a4731", borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 11, fontFamily: "monospace", color: pct === 100 ? "#166534" : C.textSoft, fontWeight: 600, minWidth: 32 }}>{pct}%</span>
          {open ? <ChevronDown size={15} color={C.textMuted} /> : <ChevronRight size={15} color={C.textMuted} />}
        </div>
      </div>
      {open && (
        <div style={{ padding: "12px 14px" }}>
          {items.map(item => (
            <L3Row key={item.l3} item={item} scores={scores} onScore={onScore} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Page7({ onNext, onBack, processSelections = [] }) {
  const [scores, setScores] = useState({});
  const [activeL1, setActiveL1] = useState(null);

  const setScore = (key, val) => setScores(prev => {
    const next = { ...prev };
    if (val === null) delete next[key]; else next[key] = val;
    return next;
  });

  // Build filtered question set from selections
  const questionGroups = useMemo(() => {
    // If no selections, show everything
    const allL1 = [...new Set(QUESTIONS_DATA.map(q => q.l1))];

    if (!processSelections.length) {
      return allL1.map(l1 => {
        const l2s = [...new Set(QUESTIONS_DATA.filter(q => q.l1 === l1).map(q => q.l2))];
        return {
          l1Display: Object.keys(L1_MATCH).find(k => L1_MATCH[k] === l1) || l1,
          l1Key: l1,
          l2Groups: l2s.map(l2 => ({
            l2,
            items: QUESTIONS_DATA.filter(q => q.l1 === l1 && q.l2 === l2),
          })),
        };
      });
    }

    // Filter to selected l1/l2
    const grouped = {};
    processSelections.forEach(sel => {
      const l1Key = L1_MATCH[sel.l1] || sel.l1;
      if (!grouped[l1Key]) grouped[l1Key] = new Set();
      grouped[l1Key].add(sel.name);
    });

    return Object.entries(grouped).map(([l1Key, selL2Names]) => {
      const l2s = [...new Set(QUESTIONS_DATA.filter(q => q.l1 === l1Key).map(q => q.l2))];
      const filteredL2s = l2s.filter(l2 =>
        [...selL2Names].some(sn => matchL2(sn, l2))
      );
      // fallback: if nothing matched, include all l2s for this l1
      const finalL2s = filteredL2s.length ? filteredL2s : l2s;
      return {
        l1Display: Object.keys(L1_MATCH).find(k => L1_MATCH[k] === l1Key) || l1Key,
        l1Key,
        l2Groups: finalL2s.map(l2 => ({
          l2,
          items: QUESTIONS_DATA.filter(q => q.l1 === l1Key && q.l2 === l2),
        })),
      };
    });
  }, [processSelections]);

  const totalItems = questionGroups.reduce((a, g) => a + g.l2Groups.reduce((b, l2) => b + l2.items.length, 0), 0);
  const scoredItems = Object.keys(scores).filter(k => k.endsWith("_tech")).filter(k => scores[k] && scores[k.replace("_tech","_proc")]).length;
  const pctDone = totalItems ? Math.round((scoredItems / totalItems) * 100) : 0;

  const activeGroup = questionGroups.find(g => g.l1Key === activeL1) || questionGroups[0];

  return (
    <div style={{ background: C.bg, minHeight: "calc(100vh - 64px)", paddingBottom: 90 }}>

      {/* ── Header ── */}
      <div style={{ background: "white", borderBottom: "1px solid " + C.border, padding: "18px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 6 }}><Tag>Step 5 of 6</Tag></div>
          <h1 style={{ fontWeight: 800, fontSize: 22, color: C.text, fontFamily: FONT.serif, marginBottom: 6 }}>
            Process Maturity Assessment
          </h1>
          <p style={{ fontSize: 13, color: C.textSoft, maxWidth: 680, lineHeight: 1.65 }}>
            For each sub-process below, review the maturity level descriptions and assign a score from 1 (Basic) to 5 (Best-in-Class) for both Technology and Process dimensions. Click any row to expand and score it.
          </p>

          {/* Progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
            <div style={{ flex: 1, maxWidth: 400, height: 6, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: pctDone + "%", background: pctDone === 100 ? "#166534" : "#1a4731", borderRadius: 4, transition: "width 0.4s" }} />
            </div>
            <span style={{ fontSize: 12, color: pctDone === 100 ? "#166534" : C.textSoft, fontWeight: 600 }}>
              {scoredItems} of {totalItems} scored ({pctDone}%)
            </span>
          </div>

          {/* Scale legend — shown once at top only */}
          <div style={{ marginTop: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "10px 14px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>Scoring Scale</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SCALE_LABELS.map((l,i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: SCALE_COLORS[i], background: SCALE_BG[i], border: "1px solid " + SCALE_BORDER[i], borderRadius: 4, padding: "1px 7px" }}>{i+1}</span>
                  <span style={{ fontSize: 10, color: C.textSoft }}>{l.replace(/^\d+ — /, "")}</span>
                  {i < SCALE_LABELS.length-1 && <span style={{ color: "#d8ebe2", fontSize: 10 }}>·</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body: L1 sidebar + content ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px", display: "flex", gap: 18, alignItems: "flex-start" }}>

        {/* L1 Nav sidebar */}
        <div style={{ width: 210, flexShrink: 0 }}>
          <div style={{ ...card, padding: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, paddingLeft: 6 }}>Categories</div>
            {questionGroups.map(g => {
              const grpScored = g.l2Groups.reduce((a, l2) => a + l2.items.filter(it => scores[it.l3+"_tech"] && scores[it.l3+"_proc"]).length, 0);
              const grpTotal  = g.l2Groups.reduce((a, l2) => a + l2.items.length, 0);
              const isActive  = (activeL1 || questionGroups[0]?.l1Key) === g.l1Key;
              return (
                <div
                  key={g.l1Key}
                  onClick={() => setActiveL1(g.l1Key)}
                  style={{
                    padding: "9px 10px", borderRadius: 8, marginBottom: 4, cursor: "pointer",
                    background: isActive ? "#eff6ff" : "transparent",
                    border: "1px solid " + (isActive ? "#bfdbfe" : "transparent"),
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? "#1a4731" : C.textMid, lineHeight: 1.3, marginBottom: 3 }}>
                    {g.l1Display}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ flex: 1, height: 3, background: "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: (grpScored/grpTotal*100)+"%", background: grpScored===grpTotal?"#166534":"#1a4731", borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "monospace" }}>{grpScored}/{grpTotal}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1 }}>
          {activeGroup && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <h2 style={{ fontWeight: 700, fontSize: 16, color: C.text, fontFamily: FONT.serif }}>{activeGroup.l1Display}</h2>
                <div style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}>{activeGroup.l2Groups.length} process areas</div>
              </div>
              {activeGroup.l2Groups.map(l2g => (
                <L2Section
                  key={l2g.l2}
                  l2Name={l2g.l2}
                  items={l2g.items}
                  scores={scores}
                  onScore={setScore}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky footer ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "white", borderTop: "1px solid " + C.border,
        padding: "12px 24px", zIndex: 50,
        boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button style={btnSecondary} onClick={onBack}><ArrowLeft size={14} /> Back</button>
          <div style={{ fontSize: 12, color: C.textSoft, fontWeight: 500 }}>
            {pctDone === 100
              ? <span style={{ color: "#166534", fontWeight: 700 }}>All processes scored — ready to continue</span>
              : <span>{scoredItems} of {totalItems} scored · You can proceed with partial scores</span>
            }
          </div>
          <button style={btnPrimary} onClick={() => onNext(scores)}>
            View Results <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
