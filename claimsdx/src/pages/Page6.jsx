import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, X, Zap } from "lucide-react";
import { C, FONT, btnPrimary, btnSecondary, card } from "../constants.js";
import { Tag, PageWrap } from "../components.jsx";

// ─── Data ────────────────────────────────────────────────────────────────────
const PROCESS_DATA = [
  {
    l1: "Initial Claims Processing",
    colorKey: "blue",
    items: [
      { name: "FNOL",                                            status: "high" },
      { name: "Claims registration",                             status: "high" },
      { name: "Claims-related document intake",                  status: "normal" },
      { name: "Document indexing and scanning",                  status: "high" },
      { name: "Preliminary claims validation",                   status: "high" },
      { name: "Policy / coverage validation",                    status: "high" },
      { name: "Initial reserve setup",                           status: "high" },
      { name: "Claims correspondence",                           status: "normal" },
      { name: "Complexity assessment and segmentation",          status: "high" },
      { name: "Claims trigger / assignment",                     status: "normal" },
      { name: "Tertiary service support",                        status: "neutral" },
    ],
  },
  {
    l1: "Claims Review & Investigation",
    colorKey: "gold",
    items: [
      { name: "Loss / damage verification",                      status: "high" },
      { name: "Reviewing claims file",                           status: "normal" },
      { name: "Stakeholder follow-up",                           status: "high" },
      { name: "Field / desk appraisal",                          status: "high" },
      { name: "Flagging for fraud / litigation",                 status: "normal" },
      { name: "Loss estimation",                                 status: "high" },
      { name: "Loss report generation",                          status: "normal" },
      { name: "Claims research",                                 status: "neutral" },
    ],
  },
  {
    l1: "Fraud Detection & Management",
    colorKey: "pink",
    items: [
      { name: "Evaluate known fraud indicators",                 status: "high" },
      { name: "Gather additional documentation",                 status: "normal" },
      { name: "Add witnesses / claimants",                       status: "neutral" },
      { name: "Follow-up with claimants",                        status: "normal" },
      { name: "Run pattern analysis",                            status: "high" },
      { name: "Request additional inspection",                   status: "normal" },
      { name: "Flag claim, update claim file",                   status: "high" },
      { name: "Reassign claim to SIU",                           status: "high" },
      { name: "Investigation by SIU",                            status: "high" },
      { name: "Claim file updates by SIU",                       status: "normal" },
      { name: "Reassignment to claim handler",                   status: "neutral" },
      { name: "Follow for criminal prosecution",                 status: "neutral" },
    ],
  },
  {
    l1: "Claims Adjustment & Disbursement",
    colorKey: "green",
    items: [
      { name: "Adjusting reserves and adequacy",                 status: "high" },
      { name: "Compensability review",                           status: "normal" },
      { name: "Customer communication on settlement",            status: "normal" },
      { name: "Assess possibility of recovery",                  status: "high" },
      { name: "Claims summarisation",                            status: "normal" },
      { name: "General ledger accounting",                       status: "neutral" },
      { name: "Vendor invoicing and bill review",                status: "high" },
      { name: "Payment release",                                 status: "normal" },
      { name: "Negotiation, closure and settlement",             status: "high" },
      { name: "Internal reporting",                              status: "neutral" },
      { name: "Reconciliations",                                 status: "neutral" },
    ],
  },
  {
    l1: "Litigation & Subrogation",
    colorKey: "purple",
    items: [
      { name: "Assign legal / staff counsel",                    status: "high" },
      { name: "Claims audit",                                    status: "normal" },
      { name: "File management",                                 status: "neutral" },
      { name: "Reinsurance management",                          status: "normal" },
      { name: "Review recovery potential",                       status: "high" },
      { name: "Identify legal liability",                        status: "high" },
      { name: "Recovery evidence collection",                    status: "high" },
      { name: "Demand package prep",                             status: "high" },
      { name: "Recovery processing and recording",               status: "normal" },
      { name: "Salvage handling and processing",                 status: "normal" },
      { name: "Legal bill review",                               status: "high" },
      { name: "Regulatory and compliance reporting",             status: "neutral" },
    ],
  },
];

