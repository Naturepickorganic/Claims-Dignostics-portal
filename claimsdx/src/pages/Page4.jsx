import { useState } from "react";
import { ArrowRight, ArrowLeft, Info } from "lucide-react";
import { C, FONT, btnPrimary, btnSecondary, card, METRICS_DATA } from "../constants.js";
import { PageWrap, SectionHead } from "../components.jsx";

const CATS = Object.keys(METRICS_DATA);
const LOB_LIST = [
  { id: "pa", label: "Personal Auto"   },
  { id: "ph", label: "Personal Home"   },
  { id: "ca", label: "Comm. Auto"      },
  { id: "cp", label: "Comm. Property"  },
  { id: "wc", label: "Workers Comp"    },
];

function getStatus(v, bench, higher) {
  if (!v) return null;
  const num = parseFloat(v);
  if (isNaN(num)) return null;
  const ratio = higher ? num / bench : bench / num;
  if (ratio >= 0.95) return "green";
  if (ratio >= 0.75) return "amber";
  return "red";
}
const STATUS_COLOR = { green: "#166534", amber: "#92400e", red: "#991b1b" };
const STATUS_BG    = { green: "#f0f7f3",  amber: "#fef3c7", red: "#fee2e2" };
const STATUS_BORD  = { green: "#c3ddd0",  amber: "#fcd34d", red: "#fca5a5" };

