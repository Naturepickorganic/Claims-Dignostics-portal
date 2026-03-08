import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, ArrowLeft, Save, CheckCircle2, Clock, Info } from "lucide-react";
import { C, FONT, btnPrimary, btnSecondary, card, METRICS_DATA } from "../constants.js";
import { PageWrap, SectionHead, Tag } from "../components.jsx";

const ALL_CATS = ["Cost Efficiency", "Claim Effectiveness", "Customer Experience", "Adjuster Productivity", "Fraud Prevention"];

const LOB_MAP = {
  pa: "Personal Auto",
  ph: "Personal Home",
  ca: "Comm. Auto",
  cp: "Comm. Property",
  wc: "Workers Comp",
  gl: "Gen. Liability",
  bop: "BOP/BIP",
};

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

function SaveToast({ show }) {
  if (!show) return null;
  return (
    <div style={{
      position: "fixed", bottom: 80, right: 24, zIndex: 999,
      background: "#1a4731", color: "white", borderRadius: 8,
      padding: "10px 18px", fontSize: 12, fontFamily: FONT.sans,
      display: "flex", alignItems: "center", gap: 8,
      boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      animation: "fadeIn 0.2s ease",
    }}>
      <CheckCircle2 size={14} /> Progress auto-saved
    </div>
  );
}