// ─── Color maps ───────────────────────────────────────────────────────────────
const COL_COLORS = {
  blue:   { header: "#1e3a5f", light: "#dbeafe", border: "#93c5fd" },
  gold:   { header: "#92400e", light: "#fef3c7", border: "#fcd34d" },
  pink:   { header: "#9f1239", light: "#fff1f2", border: "#fda4af" },
  green:  { header: "#1a4731", light: "#f0f7f3", border: "#c3ddd0" },
  purple: { header: "#3730a3", light: "#eef2ff", border: "#a5b4fc" },
};

const ROW_STYLE = {
  high:    { bg: "#fff1f2", border: "#fecdd3", dot: "#991b1b", label: "Needs attention" },
  normal:  { bg: "#f0fdf4", border: "#bbf7d0", dot: "#166534", label: "Acceptable"       },
  neutral: { bg: "#f8fafc", border: "#e2e8f0", dot: "#7a9688", label: "Not evaluated"    },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function L2Row({ item, l1, selected, onToggle }) {
  const rs = ROW_STYLE[item.status];
  const isSelected = selected;
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={() => onToggle(l1, item)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "7px 10px", borderRadius: 7, marginBottom: 4, cursor: "pointer",
        background: isSelected ? (item.status === "high" ? "#ffe4e6" : item.status === "normal" ? "#dcfce7" : "#e0f2fe") : rs.bg,
        border: "1.5px solid " + (isSelected ? "#1a4731" : hover ? "#94a3b8" : rs.border),
        boxShadow: isSelected ? "0 0 0 2px rgba(37,99,235,0.15)" : hover ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
        transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: rs.dot, flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: C.textMid, lineHeight: 1.4, fontWeight: isSelected ? 600 : 400 }}>
          {item.name}
        </span>
      </div>
      <div style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginLeft: 8,
        border: "1.5px solid " + (isSelected ? "#1a4731" : "#cbd5e1"),
        background: isSelected ? "#1a4731" : "white",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isSelected && <CheckCircle2 size={11} color="white" strokeWidth={3} />}
      </div>
    </div>
  );
}

