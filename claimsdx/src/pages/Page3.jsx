import { ArrowRight, ArrowLeft, BarChart3, ClipboardList } from "lucide-react";
import { C, FONT, btnPrimary, btnSecondary, card } from "../constants.js";
import { PageWrap, SectionHead } from "../components.jsx";

const PATHS = [
  {
    id: "metrics",
    icon: BarChart3,
    label: "Metrics Assessment",
    sub: "Recommended",
    desc: "Enter actual KPI values across 40 key performance indicators. Instantly benchmarked against tier peers and best-in-class ranges.",
    time: "15 – 20 min",
    best: "Finance, operations, or actuarial teams with available data",
    bullets: ["40 KPIs across 5 value dimensions", "Live benchmark spectrum bars", "Gap quantification & opportunity sizing"],
    accent: "#1a4731",
  },
  {
    id: "process",
    icon: ClipboardList,
    label: "Process Maturity",
    sub: null,
    desc: "Evaluate technology and process maturity against 162 best-in-class descriptors across your selected claims workflow areas.",
    time: "20 – 30 min",
    best: "Claims leadership, operations, or transformation teams",
    bullets: ["162 maturity questions across 5 L1 domains", "Dual scoring: Technology + Process", "Prioritised improvement roadmap"],
    accent: "#0f766e",
  },
];

export default function Page3({ onNext, onBack }) {
  return (
    <PageWrap maxWidth={820}>
      <SectionHead
        tag="Step 2 of 4"
        title="Choose Your Assessment Path"
        subtitle="Select the approach that best fits your available data and team. Both paths produce the same results view."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
        {PATHS.map(p => {
          const Icon = p.icon;
          return (
            <button key={p.id} onClick={() => onNext(p.id)} style={{
              ...card,
              padding: "32px 28px",
              cursor: "pointer",
              textAlign: "left",
              border: "1.5px solid #d8ebe2",
              borderTop: `4px solid ${p.accent}`,
              background: "white",
              borderRadius: 8,
              transition: "box-shadow 0.2s, border-color 0.2s",
              display: "block", width: "100%",
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(26,71,49,0.12)"; e.currentTarget.style.borderColor = p.accent; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(26,71,49,0.06)"; e.currentTarget.style.borderColor = "#d8ebe2"; }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: p.accent + "14", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={22} color={p.accent} strokeWidth={1.5} />
                </div>
                {p.sub && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: p.accent, background: p.accent + "14", border: "1px solid " + p.accent + "33", borderRadius: 4, padding: "3px 9px", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                    {p.sub}
                  </span>
                )}
              </div>

              <div style={{ fontFamily: FONT.serif, fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 10, lineHeight: 1.2 }}>{p.label}</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textSoft, lineHeight: 1.65, marginBottom: 20 }}>{p.desc}</div>

              {/* Bullets */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 22 }}>
                {p.bullets.map(b => (
                  <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: p.accent, flexShrink: 0, marginTop: 5 }} />
                    <span style={{ fontSize: 13, color: C.textMid, fontFamily: FONT.sans }}>{b}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid #d8ebe2", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Est. time</div>
                  <div style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 600, color: C.text }}>{p.time}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: p.accent, fontFamily: FONT.sans, fontSize: 13, fontWeight: 600 }}>
                  Select path <ArrowRight size={14} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ ...card, padding: "20px 24px", marginBottom: 36, display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ fontSize: 18, flexShrink: 0 }}>💡</div>
        <div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 13, color: C.text, marginBottom: 4 }}>Not sure which to choose?</div>
          <div style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textSoft, lineHeight: 1.6 }}>
            Start with <strong>Metrics Assessment</strong> if you have access to operational data — it produces sharper gap analysis. Choose <strong>Process Maturity</strong> if you're in early discovery or prefer a qualitative framework.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <button onClick={onBack} style={{ ...btnSecondary, borderRadius: 6 }}>
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    </PageWrap>
  );
}
