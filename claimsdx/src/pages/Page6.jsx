import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, X } from "lucide-react";
import { C, FONT, btnPrimary, btnSecondary, card } from "../constants.js";
import { Tag, PageWrap } from "../components.jsx";

// ─── Process data — status field REMOVED (was hardcoded, not data-driven) ─────
// All items are selectable neutral style; consultant decides which to analyse
const PROCESS_DATA = [
  {
    l1: "Initial Claims Processing",
    colorKey: "blue",
    items: [
      "FNOL",
      "Claims registration",
      "Claims-related document intake",
      "Document indexing and scanning",
      "Preliminary claims validation",
      "Policy / coverage validation",
      "Initial reserve setup",
      "Claims correspondence",
      "Complexity assessment and segmentation",
      "Claims trigger / assignment",
      "Tertiary service support",
    ],
  },
  {
    l1: "Claims Review & Investigation",
    colorKey: "gold",
    items: [
      "Loss / damage verification",
      "Reviewing claims file",
      "Stakeholder follow-up",
      "Field / desk appraisal",
      "Flagging for fraud / litigation",
      "Loss estimation",
      "Loss report generation",
      "Claims research",
    ],
  },
  {
    l1: "Fraud Detection & Management",
    colorKey: "pink",
    items: [
      "Evaluate known fraud indicators",
      "Gather additional documentation",
      "Add witnesses / claimants",
      "Follow-up with claimants",
      "Run pattern analysis",
      "Request additional inspection",
      "Flag claim, update claim file",
      "Reassign claim to SIU",
      "Investigation by SIU",
      "Claim file updates by SIU",
      "Reassignment to claim handler",
      "Follow for criminal prosecution",
    ],
  },
  {
    l1: "Claims Adjustment & Disbursement",
    colorKey: "green",
    items: [
      "Adjusting reserves and adequacy",
      "Compensability review",
      "Customer communication on settlement",
      "Assess possibility of recovery",
      "Claims summarisation",
      "General ledger accounting",
      "Vendor invoicing and bill review",
      "Payment release",
      "Negotiation, closure and settlement",
      "Internal reporting",
      "Reconciliations",
    ],
  },
  {
    l1: "Litigation & Subrogation",
    colorKey: "purple",
    items: [
      "Assign legal / staff counsel",
      "Claims audit",
      "File management",
      "Reinsurance management",
      "Review recovery potential",
      "Identify legal liability",
      "Recovery evidence collection",
      "Demand package prep",
      "Recovery processing and recording",
      "Salvage handling and processing",
      "Legal bill review",
      "Regulatory and compliance reporting",
    ],
  },
];

const COL_COLORS = {
  blue:   { header: "#1e3a5f", light: "#dbeafe", border: "#93c5fd" },
  gold:   { header: "#92400e", light: "#fef3c7", border: "#fcd34d" },
  pink:   { header: "#9f1239", light: "#fff1f2", border: "#fda4af" },
  green:  { header: "#1a4731", light: "#f0f7f3", border: "#c3ddd0" },
  purple: { header: "#3730a3", light: "#eef2ff", border: "#a5b4fc" },
};

function L2Row({ name, l1, selected, onToggle }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={() => onToggle(l1, name)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "7px 10px", borderRadius: 7, marginBottom: 4, cursor: "pointer",
        background: selected ? "#f0f7f3" : hover ? "#f8fafc" : "white",
        border: "1.5px solid " + (selected ? "#1a4731" : hover ? "#94a3b8" : "#e2e8f0"),
        boxShadow: selected ? "0 0 0 2px rgba(26,71,49,0.10)" : hover ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: 11, color: selected ? "#1a4731" : C.textMid, fontWeight: selected ? 600 : 400, lineHeight: 1.4, flex: 1 }}>
        {name}
      </span>
      <div style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginLeft: 8,
        border: "1.5px solid " + (selected ? "#1a4731" : "#cbd5e1"),
        background: selected ? "#1a4731" : "white",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {selected && <CheckCircle2 size={11} color="white" strokeWidth={3} />}
      </div>
    </div>
  );
}