function L1Column({ group, selections, onToggle }) {
  const cc = COL_COLORS[group.colorKey];
  const colSelected = group.items.filter(it =>
    selections.some(s => s.l1 === group.l1 && s.name === it.name)
  ).length;

  return (
    <div style={{
      flex: "1 1 0", minWidth: 180,
      background: "white", borderRadius: 14,
      border: "1px solid " + cc.border,
      boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Column header */}
      <div style={{
        background: cc.light, borderBottom: "2px solid " + cc.border,
        padding: "12px 14px",
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: cc.header, lineHeight: 1.3, marginBottom: 4 }}>
          {group.l1}
        </div>
        <div style={{ fontSize: 10, color: C.textMuted }}>
          {group.items.length} processes
          {colSelected > 0 && (
            <span style={{ marginLeft: 6, color: "#1a4731", fontWeight: 600 }}>
              · {colSelected} selected
            </span>
          )}
        </div>
      </div>

      {/* Rows */}
      <div style={{ padding: "10px 10px", flex: 1, overflowY: "auto" }}>
        {group.items.map(item => (
          <L2Row
            key={item.name}
            item={item}
            l1={group.l1}
            selected={selections.some(s => s.l1 === group.l1 && s.name === item.name)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Page6({ onNext, onBack, initialSelections = [] }) {
  const [selections, setSelections] = useState(initialSelections);

  const toggle = (l1, item) => {
    setSelections(prev => {
      const exists = prev.some(s => s.l1 === l1 && s.name === item.name);
      if (exists) return prev.filter(s => !(s.l1 === l1 && s.name === item.name));
      return [...prev, { l1, name: item.name, status: item.status }];
    });
  };

  const selectHighlighted = () => {
    const highlighted = [];
    PROCESS_DATA.forEach(g => {
      g.items.filter(it => it.status === "high").forEach(it => {
        if (!selections.some(s => s.l1 === g.l1 && s.name === it.name)) {
          highlighted.push({ l1: g.l1, name: it.name, status: it.status });
        }
      });
    });
    setSelections(prev => [...prev, ...highlighted]);
  };

  const clearAll = () => setSelections([]);

  const handleNext = () => {
    if (selections.length === 0) return;
    onNext(selections);
  };

  const highCount = PROCESS_DATA.reduce((a, g) => a + g.items.filter(i => i.status === "high").length, 0);

  return (
    <div style={{ background: C.bg, minHeight: "calc(100vh - 64px)", paddingBottom: 80 }}>

      {/* ── Header card ── */}
      <div style={{ background: "white", borderBottom: "1px solid " + C.border, padding: "20px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ marginBottom: 6 }}><Tag>Step 4 of 6</Tag></div>
              <h1 style={{ fontWeight: 800, fontSize: 22, color: C.text, fontFamily: FONT.serif, marginBottom: 6 }}>
                Claims Process Selection
              </h1>
              <p style={{ fontSize: 13, color: C.textSoft, maxWidth: 640, lineHeight: 1.65 }}>
                Review the claims value chain below. Highlighted rows flag processes that need attention based on your maturity assessment. Select the processes you want to analyze further — your choices will drive the recommendations on the next page.
              </p>
            </div>

            {/* Legend */}
            <div style={{ ...card, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6, minWidth: 180 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Legend</div>
              {[
                { dot: "#991b1b", label: "Needs attention" },
                { dot: "#166534", label: "Acceptable" },
                { dot: "#7a9688", label: "Not evaluated" },
                { dot: "#1a4731", label: "Selected for analysis" },
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: C.textMid }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action strip */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button
              onClick={selectHighlighted}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "1.5px solid #fecdd3", background: "#fee2e2", color: "#9f1239", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              <Zap size={12} /> Select all highlighted ({highCount})
            </button>
            <button
              onClick={clearAll}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "1.5px solid " + C.border, background: "white", color: C.textSoft, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
            >
              <X size={12} /> Clear all
            </button>
            <div style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: selections.length > 0 ? "#1a4731" : C.textMuted }}>
              {selections.length === 0 ? "Nothing selected yet" : `${selections.length} process${selections.length > 1 ? "es" : ""} selected`}
            </div>
          </div>
        </div>
      </div>

      {/* ── Process columns ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", overflowX: "auto" }}>
          {PROCESS_DATA.map(group => (
            <L1Column
              key={group.l1}
              group={group}
              selections={selections}
              onToggle={toggle}
            />
          ))}
        </div>

        {/* Empty state */}
        {selections.length === 0 && (
          <div style={{ textAlign: "center", padding: "18px 0 0", fontSize: 12, color: C.textMuted }}>
            Select at least one process to continue.
          </div>
        )}
      </div>

      {/* ── Selected preview panel ── */}
      {selections.length > 0 && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 16px" }}>
          <div style={{ ...card, padding: "14px 18px", border: "1px solid #bfdbfe", background: "#eff6ff" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1a4731", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Selected for deeper analysis ({selections.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selections.map(s => (
                <div
                  key={s.l1 + s.name}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500,
                    background: "white", border: "1px solid #bfdbfe", color: C.textMid,
                  }}
                >
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: ROW_STYLE[s.status].dot }} />
                  {s.name}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggle(s.l1, s); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 0, display: "flex", alignItems: "center" }}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky footer ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "white", borderTop: "1px solid " + C.border,
        padding: "12px 24px", zIndex: 50,
        boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button style={btnSecondary} onClick={onBack}>
            <ArrowLeft size={14} /> Back
          </button>
          <div style={{ fontSize: 12, color: selections.length > 0 ? "#1a4731" : C.textMuted, fontWeight: 600 }}>
            {selections.length === 0
              ? "Select at least one process to continue"
              : `Selected for deeper analysis: ${selections.length}`}
          </div>
          <button
            style={{ ...btnPrimary, opacity: selections.length > 0 ? 1 : 0.4, cursor: selections.length > 0 ? "pointer" : "not-allowed" }}
            onClick={handleNext}
          >
            Next <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
