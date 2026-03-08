import { ArrowRight } from "lucide-react";
import { C, FONT, LENSES, LENS_COLORS, btnPrimary, card } from "../constants.js";
import { VMLogo, PageWrap, Tag } from "../components.jsx";

export default function Page1({ onNext, role }) {
  const isSales = role === "sales";

  return (
    <div style={{ background: C.bg, minHeight: "calc(100vh - 66px)", fontFamily: FONT.sans }}>

      {/* ── Hero ── */}
      <div style={{ background: "white", borderBottom: "1px solid #d8ebe2" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "64px 28px 56px" }}>

          {isSales && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff1f2", border: "1px solid #fda4af", borderRadius: 5, padding: "6px 14px", marginBottom: 24 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#9f1239" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#9f1239", letterSpacing: "0.08em", textTransform: "uppercase" }}>Demo Mode — Sales Preview</span>
            </div>
          )}

          <div style={{ marginBottom: 12 }}><Tag color="forest">Claims Diagnostic Assessment</Tag></div>

          <h1 style={{ fontFamily: FONT.serif, fontSize: "clamp(32px,4vw,52px)", fontWeight: 700, color: C.text, lineHeight: 1.15, marginBottom: 20, maxWidth: 680 }}>
            Measure what matters.<br />
            <span style={{ color: "#1a4731" }}>Transform claims performance.</span>
          </h1>

          <p style={{ fontSize: 16, color: C.textSoft, lineHeight: 1.7, maxWidth: 580, marginBottom: 36 }}>
            A structured diagnostic framework that benchmarks your claims operation across five value lenses — identifying gaps, quantifying opportunity, and prioritising the highest-ROI modernisation initiatives.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <button onClick={onNext} style={{ ...btnPrimary, padding: "13px 32px", fontSize: 15, borderRadius: 6 }}>
              Begin Assessment <ArrowRight size={16} />
            </button>
            <div style={{ display: "flex", gap: 20 }}>
              {[["~25 min", "to complete"], ["190+", "benchmark metrics"], ["5", "value lenses"]].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 700, color: "#1a4731" }}>{v}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Five Lenses ── */}
      <PageWrap>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Five Value Lenses
          </div>
          <h2 style={{ fontFamily: FONT.serif, fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 6 }}>
            A 360° view of claims maturity
          </h2>
          <p style={{ fontSize: 14, color: C.textSoft, maxWidth: 520 }}>
            Each lens benchmarks a critical dimension against best-in-class and tier-group performance.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 56 }}>
          {LENSES.map((lens, i) => {
            const lc = LENS_COLORS[lens.colorKey];
            return (
              <div key={lens.title} style={{
                ...card,
                padding: "22px 20px",
                borderTop: `3px solid ${lc.color}`,
                transition: "box-shadow 0.2s",
              }}>
                <div style={{ fontFamily: FONT.mono, fontSize: 11, fontWeight: 700, color: C.textMuted, marginBottom: 10, letterSpacing: "0.06em" }}>
                  0{i + 1}
                </div>
                <div style={{ fontFamily: FONT.serif, fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8, lineHeight: 1.3 }}>
                  {lens.title}
                </div>
                <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.6, marginBottom: 14 }}>
                  {lens.desc}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: lc.color, background: lc.bg, border: "1px solid " + lc.border, borderRadius: 4, padding: "3px 8px", letterSpacing: "0.05em" }}>
                  {lens.badge}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── How it works ── */}
        <div style={{ borderTop: "1px solid #d8ebe2", paddingTop: 44 }}>
          <div style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 28 }}>
            How It Works
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 0 }}>
            {[
              { n: "1", title: "Enter Carrier Info",       body: "Provide basic carrier details, tier, and lines of business." },
              { n: "2", title: "Choose Your Path",         body: "Metrics-based KPI input or process maturity questionnaire." },
              { n: "3", title: "Input Your Data",          body: "Enter actuals — benchmarks populate automatically." },
              { n: "4", title: "Review Your Results",      body: "Radar view, benchmark spectrum, findings and roadmap." },
            ].map((step, i, arr) => (
              <div key={step.n} style={{ padding: "24px 24px 24px 0", borderRight: i < arr.length - 1 ? "1px solid #d8ebe2" : "none", paddingLeft: i > 0 ? 24 : 0 }}>
                <div style={{ fontFamily: FONT.mono, fontSize: 28, fontWeight: 700, color: "#c3ddd0", marginBottom: 10, lineHeight: 1 }}>
                  {step.n}
                </div>
                <div style={{ fontFamily: FONT.serif, fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.65 }}>
                  {step.body}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 52, padding: "36px 40px", background: "#1a4731", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontFamily: FONT.serif, fontSize: 22, fontWeight: 700, color: "white", marginBottom: 6 }}>
              Ready to benchmark your claims operation?
            </div>
            <div style={{ fontFamily: FONT.sans, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
              Average completion time 20–30 minutes. Save and resume anytime.
            </div>
          </div>
          <button onClick={onNext} style={{ background: "white", color: "#1a4731", border: "none", padding: "13px 28px", borderRadius: 6, fontWeight: 700, fontSize: 14, fontFamily: FONT.sans, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            Start Assessment <ArrowRight size={15} />
          </button>
        </div>
      </PageWrap>
    </div>
  );
}