function L1Column({ group, selections, onToggle }) {
  const cc = COL_COLORS[group.colorKey];
  const colSelected = group.items.filter(name => selections.some(s => s.l1 === group.l1 && s.name === name)).length;
  return (
    <div style={{
      flex: "1 1 0", minWidth: 180,
      background: "white", borderRadius: 14,
      border: "1px solid " + cc.border,
      boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <div style={{ background: cc.light, borderBottom: "2px solid " + cc.border, padding: "12px 14px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: cc.header, lineHeight: 1.3, marginBottom: 4 }}>{group.l1}</div>
        <div style={{ fontSize: 10, color: C.textMuted }}>
          {group.items.length} processes
          {colSelected > 0 && <span style={{ marginLeft: 6, color: "#1a4731", fontWeight: 600 }}>· {colSelected} selected</span>}
        </div>
      </div>
      <div style={{ padding: "10px 10px", flex: 1, overflowY: "auto" }}>
        {group.items.map(name => (
          <L2Row
            key={name}
            name={name}
            l1={group.l1}
            selected={selections.some(s => s.l1 === group.l1 && s.name === name)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

export default function Page6({ onNext, onBack, initialSelections = [] }) {
  const [selections, setSelections] = useState(initialSelections);

  const toggle = (l1, name) => {
    setSelections(prev => {
      const exists = prev.some(s => s.l1 === l1 && s.name === name);
      return exists
        ? prev.filter(s => !(s.l1 === l1 && s.name === name))
        : [...prev, { l1, name }];
    });
  };

  const clearAll = () => setSelections([]);

  const handleNext = () => {
    if (selections.length === 0) return;
    onNext(selections);
  };

  const totalCount = PROCESS_DATA.reduce((a, g) => a + g.items.length, 0);

  return (
    <div style={{ background: C.bg, minHeight: "calc(100vh - 64px)", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid " + C.border, padding: "20px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 6 }}><Tag>Step 4 of 6</Tag></div>
          <h1 style={{ fontWeight: 800, fontSize: 22, color: C.text, fontFamily: FONT.serif, marginBottom: 6 }}>
            Claims Process Selection
          </h1>
          <p style={{ fontSize: 13, color: C.textSoft, maxWidth: 680, lineHeight: 1.65, marginBottom: 14 }}>
            Select the claims process areas you want to assess for maturity. Your selections drive the maturity questionnaire on the next step. Choose all that are in scope for this carrier.
          </p>

          {/* Action strip */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={clearAll}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "1.5px solid " + C.border, background: "white", color: C.textSoft, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
            >
              <X size={12} /> Clear all
            </button>
            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT.sans }}>
              {totalCount} processes across {PROCESS_DATA.length} claims domains
            </span>
            <div style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: selections.length > 0 ? "#1a4731" : C.textMuted }}>
              {selections.length === 0 ? "Nothing selected yet" : `${selections.length} process${selections.length > 1 ? "es" : ""} selected`}
            </div>
          </div>
        </div>
      </div>

      {/* Process columns */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", overflowX: "auto" }}>
          {PROCESS_DATA.map(group => (
            <L1Column key={group.l1} group={group} selections={selections} onToggle={toggle} />
          ))}
        </div>
        {selections.length === 0 && (
          <div style={{ textAlign: "center", padding: "18px 0 0", fontSize: 12, color: C.textMuted }}>
            Select at least one process area to continue to the maturity assessment.
          </div>
        )}
      </div>

      {/* Selected preview panel (#15 fix: only appears here, NOT duplicated in footer) */}
      {selections.length > 0 && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 16px" }}>
          <div style={{ ...card, padding: "14px 18px", border: "1px solid #c3ddd0", background: "#f0f7f3" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1a4731", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Selected for deeper analysis ({selections.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selections.map(s => (
                <div key={s.l1 + s.name} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500,
                  background: "white", border: "1px solid #c3ddd0", color: C.textMid,
                }}>
                  {s.name}
                  <button
                    onClick={e => { e.stopPropagation(); toggle(s.l1, s.name); }}
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

      {/* Sticky footer — #15 fix: no duplicate count label here */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "white", borderTop: "1px solid " + C.border,
        padding: "12px 24px", zIndex: 50,
        boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button style={btnSecondary} onClick={onBack}><ArrowLeft size={14} /> Back</button>
          <div style={{ fontSize: 12, color: selections.length > 0 ? "#1a4731" : C.textMuted, fontWeight: 600 }}>
            {selections.length === 0
              ? "Select at least one process to continue"
              : `${selections.length} process${selections.length !== 1 ? "es" : ""} selected — ready to assess`}
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