export default function Page4({ onNext, onBack, onDataChange, carrierLobs = [] }) {
  // Build LOB list from carrier selection, fallback to all
  const lobList = carrierLobs.length > 0
    ? carrierLobs.map(id => ({ id, label: LOB_MAP[id] || id.toUpperCase() }))
    : Object.entries(LOB_MAP).map(([id, label]) => ({ id, label }));

  const [activeLobIdx, setActiveLobIdx] = useState(0);
  const [activeCatIdx, setActiveCatIdx] = useState(0);
  const [values, setValues] = useState({});
  const [tooltip, setTooltip]     = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const toastTimer = useRef(null);

  const activeLob = lobList[activeLobIdx];
  const activeCat = ALL_CATS[activeCatIdx];
  const metrics   = METRICS_DATA[activeCat] || [];

  // ── Auto-save every 30 seconds ────────────────────────────────
  const triggerSave = useCallback((vals) => {
    onDataChange?.(vals);
    setLastSaved(new Date());
    setShowToast(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 2500);
  }, [onDataChange]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(values).length > 0) triggerSave(values);
    }, 30000);
    return () => clearInterval(interval);
  }, [values, triggerSave]);

  const setVal = (k, v) => {
    const next = { ...values, [k]: v };
    setValues(next);
    onDataChange?.(next); // live update without toast
  };

  // ── Navigation helpers ────────────────────────────────────────
  const totalSteps = lobList.length * ALL_CATS.length;
  const currentStep = activeLobIdx * ALL_CATS.length + activeCatIdx + 1;
  const pctOverall  = Math.round((currentStep / totalSteps) * 100);

  const isLastPage = activeLobIdx === lobList.length - 1 && activeCatIdx === ALL_CATS.length - 1;

  const handleNext = () => {
    // Auto-save on page advance
    triggerSave(values);
    if (activeCatIdx < ALL_CATS.length - 1) {
      setActiveCatIdx(c => c + 1);
    } else if (activeLobIdx < lobList.length - 1) {
      setActiveLobIdx(l => l + 1);
      setActiveCatIdx(0);
    } else {
      // Final page — go to results
      onNext();
    }
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (activeCatIdx > 0) {
      setActiveCatIdx(c => c - 1);
    } else if (activeLobIdx > 0) {
      setActiveLobIdx(l => l - 1);
      setActiveCatIdx(ALL_CATS.length - 1);
    } else {
      onBack();
    }
  };

  const filledOnPage  = metrics.filter(([n]) => values[activeLob.id + "-" + activeCat + "-" + n]).length;
  const filledTotal   = Object.values(values).filter(v => v !== "").length;

  return (
    <PageWrap maxWidth={980}>
      <SectionHead
        tag={`Step 3 of 4 · ${activeLob.label} · ${activeCat}`}
        title="Performance Metrics"
        subtitle="Enter your actual KPI values. Benchmarks auto-populate from the 2025 industry dataset."
        action={
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: FONT.mono, fontSize: 22, fontWeight: 700, color: "#1a4731" }}>
              {filledTotal}<span style={{ fontSize: 13, color: C.textMuted, fontFamily: FONT.sans, fontWeight: 400 }}>/{Object.keys(METRICS_DATA).reduce((s, c) => s + (METRICS_DATA[c]?.length || 0), 0) * lobList.length}</span>
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>metrics entered</div>
          </div>
        }
      />

      {/* ── Overall progress ── */}
      <div style={{ ...card, padding: "14px 20px", marginBottom: 18, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 12, color: C.textSoft, fontFamily: FONT.sans }}>
              <strong style={{ color: C.text }}>{activeLob.label}</strong> · {activeCat}
            </span>
            <span style={{ fontSize: 11, color: C.textMuted, fontFamily: FONT.mono }}>Step {currentStep} of {totalSteps}</span>
          </div>
          <div style={{ height: 5, background: "#d8ebe2", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: pctOverall + "%", background: "#1a4731", borderRadius: 3, transition: "width 0.3s" }} />
          </div>
        </div>
        {lastSaved && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: C.textMuted, fontFamily: FONT.sans, flexShrink: 0 }}>
            <Clock size={11} /> Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
        <button
          onClick={() => triggerSave(values)}
          style={{ ...btnSecondary, padding: "5px 12px", fontSize: 11, borderRadius: 5, display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}
        >
          <Save size={11} /> Save
        </button>
      </div>

      {/* ── LOB tabs ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
        {lobList.map((l, i) => {
          const lobFilled = ALL_CATS.reduce((s, c) => s + (METRICS_DATA[c] || []).filter(([n]) => values[l.id + "-" + c + "-" + n]).length, 0);
          const lobTotal  = ALL_CATS.reduce((s, c) => s + (METRICS_DATA[c]?.length || 0), 0);
          const done      = lobFilled === lobTotal && lobTotal > 0;
          const active    = i === activeLobIdx;
          return (
            <button key={l.id} onClick={() => { setActiveLobIdx(i); setActiveCatIdx(0); }}
              style={{
                padding: "6px 14px", borderRadius: 5, fontSize: 12, fontFamily: FONT.sans,
                fontWeight: active ? 700 : 400, cursor: "pointer",
                border: "1.5px solid " + (active ? "#1a4731" : (done ? "#86efac" : "#d8ebe2")),
                background: active ? "#1a4731" : (done ? "#f0fdf4" : "white"),
                color: active ? "white" : (done ? "#166534" : C.textSoft),
                display: "flex", alignItems: "center", gap: 6,
              }}>
              {done && <CheckCircle2 size={11} />}
              {l.label}
              {!active && lobFilled > 0 && !done && (
                <span style={{ fontSize: 9, background: "#c3ddd0", color: "#1a4731", borderRadius: 9, padding: "0 5px", fontWeight: 700 }}>{lobFilled}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Category step indicators ── */}
      <div style={{ display: "flex", gap: 0, marginBottom: 18, borderBottom: "2px solid #d8ebe2" }}>
        {ALL_CATS.map((c, i) => {
          const catFilled = (METRICS_DATA[c] || []).filter(([n]) => values[activeLob.id + "-" + c + "-" + n]).length;
          const catTotal  = METRICS_DATA[c]?.length || 0;
          const done      = catFilled === catTotal && catTotal > 0;
          const active    = i === activeCatIdx;
          return (
            <button key={c} onClick={() => setActiveCatIdx(i)}
              style={{
                padding: "9px 16px", border: "none", background: "transparent", cursor: "pointer",
                fontFamily: FONT.sans, fontSize: 12, fontWeight: active ? 700 : 400,
                color: active ? "#1a4731" : (done ? "#166534" : C.textSoft),
                borderBottom: "2px solid " + (active ? "#1a4731" : "transparent"),
                marginBottom: -2, display: "flex", alignItems: "center", gap: 5,
              }}>
              {done && <CheckCircle2 size={11} color="#166534" />}
              {c}
              {catFilled > 0 && !done && (
                <span style={{ fontSize: 9, background: "#fef3c7", color: "#92400e", borderRadius: 9, padding: "0 5px", fontWeight: 700 }}>{catFilled}/{catTotal}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Metrics table ── */}
      <div style={{ ...card, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 115px 90px 90px 32px", gap: 0, padding: "11px 18px", background: "#f7faf8", borderBottom: "2px solid #1a4731" }}>
          {[["Metric & Description", "left"], ["Your Value", "center"], ["Median", "center"], ["Top 25%", "center"], ["", "center"]].map(([h, align], i) => (
            <div key={i} style={{ fontFamily: FONT.sans, fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: align }}>{h}</div>
          ))}
        </div>

        {metrics.map(([name, unit, higher, bench, topQ, desc], i) => {
          const key = activeLob.id + "-" + activeCat + "-" + name;
          const v   = values[key] || "";
          const st  = getStatus(v, bench, higher);
          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "2fr 115px 90px 90px 32px",
              alignItems: "center", padding: "13px 18px",
              background: i % 2 === 0 ? "white" : "#fafcfa",
              borderBottom: "1px solid #edf5f0",
            }}>
              <div>
                <div style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textMid, fontWeight: 500 }}>{name}</div>
                <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
              </div>
              <div style={{ position: "relative" }}>
                <input value={v} onChange={e => setVal(key, e.target.value)} placeholder="—"
                  style={{
                    width: "100%", padding: "7px 30px 7px 10px",
                    border: "1.5px solid " + (st ? STATUS_BORD[st] : "#d8ebe2"),
                    borderRadius: 5, fontSize: 12, fontFamily: FONT.mono,
                    outline: "none", background: st ? STATUS_BG[st] : "white",
                    color: st ? STATUS_COLOR[st] : C.text, boxSizing: "border-box",
                  }} />
                <span style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", fontSize: 9, color: C.textMuted, fontFamily: FONT.mono, pointerEvents: "none" }}>{unit}</span>
              </div>
              <div style={{ textAlign: "center", fontFamily: FONT.mono, fontSize: 12, color: C.textSoft }}>{bench}<span style={{ fontSize: 9 }}>{unit}</span></div>
              <div style={{ textAlign: "center", fontFamily: FONT.mono, fontSize: 12, color: "#1a4731", fontWeight: 600 }}>{topQ}<span style={{ fontSize: 9, color: "#7a9688" }}>{unit}</span></div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: st ? STATUS_COLOR[st] : "#d8ebe2" }} />
              </div>
            </div>
          );
        })}

        <div style={{ padding: "11px 18px", background: "#f7faf8", borderTop: "1px solid #d8ebe2", display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
          {[["green", "#166534", "At or above median"], ["amber", "#92400e", "75–95% of median"], ["red", "#991b1b", "Below 75% of median"]].map(([k, c, l]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
              <span style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textSoft }}>{l}</span>
            </div>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 11, color: C.textSoft, fontFamily: FONT.sans }}>
            {filledOnPage}/{metrics.length} entered on this page
          </span>
        </div>
      </div>

      {/* ── Footer nav ── */}
      <div style={{
        position: "sticky", bottom: 0, background: "white", borderTop: "1px solid #d8ebe2",
        padding: "14px 0", marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
      }}>
        <button style={{ ...btnSecondary, borderRadius: 6 }} onClick={handleBack}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ fontSize: 12, color: C.textSoft, fontFamily: FONT.sans }}>
          {isLastPage
            ? <span style={{ color: "#1a4731", fontWeight: 700 }}>Last section — ready for results</span>
            : <span>{activeLob.label} · {activeCat} · {ALL_CATS.length - activeCatIdx - 1 + (lobList.length - activeLobIdx - 1) * ALL_CATS.length} sections remaining</span>
          }
        </div>
        <button style={{ ...btnPrimary, borderRadius: 6 }} onClick={handleNext}>
          {isLastPage ? <>View Results <ArrowRight size={14} /></> : <>Next <ArrowRight size={14} /></>}
        </button>
      </div>

      <SaveToast show={showToast} />
    </PageWrap>
  );
}