export default function Page4({ onNext, onBack, onDataChange }) {
  const [activeLob, setActiveLob] = useState("pa");
  const [activeCat, setActiveCat] = useState("Cost Efficiency");
  const [values, setValues] = useState({});
  const [tooltip, setTooltip] = useState(null);

  const setVal = (k, v) => {
    const next = { ...values, [k]: v };
    setValues(next);
    onDataChange?.(next);
  };

  const metrics = METRICS_DATA[activeCat] || [];
  const filled = metrics.filter(([n]) => values[activeLob + "-" + activeCat + "-" + n]).length;
  const totalAll = Object.values(METRICS_DATA).reduce((s, m) => s + m.length, 0);
  const filledAll = Object.values(METRICS_DATA).reduce((s, m, ci) => {
    const cat = CATS[ci];
    return s + m.filter(([n]) => values[activeLob + "-" + cat + "-" + n]).length;
  }, 0);

  return (
    <PageWrap maxWidth={960}>
      <SectionHead
        tag="Step 3 of 4"
        title="Performance Metrics"
        subtitle="Enter your actual KPI values. Benchmarks are auto-populated from the 2025 industry dataset."
        action={
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: FONT.mono, fontSize: 22, fontWeight: 700, color: "#1a4731" }}>
              {filledAll}<span style={{ fontSize: 13, color: C.textMuted, fontFamily: FONT.sans, fontWeight: 400 }}>/{totalAll}</span>
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>metrics entered</div>
          </div>
        }
      />

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* LOB sidebar */}
        <div style={{ width: 152, flexShrink: 0 }}>
          <div style={{ ...card, padding: "16px 14px" }}>
            <div style={{ fontFamily: FONT.sans, fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
              Line of Business
            </div>
            {LOB_LIST.map(l => {
              const active = activeLob === l.id;
              return (
                <div key={l.id} onClick={() => setActiveLob(l.id)} style={{
                  padding: "8px 10px", borderRadius: 5, marginBottom: 2, cursor: "pointer",
                  background: active ? "#f0f7f3" : "transparent",
                  borderLeft: active ? "3px solid #1a4731" : "3px solid transparent",
                  fontFamily: FONT.sans, fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#1a4731" : C.textSoft,
                  transition: "all 0.1s",
                }}>
                  {l.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main panel */}
        <div style={{ flex: 1 }}>
          {/* Category tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
            {CATS.map(c => {
              const active = activeCat === c;
              const catFilled = (METRICS_DATA[c] || []).filter(([n]) => values[activeLob + "-" + c + "-" + n]).length;
              return (
                <button key={c} onClick={() => setActiveCat(c)} style={{
                  padding: "7px 14px", borderRadius: 5,
                  border: "1px solid " + (active ? "#1a4731" : "#d8ebe2"),
                  background: active ? "#1a4731" : "white",
                  color: active ? "white" : C.textSoft,
                  fontFamily: FONT.sans, fontSize: 12, fontWeight: active ? 600 : 400, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.15s",
                }}>
                  {c}
                  {catFilled > 0 && (
                    <span style={{ background: active ? "rgba(255,255,255,0.25)" : "#c3ddd0", color: active ? "white" : "#1a4731", borderRadius: 10, fontSize: 10, padding: "0 5px", fontWeight: 700 }}>
                      {catFilled}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 3, background: "#d8ebe2", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: ((filled / metrics.length) * 100) + "%", background: "#1a4731", borderRadius: 2, transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: 11, color: C.textMuted, fontFamily: FONT.mono, flexShrink: 0 }}>{filled}/{metrics.length} entered</span>
          </div>

          {/* Table */}
          <div style={{ ...card, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 110px 90px 90px 32px", gap: 0, padding: "11px 18px", background: "#f7faf8", borderBottom: "2px solid #1a4731" }}>
              {[["Metric & Description","left"], ["Your Value","center"], ["Median","center"], ["Top 25%","center"], ["","center"]].map(([h, align], i) => (
                <div key={i} style={{ fontFamily: FONT.sans, fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: align }}>
                  {h}
                </div>
              ))}
            </div>

            {metrics.map(([name, unit, higher, bench, topQ, desc], i) => {
              const key = activeLob + "-" + activeCat + "-" + name;
              const v = values[key] || "";
              const st = getStatus(v, bench, higher);
              return (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "2fr 110px 90px 90px 32px",
                  alignItems: "center", padding: "13px 18px",
                  background: i % 2 === 0 ? "white" : "#fafcfa",
                  borderBottom: "1px solid #edf5f0",
                  position: "relative",
                }}>
                  {/* Metric name */}
                  <div>
                    <div style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textMid, fontWeight: 500 }}>{name}</div>
                    <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
                  </div>

                  {/* Your value input */}
                  <div style={{ position: "relative" }}>
                    <input
                      value={v}
                      onChange={e => setVal(key, e.target.value)}
                      placeholder="—"
                      style={{
                        width: "100%", padding: "7px 30px 7px 10px",
                        border: "1.5px solid " + (st ? STATUS_BORD[st] : "#d8ebe2"),
                        borderRadius: 5, fontSize: 12, fontFamily: FONT.mono,
                        outline: "none", background: st ? STATUS_BG[st] : "white",
                        color: st ? STATUS_COLOR[st] : C.text, boxSizing: "border-box",
                        transition: "all 0.15s",
                      }}
                    />
                    <span style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", fontSize: 9, color: C.textMuted, fontFamily: FONT.mono, pointerEvents: "none" }}>
                      {unit}
                    </span>
                  </div>

                  {/* Benchmark */}
                  <div style={{ textAlign: "center", fontFamily: FONT.mono, fontSize: 12, color: C.textSoft }}>
                    {bench}<span style={{ fontSize: 9, color: C.textMuted }}>{unit}</span>
                  </div>

                  {/* Top 25% */}
                  <div style={{ textAlign: "center", fontFamily: FONT.mono, fontSize: 12, color: "#1a4731", fontWeight: 600 }}>
                    {topQ}<span style={{ fontSize: 9, color: "#7a9688" }}>{unit}</span>
                  </div>

                  {/* Status dot */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: st ? STATUS_COLOR[st] : "#d8ebe2",
                      opacity: st ? 1 : 0.5,
                    }} />
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div style={{ padding: "11px 18px", background: "#f7faf8", borderTop: "1px solid #d8ebe2", display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[["green", "#166534", "At or above median"], ["amber", "#92400e", "75–95% of median"], ["red", "#991b1b", "Below 75% of median"]].map(([k, c, l]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
                  <span style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textSoft }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer nav */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
        <button style={{ ...btnSecondary, borderRadius: 6 }} onClick={onBack}><ArrowLeft size={14} /> Back</button>
        <button style={{ ...btnPrimary, borderRadius: 6 }} onClick={onNext}>View Results <ArrowRight size={14} /></button>
      </div>
    </PageWrap>
  );
}
