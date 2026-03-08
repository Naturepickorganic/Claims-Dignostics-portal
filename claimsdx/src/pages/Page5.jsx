import { useState } from "react";
import { ArrowLeft, ArrowRight, Download, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { C, FONT, btnPrimary, btnSecondary, card, SAMPLE_SCORES, LENS_COLORS } from "../constants.js";
import { Tag, ScoreRing, GapBadge, PageWrap } from "../components.jsx";
import { useApp } from "../AppContext.jsx";

const overall = Math.round(SAMPLE_SCORES.reduce((a, s) => a + s.score, 0) / SAMPLE_SCORES.length);
const maturity = overall >= 80 ? "Leading" : overall >= 65 ? "Advanced" : overall >= 50 ? "Developing" : "Foundational";
const maturityColor = overall >= 80 ? "#166534" : overall >= 65 ? "#1a4731" : overall >= 50 ? "#92400e" : "#991b1b";

const KPI_COLOR = { green: "#166534", amber: "#92400e", red: "#991b1b" };
const KPI_BG    = { green: "#f0f7f3", amber: "#fef3c7", red: "#fee2e2" };
const KPI_BR    = { green: "#c3ddd0", amber: "#fcd34d", red: "#fca5a5" };

// ── Radar chart ──────────────────────────────────────────────────────────────
function RadarChart({ scores, size }) {
  const sz = size || 300;
  const cx = sz / 2, cy = sz / 2, r = sz * 0.36;
  const n = scores.length;
  const angles = scores.map((_, i) => (i * 2 * Math.PI) / n - Math.PI / 2);
  const pt = (val, idx) => {
    const a = angles[idx], rr = (val / 100) * r;
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
  };
  const toPath = (vals) =>
    vals.map((v, i) => { const [x, y] = pt(v, i); return (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1); }).join(" ") + " Z";

  return (
    <svg width={sz} height={sz} style={{ overflow: "visible" }}>
      {[20, 40, 60, 80, 100].map(gl => (
        <polygon key={gl}
          points={angles.map(a => { const rr = (gl / 100) * r; return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`; }).join(" ")}
          fill="none" stroke="#edf5f0" strokeWidth={1} />
      ))}
      {angles.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={(cx + r * Math.cos(a)).toFixed(1)} y2={(cy + r * Math.sin(a)).toFixed(1)} stroke="#d8ebe2" strokeWidth={1} />
      ))}
      <path d={toPath(scores.map(() => 80))} fill="#1a4731" fillOpacity={0.04} stroke="#1a4731" strokeWidth={1.5} strokeDasharray="5,3" />
      <path d={toPath(scores.map(() => 65))} fill="#92400e" fillOpacity={0.04} stroke="#92400e" strokeWidth={1.5} strokeDasharray="5,3" />
      <path d={toPath(scores.map(s => s.score))} fill="#0f766e" fillOpacity={0.15} stroke="#0f766e" strokeWidth={2.5} />
      {scores.map((s, i) => {
        const lc = LENS_COLORS[s.colorKey];
        const [x, y] = pt(s.score, i);
        return <circle key={i} cx={x} cy={y} r={5} fill={lc.color} stroke="white" strokeWidth={2} />;
      })}
      {scores.map((s, i) => {
        const a = angles[i], lr = r + 30;
        const lx = cx + lr * Math.cos(a), ly = cy + lr * Math.sin(a);
        const lc = LENS_COLORS[s.colorKey];
        const words = s.label.split(" ");
        return (
          <g key={"lbl" + i}>
            {words.map((w, wi) => (
              <text key={wi} x={lx.toFixed(1)} y={(ly + wi * 12 - (words.length - 1) * 6).toFixed(1)}
                fontSize={9} fontWeight="600" fill={lc.color} textAnchor="middle" fontFamily="Inter,sans-serif">{w}</text>
            ))}
            <text x={lx.toFixed(1)} y={(ly + words.length * 12 - (words.length - 1) * 6).toFixed(1)}
              fontSize={11} fontWeight="800" fill={lc.color} textAnchor="middle" fontFamily="JetBrains Mono,monospace">{s.score}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Spectrum bar ──────────────────────────────────────────────────────────────
function SpectrumBar({ metric, tierData, orgValue, onOrgChange }) {
  const indMin = parseFloat(tierData?.indMin) || 0;
  const indMax = parseFloat(tierData?.indMax) || 0;
  const bicMin = parseFloat(tierData?.bicMin) || 0;
  const bicMax = parseFloat(tierData?.bicMax) || 0;
  const isLowerBetter = /ratio|frequency|litigation|cost|expense|leakage|cycle|time|days|turn/i.test(metric.metric);

  const dataMin = Math.min(indMin, bicMin);
  const dataMax = Math.max(indMax, bicMax);
  const pad = (dataMax - dataMin) * 0.12;
  const axMin = Math.max(0, dataMin - pad);
  const axMax = dataMax + pad;
  const axRange = axMax - axMin || 1;
  const pct = v => Math.min(100, Math.max(0, ((v - axMin) / axRange) * 100));
  const fmt = v => (v >= 1000 ? (v / 1000).toFixed(1) + "K" : v % 1 === 0 ? v.toString() : v.toFixed(1));

  const orgNum = orgValue !== "" ? parseFloat(orgValue) : null;
  const orgPct = orgNum !== null && !isNaN(orgNum) ? pct(orgNum) : null;
  let orgStatus = "ind";
  if (orgNum !== null && !isNaN(orgNum)) {
    const inBIC = isLowerBetter ? orgNum <= bicMax : orgNum >= bicMin;
    const inInd = isLowerBetter ? orgNum <= indMax : orgNum >= indMin;
    orgStatus = inBIC ? "bic" : inInd ? "ind" : "below";
  }
  const statusColor = { bic: "#166534", ind: "#92400e", below: "#991b1b" };
  const statusBg    = { bic: "#f0f7f3", ind: "#fef3c7", below: "#fee2e2" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 100px 1fr 110px", gap: 14, padding: "14px 18px", borderBottom: "1px solid #edf5f0", alignItems: "center" }}>
      <div>
        <div style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 600, color: C.textMid }}>{metric.metric}</div>
        <div style={{ fontFamily: FONT.sans, fontSize: 10, color: C.textMuted, marginTop: 1 }}>{metric.units}</div>
      </div>
      <div>
        <input value={orgValue} onChange={e => onOrgChange(e.target.value)} placeholder="—"
          style={{
            width: "100%", padding: "6px 8px", borderRadius: 5, fontSize: 12,
            fontFamily: FONT.mono, border: "1.5px solid " + (orgValue ? statusBg[orgStatus].replace("f0f7f3", "c3ddd0").replace("fef3c7", "fcd34d").replace("fee2e2", "fca5a5") : "#d8ebe2"),
            background: orgValue ? statusBg[orgStatus] : "white",
            color: orgValue ? statusColor[orgStatus] : C.text,
            outline: "none", boxSizing: "border-box",
          }} />
      </div>
      <div>
        <div style={{ position: "relative", height: 18, borderRadius: 4, overflow: "hidden", marginBottom: 4 }}>
          <div style={{ position: "absolute", inset: 0, background: "#fee2e2" }} />
          <div style={{ position: "absolute", left: pct(indMin) + "%", width: (pct(indMax) - pct(indMin)) + "%", top: 0, bottom: 0, background: "linear-gradient(90deg,#fde68a,#fbbf24)" }} />
          <div style={{ position: "absolute", left: pct(bicMin) + "%", width: (pct(bicMax) - pct(bicMin)) + "%", top: 0, bottom: 0, background: "linear-gradient(90deg,#86efac,#22c55e)" }} />
          {orgPct !== null && (
            <div style={{ position: "absolute", left: orgPct + "%", top: -4, bottom: -4, width: 3, background: statusColor[orgStatus], borderRadius: 3, transform: "translateX(-1.5px)", boxShadow: "0 0 0 2px white, 0 0 0 3.5px " + statusColor[orgStatus], zIndex: 5 }} />
          )}
        </div>
        <div style={{ position: "relative", height: 12 }}>
          {[{ v: indMin, c: "#92400e" }, { v: bicMin, c: "#166534" }, { v: bicMax, c: "#166534" }, { v: indMax, c: "#92400e" }].map(({ v, c }, i) => (
            <span key={i} style={{ position: "absolute", left: pct(v) + "%", transform: "translateX(-50%)", fontSize: 9, fontWeight: 600, color: c, fontFamily: FONT.mono, whiteSpace: "nowrap" }}>{fmt(v)}</span>
          ))}
        </div>
      </div>
      <div style={{ textAlign: "right", fontSize: 10, fontFamily: FONT.mono }}>
        <div style={{ color: "#166534", fontWeight: 700, marginBottom: 2 }}>BIC {fmt(bicMin)}–{fmt(bicMax)}</div>
        <div style={{ color: "#92400e" }}>Ind {fmt(indMin)}–{fmt(indMax)}</div>
      </div>
    </div>
  );
}

function BenchmarkTable({ lobKey, tier }) {
  const { benchmarks } = useApp();
  const [activeCat, setActiveCat] = useState(null);
  const [orgValues, setOrgValues] = useState({});
  const data = (benchmarks && benchmarks[lobKey]) ? benchmarks[lobKey] : [];
  const cats = [...new Set(data.map(m => m.category).filter(Boolean))];
  const tierKey = tier === 1 ? "tier1" : tier === 2 ? "tier2" : "tier3";
  const displayData = activeCat ? data.filter(m => m.category === activeCat) : data;
  const scored = Object.values(orgValues).filter(v => v !== "").length;

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setActiveCat(null)} style={{ padding: "5px 12px", borderRadius: 5, fontSize: 11, fontWeight: !activeCat ? 700 : 400, border: "1px solid " + (!activeCat ? "#1a4731" : "#d8ebe2"), background: !activeCat ? "#1a4731" : "white", color: !activeCat ? "white" : C.textSoft, cursor: "pointer" }}>All</button>
        {cats.map(c => (
          <button key={c} onClick={() => setActiveCat(c === activeCat ? null : c)} style={{ padding: "5px 12px", borderRadius: 5, fontSize: 11, fontWeight: activeCat === c ? 700 : 400, border: "1px solid " + (activeCat === c ? "#1a4731" : "#d8ebe2"), background: activeCat === c ? "#1a4731" : "white", color: activeCat === c ? "white" : C.textSoft, cursor: "pointer" }}>
            {c.replace(" metrics", "").replace(" and efficiency", "")}
          </button>
        ))}
        {scored > 0 && <span style={{ marginLeft: "auto", fontSize: 11, color: "#1a4731", fontWeight: 600, fontFamily: FONT.sans }}>{scored} entered</span>}
      </div>

      {/* Legend */}
      <div style={{ ...card, padding: "10px 16px", marginBottom: 14, display: "flex", gap: 20, flexWrap: "wrap" }}>
        {[["#fee2e2", "#991b1b", "Below industry"], ["#fbbf24", "#92400e", "Industry range"], ["#22c55e", "#166534", "Best-in-Class"], ["#1a4731", "#1a4731", "▼ Your position"]].map(([bg, clr, lbl]) => (
          <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {lbl.startsWith("▼") ? <div style={{ width: 3, height: 14, background: clr, borderRadius: 2 }} />
              : <div style={{ width: 12, height: 7, borderRadius: 2, background: bg, border: "1px solid " + clr + "55" }} />}
            <span style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textSoft }}>{lbl.replace("▼ ", "")}</span>
          </div>
        ))}
        <span style={{ marginLeft: "auto", fontFamily: FONT.sans, fontSize: 10, color: C.textMuted, fontStyle: "italic" }}>Enter value — position plots automatically</span>
      </div>

      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "220px 100px 1fr 110px", gap: 14, padding: "10px 18px", background: "#f7faf8", borderBottom: "2px solid #1a4731" }}>
          {[["Metric", "left"], ["Your Value", "left"], ["Benchmark Spectrum", "left"], ["Reference", "right"]].map(([h, align]) => (
            <div key={h} style={{ fontFamily: FONT.sans, fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: align }}>{h}</div>
          ))}
        </div>
        {displayData.map((m, i) => (
          <SpectrumBar key={m.metric + i} metric={m} tierData={m[tierKey]}
            orgValue={orgValues[m.metric + tierKey] ?? ""}
            onOrgChange={v => setOrgValues(prev => ({ ...prev, [m.metric + tierKey]: v }))} />
        ))}
      </div>
    </div>
  );
}

function TabComparative() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>
      <div style={{ ...card, padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 4 }}>Maturity Radar</div>
        <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, marginBottom: 18 }}>Five value dimensions</div>
        <RadarChart scores={SAMPLE_SCORES} size={260} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 18, width: "100%" }}>
          {[{ color: "#0f766e", dash: false, label: "Your organisation" }, { color: "#92400e", dash: true, label: "Tier median (65)" }, { color: "#1a4731", dash: true, label: "Best-in-class (80)" }].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width={28} height={10}><line x1={0} y1={5} x2={28} y2={5} stroke={l.color} strokeWidth={l.dash ? 1.5 : 2.5} strokeDasharray={l.dash ? "4,3" : "none"} /></svg>
              <span style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textSoft }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ ...card, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "14px 18px", borderBottom: "2px solid #1a4731" }}>
            <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 15, color: C.text }}>Score Summary vs. Benchmarks</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 60px 60px 60px 60px 100px" }}>
            {["Value Driver", "Score", "Median", "Top 25%", "Gap", "Level"].map((h, i) => (
              <div key={h} style={{ padding: "9px 12px", background: "#f7faf8", borderBottom: "1px solid #d8ebe2", fontFamily: FONT.sans, fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", borderRight: i < 5 ? "1px solid #edf5f0" : "none" }}>{h}</div>
            ))}
            {SAMPLE_SCORES.map((s, i) => {
              const lc = LENS_COLORS[s.colorKey];
              const level = s.score >= 80 ? "Leading" : s.score >= 65 ? "Advanced" : s.score >= 50 ? "Developing" : "Foundational";
              const lvlColor = s.score >= 80 ? "#166534" : s.score >= 65 ? "#1a4731" : s.score >= 50 ? "#92400e" : "#991b1b";
              return [
                <div key={"n"+i} style={{ padding: "11px 12px", borderBottom: "1px solid #edf5f0", fontFamily: FONT.sans, fontSize: 13, color: C.text, fontWeight: 500, borderRight: "1px solid #edf5f0" }}>{s.label}</div>,
                <div key={"s"+i} style={{ padding: "11px 12px", borderBottom: "1px solid #edf5f0", fontFamily: FONT.mono, fontSize: 15, fontWeight: 800, color: lc.color, textAlign: "center", borderRight: "1px solid #edf5f0" }}>{s.score}</div>,
                <div key={"m"+i} style={{ padding: "11px 12px", borderBottom: "1px solid #edf5f0", fontFamily: FONT.mono, fontSize: 12, color: C.textSoft, textAlign: "center", borderRight: "1px solid #edf5f0" }}>65</div>,
                <div key={"t"+i} style={{ padding: "11px 12px", borderBottom: "1px solid #edf5f0", fontFamily: FONT.mono, fontSize: 12, color: "#1a4731", fontWeight: 700, textAlign: "center", borderRight: "1px solid #edf5f0" }}>80</div>,
                <div key={"g"+i} style={{ padding: "11px 12px", borderBottom: "1px solid #edf5f0", fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, color: s.gap >= 0 ? "#166534" : "#991b1b", textAlign: "center", borderRight: "1px solid #edf5f0" }}>{s.gap >= 0 ? "+" : ""}{s.gap}</div>,
                <div key={"l"+i} style={{ padding: "11px 12px", borderBottom: "1px solid #edf5f0", fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: lvlColor }}>{level}</div>,
              ];
            })}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[{ label: "Subrogation Recovery", value: "$1.2M", color: "#166534", gap: "-6pp" }, { label: "STP / Automation", value: "$1.8M", color: "#1a4731", gap: "-22pp" }, { label: "Reserve Accuracy", value: "$0.9M", color: "#92400e", gap: "-8pp" }].map(item => (
            <div key={item.label} style={{ ...card, padding: "18px 16px", borderTop: "3px solid " + item.color }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 22, fontWeight: 800, color: item.color, marginBottom: 4 }}>{item.value}</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 600, color: C.textMid, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted }}>{item.gap} vs. median</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabOverview() {
  const [expanded, setExpanded] = useState(null);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14, marginBottom: 12 }}>
        {SAMPLE_SCORES.map(s => {
          const lc = LENS_COLORS[s.colorKey]; const isOpen = expanded === s.label;
          return (
            <div key={s.label} style={{ ...card, padding: 20, cursor: "pointer", borderLeft: "4px solid " + lc.color, transition: "box-shadow 0.2s" }}
              onClick={() => setExpanded(isOpen ? null : s.label)}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(26,71,49,0.10)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(26,71,49,0.06)"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>{s.label}</div>
                  <GapBadge gap={s.gap} />
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: FONT.mono, fontSize: 22, fontWeight: 800, color: lc.color, lineHeight: 1 }}>{s.score}</div>
                  <div style={{ fontFamily: FONT.sans, fontSize: 10, color: lc.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.score >= 80 ? "Leading" : s.score >= 65 ? "Advanced" : s.score >= 50 ? "Developing" : "Foundational"}</div>
                </div>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "#edf5f0", overflow: "hidden", marginBottom: 10 }}>
                <div style={{ height: "100%", width: s.score + "%", background: lc.color, borderRadius: 2, transition: "width 0.5s" }} />
              </div>
              <div style={{ fontFamily: FONT.sans, fontSize: 12, color: C.textSoft, lineHeight: 1.6 }}>{s.insight}</div>
              {isOpen && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #d8ebe2" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 55px 55px 55px", gap: 6, marginBottom: 7 }}>
                    {["KPI", "Yours", "Med.", "Top"].map((h, i) => <div key={h} style={{ fontFamily: FONT.sans, fontSize: 9, fontWeight: 700, color: i === 3 ? "#1a4731" : C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>)}
                  </div>
                  {s.kpis.map(k => (
                    <div key={k.n} style={{ display: "grid", gridTemplateColumns: "1.2fr 55px 55px 55px", gap: 6, padding: "6px 0", borderBottom: "1px solid #edf5f0" }}>
                      <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMid }}>{k.n}</div>
                      <div style={{ fontFamily: FONT.mono, fontSize: 11, color: KPI_COLOR[k.s] || C.text, fontWeight: 600 }}>{k.y}</div>
                      <div style={{ fontFamily: FONT.mono, fontSize: 11, color: C.textSoft }}>{k.b}</div>
                      <div style={{ fontFamily: FONT.mono, fontSize: 11, color: "#1a4731", fontWeight: 700 }}>{k.t}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: FONT.sans, fontSize: 12, color: C.textSoft, fontStyle: "italic" }}>Click any card to expand KPI detail.</div>
    </div>
  );
}

function TabBenchmarks() {
  const [lob, setLob] = useState("personal_lines");
  const [tier, setTier] = useState(2);
  const LOBS = [{ id: "personal_lines", label: "Personal Lines" }, { id: "commercial_lines", label: "Commercial Lines" }, { id: "workers_compensation", label: "Workers Comp" }, { id: "general_liability", label: "General Liability" }];
  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {LOBS.map(l => <button key={l.id} onClick={() => setLob(l.id)} style={{ padding: "6px 13px", borderRadius: 5, fontSize: 12, fontWeight: lob === l.id ? 700 : 400, fontFamily: FONT.sans, border: "1px solid " + (lob === l.id ? "#1a4731" : "#d8ebe2"), background: lob === l.id ? "#1a4731" : "white", color: lob === l.id ? "white" : C.textSoft, cursor: "pointer" }}>{l.label}</button>)}
        </div>
        <div style={{ display: "flex", gap: 6, marginLeft: "auto", alignItems: "center" }}>
          <span style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted }}>Tier:</span>
          {[1, 2, 3].map(t => <button key={t} onClick={() => setTier(t)} style={{ width: 34, height: 30, borderRadius: 5, fontFamily: FONT.sans, fontSize: 12, fontWeight: tier === t ? 700 : 400, border: "1px solid " + (tier === t ? "#1a4731" : "#d8ebe2"), background: tier === t ? "#1a4731" : "white", color: tier === t ? "white" : C.textSoft, cursor: "pointer" }}>T{t}</button>)}
        </div>
      </div>
      <BenchmarkTable lobKey={lob} tier={tier} />
    </div>
  );
}

function TabFindings() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          { title: "Strengths", color: "#166534", border: "#c3ddd0", bg: "#f0f7f3", Icon: CheckCircle2, items: ["Quality and Compliance above benchmark on all 4 KPIs", "LAE Ratio 11.2% — below industry median of 12%", "Zero regulatory violations in current period", "Claimant CSAT trending upward 3 consecutive quarters", "Documentation completeness at 88% vs 84% benchmark"] },
          { title: "Improvement Areas", color: "#991b1b", border: "#fca5a5", bg: "#fee2e2", Icon: AlertCircle, items: ["Technology automation 8pp below median — highest ROI gap", "Subrogation recovery 6pp below median ($1.2M est. opportunity)", "Reserve accuracy at 79% vs 85% median", "Adjuster workload ratio 8% above benchmark", "STP Rate at 14% vs 22% median", "Digital adoption lagging peers by 18pp"] },
        ].map(({ title, color, border, bg, Icon, items }) => (
          <div key={title} style={{ ...card, padding: 22, borderTop: "3px solid " + color }}>
            <div style={{ fontFamily: FONT.serif, fontSize: 14, fontWeight: 700, color, marginBottom: 14 }}>{title}</div>
            {items.map(s => (
              <div key={s} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <Icon size={13} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontFamily: FONT.sans, fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>{s}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ ...card, padding: 22 }}>
        <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 16 }}>KPI Heatmap by Lens</div>
        {SAMPLE_SCORES.map(s => {
          const lc = LENS_COLORS[s.colorKey];
          return (
            <div key={s.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 600, color: C.text }}>{s.label}</span>
                <div style={{ flex: 1, height: 1, background: "#d8ebe2" }} />
                <span style={{ fontFamily: FONT.mono, fontSize: 12, color: lc.color, fontWeight: 700 }}>{s.score}/100</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {s.kpis.map(k => <div key={k.n} style={{ padding: "4px 10px", borderRadius: 4, fontFamily: FONT.sans, fontSize: 11, fontWeight: 500, background: KPI_BG[k.s], color: KPI_COLOR[k.s], border: "1px solid " + KPI_BR[k.s] }}>{k.n}</div>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabRoadmap() {
  const horizons = [
    { label: "Near Term (0–6 months)", color: "#166534", bg: "#f0f7f3", border: "#c3ddd0", items: [
      { t: "Launch STP for low-complexity claims under $5K", lens: "Technology", eff: "Med",  imp: "High" },
      { t: "AI-assisted subrogation identification workflow", lens: "Financial",  eff: "Low",  imp: "High" },
      { t: "Digital FNOL with real-time coverage verification", lens: "CX",       eff: "Med",  imp: "Med"  },
      { t: "30-day reserve accuracy checkpoint cadence",       lens: "Financial",  eff: "Low",  imp: "Med"  },
    ]},
    { label: "Mid Term (6–18 months)", color: "#1a4731", bg: "#f0f7f3", border: "#c3ddd0", items: [
      { t: "Subrogation workflow upgrade with MSP Navigator", lens: "Financial",  eff: "High", imp: "High" },
      { t: "Adjuster coaching program tied to KPI scorecards", lens: "Org",       eff: "Med",  imp: "Med"  },
      { t: "IDP for claims correspondence modernisation",      lens: "Technology", eff: "High", imp: "High" },
      { t: "Claims portal self-service expansion",            lens: "CX",         eff: "Med",  imp: "Med"  },
    ]},
    { label: "Long Term (18+ months)", color: "#92400e", bg: "#fef3c7", border: "#fcd34d", items: [
      { t: "Full omni-channel digital claims service layer",  lens: "Technology", eff: "High", imp: "High" },
      { t: "Predictive litigation analytics",                 lens: "Financial",  eff: "High", imp: "High" },
      { t: "Real-time ML severity prediction for reserves",   lens: "Financial",  eff: "High", imp: "High" },
    ]},
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ ...card, padding: 20, borderTop: "3px solid #1a4731" }}>
        <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 14 }}>Estimated Value Creation Opportunity</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[{ label: "Subrogation Recovery", value: "$1.2M", color: "#166534" }, { label: "STP / Automation Gains", value: "$1.8M", color: "#1a4731" }, { label: "Reserve Accuracy", value: "$0.9M", color: "#92400e" }].map(item => (
            <div key={item.label} style={{ textAlign: "center", padding: "16px 12px", borderRadius: 6, border: "1px solid " + item.color + "33", background: item.color + "08" }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMid, fontWeight: 600, marginTop: 4 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      {horizons.map(p => (
        <div key={p.label} style={{ ...card, overflow: "hidden" }}>
          <div style={{ padding: "12px 20px", background: p.bg, borderBottom: "1px solid " + p.border, borderLeft: "4px solid " + p.color }}>
            <span style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 700, color: p.color }}>{p.label}</span>
          </div>
          {p.items.map((item, i) => (
            <div key={item.t} style={{ display: "grid", gridTemplateColumns: "1fr 90px 75px 75px", gap: 10, padding: "12px 20px", borderBottom: i < p.items.length - 1 ? "1px solid #edf5f0" : "none", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <ArrowRight size={11} color={p.color} style={{ flexShrink: 0, marginTop: 3 }} />
                <span style={{ fontFamily: FONT.sans, fontSize: 12, color: C.textMid, lineHeight: 1.5 }}>{item.t}</span>
              </div>
              <div style={{ fontFamily: FONT.sans, fontSize: 10, color: C.textSoft, background: "#f7faf8", borderRadius: 4, padding: "3px 8px", textAlign: "center", border: "1px solid #d8ebe2" }}>{item.lens}</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 10, fontWeight: 600, color: item.eff === "Low" ? "#166534" : item.eff === "Med" ? "#92400e" : "#991b1b", textAlign: "center" }}>{item.eff} effort</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 10, fontWeight: 600, color: item.imp === "High" ? "#166534" : "#1a4731", textAlign: "center" }}>{item.imp} impact</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Page5({ onBack, setPage, onNext, onDashboard, role, readOnly, assessment }) {
  const [tab, setTab] = useState("comparative");
  const TABS = [
    { id: "comparative", label: "Comparative View" },
    { id: "overview",    label: "Score Overview"   },
    { id: "benchmarks",  label: "Benchmark Table"  },
    { id: "findings",    label: "Key Findings"      },
    { id: "priorities",  label: "Roadmap"           },
  ];

  return (
    <PageWrap maxWidth={1100}>
      {/* ReadOnly banner */}
      {readOnly && (
        <div style={{ background: "#f0f7f3", border: "1px solid #c3ddd0", borderRadius: 6, padding: "10px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: FONT.sans, fontSize: 12, color: "#1a4731" }}>
            📋 Viewing historical results for <strong>{assessment?.carrier_name}</strong>
            {assessment?.completed_at && ` — completed ${new Date(assessment.completed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
          </span>
          <button onClick={onBack} style={{ fontFamily: FONT.sans, fontSize: 12, color: "#1a4731", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>← Back to Hub</button>
        </div>
      )}
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ marginBottom: 10 }}><Tag color="forest">{readOnly ? "Historical Results" : "Assessment Complete"}</Tag></div>
          <h1 style={{ fontFamily: FONT.serif, fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 6 }}>
            {readOnly && assessment?.carrier_name ? assessment.carrier_name + " — " : ""}Claims Maturity Results
          </h1>
          <p style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textSoft }}>Personal Auto · Baseline Assessment · March 2026</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...btnSecondary, borderRadius: 6 }} onClick={onBack}><ArrowLeft size={13} /> Back</button>
          <button style={{ ...btnPrimary, borderRadius: 6 }}><Download size={13} /> Export PDF</button>
        </div>
      </div>

      {/* Overall score bar — white card, green left border */}
      <div style={{ ...card, padding: "24px 28px", marginBottom: 24, borderLeft: "5px solid #1a4731", display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
          <ScoreRing score={overall} color={maturityColor} size={90} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: FONT.mono, fontSize: 22, fontWeight: 800, color: maturityColor, lineHeight: 1 }}>{overall}</div>
            <div style={{ fontFamily: FONT.sans, fontSize: 9, color: C.textMuted }}>/ 100</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: FONT.sans, fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Overall Maturity</div>
          <div style={{ fontFamily: FONT.serif, fontSize: 22, fontWeight: 700, color: maturityColor, marginBottom: 6 }}>{maturity}</div>
          <p style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textSoft, lineHeight: 1.65, maxWidth: 460 }}>
            Quality and Compliance anchors the portfolio. Technology and Financial Leakage are the primary opportunity — <strong style={{ color: "#1a4731" }}>$3.5M–$5M annually</strong>.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SAMPLE_SCORES.map(s => {
            const lc = LENS_COLORS[s.colorKey];
            return (
              <div key={s.label} style={{ textAlign: "center", padding: "10px 14px", borderRadius: 6, border: "1px solid " + lc.border, background: lc.bg, minWidth: 68 }}>
                <div style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 800, color: lc.color, lineHeight: 1 }}>{s.score}</div>
                <div style={{ fontFamily: FONT.sans, fontSize: 9, color: C.textSoft, marginTop: 4, lineHeight: 1.3 }}>{s.label.split(" ")[0]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #d8ebe2", marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 18px", border: "none", background: "transparent", fontFamily: FONT.sans,
            borderBottom: "2px solid " + (tab === t.id ? "#1a4731" : "transparent"),
            color: tab === t.id ? "#1a4731" : C.textSoft,
            fontWeight: tab === t.id ? 700 : 400, fontSize: 13, cursor: "pointer", marginBottom: -2,
            transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "comparative" && <TabComparative />}
      {tab === "overview"    && <TabOverview />}
      {tab === "benchmarks"  && <TabBenchmarks />}
      {tab === "findings"    && <TabFindings />}
      {tab === "priorities"  && <TabRoadmap />}

      <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between" }}>
        <button style={{ ...btnSecondary, borderRadius: 6 }} onClick={() => setPage(1)}><RotateCcw size={13} /> Start New</button>
        {onNext && <button style={{ ...btnPrimary, borderRadius: 6 }} onClick={onNext}>Process Selection <ArrowRight size={14} /></button>}
      </div>
    </PageWrap>
  );
}
