import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, ArrowLeft, Save, CheckCircle2, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { C, FONT, btnPrimary, btnSecondary, card } from "../constants.js";
import { PageWrap, SectionHead } from "../components.jsx";
import { useApp } from "../AppContext.jsx";
import {
  BENCH_CATS, BENCH_CAT_SHORT, BENCH_LOB_SHORT,
  getUniqueBenchKeys, getMetricsForLob, isHigherBetter,
  getBenchForTier, makeMetricKey,
} from "../benchmarkHelpers.js";

const STATUS_COLOR = { bic:"#166534", ind:"#92400e", low:"#991b1b" };
const STATUS_BG    = { bic:"#f0f7f3", ind:"#fef3c7", low:"#fee2e2" };
const STATUS_BORD  = { bic:"#c3ddd0", ind:"#fcd34d", low:"#fca5a5" };
const STATUS_LABEL = { bic:"BIC",     ind:"Industry", low:"Below Ind." };
const TIER_COLOR   = { 1:"#1a4731",   2:"#1e3a5f",   3:"#92400e" };
const TIER_LABEL   = { 1:"Tier 1 (>$5B)", 2:"Tier 2 ($1–5B)", 3:"Tier 3 ($500M–$1B)" };

function getStatus(val, bench, hib) {
  if (!val || !bench) return null;
  const n = parseFloat(val);
  if (isNaN(n)) return null;
  if (hib) {
    if (n >= bench.bicMin) return "bic";
    if (n >= bench.indMin) return "ind";
    return "low";
  } else {
    if (n <= bench.bicMax) return "bic";
    if (n <= bench.indMax) return "ind";
    return "low";
  }
}

function fmt(v) {
  if (v == null) return "—";
  if (v >= 1000) return (v/1000).toFixed(1)+"K";
  return v % 1 === 0 ? String(v) : v.toFixed(2);
}

function SaveToast({ show }) {
  if (!show) return null;
  return (
    <div style={{
      position:"fixed", bottom:80, right:24, zIndex:999,
      background:"#1a4731", color:"white", borderRadius:8,
      padding:"12px 18px", fontSize:12, fontFamily:FONT.sans,
      display:"flex", flexDirection:"column", gap:3,
      boxShadow:"0 4px 16px rgba(0,0,0,0.18)", maxWidth:260,
    }}>
      <div style={{display:"flex",alignItems:"center",gap:7,fontWeight:700}}>
        <CheckCircle2 size={14}/> Progress saved
      </div>
      <div style={{fontSize:11,opacity:0.85}}>
        Resume this assessment any time from your Dashboard.
      </div>
    </div>
  );
}

export default function Page4({ onNext, onBack, onDataChange, onSave, carrierLobs=[], carrierTier=2 }) {
  const { benchmarkOverrides } = useApp();
  const tierColor = TIER_COLOR[carrierTier] || "#1a4731";

  // Derive unique bench LOB keys from carrier's selected LOBs
  const benchKeys = getUniqueBenchKeys(carrierLobs);
  const lobList   = benchKeys.length > 0 ? benchKeys : ["personal_lines"];

  const [activeLobIdx, setActiveLobIdx] = useState(0);
  const [activeCat,    setActiveCat]    = useState(BENCH_CATS[0]);
  const [values,       setValues]       = useState({});
  const [showToast,    setShowToast]    = useState(false);
  const [lastSaved,    setLastSaved]    = useState(null);
  const toastRef = useRef(null);

  const activeLobKey = lobList[activeLobIdx];
  const metrics      = getMetricsForLob(activeLobKey, activeCat);

  // ── Auto-save ──────────────────────────────────────────────
  const triggerSave = useCallback((vals) => {
    onDataChange?.(vals);
    onSave?.(vals);
    setLastSaved(new Date());
    setShowToast(true);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setShowToast(false), 2500);
  }, [onDataChange, onSave]);

  useEffect(() => {
    const iv = setInterval(() => {
      if (Object.keys(values).length > 0) triggerSave(values);
    }, 30000);
    return () => clearInterval(iv);
  }, [values, triggerSave]);

  const setVal = (k, v) => {
    const next = { ...values, [k]: v };
    setValues(next);
    onDataChange?.(next);
  };

  // ── Navigation ──────────────────────────────────────────────
  const catIdx       = BENCH_CATS.indexOf(activeCat);
  const totalSteps   = lobList.length * BENCH_CATS.length;
  const currentStep  = activeLobIdx * BENCH_CATS.length + catIdx + 1;
  const pct          = Math.round((currentStep / totalSteps) * 100);
  const isLastPage   = activeLobIdx === lobList.length-1 && catIdx === BENCH_CATS.length-1;

  const handleNext = () => {
    triggerSave(values);
    if (catIdx < BENCH_CATS.length-1) {
      setActiveCat(BENCH_CATS[catIdx+1]);
    } else if (activeLobIdx < lobList.length-1) {
      setActiveLobIdx(i => i+1);
      setActiveCat(BENCH_CATS[0]);
    } else {
      onNext();
    }
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (catIdx > 0) setActiveCat(BENCH_CATS[catIdx-1]);
    else if (activeLobIdx > 0) { setActiveLobIdx(i => i-1); setActiveCat(BENCH_CATS[BENCH_CATS.length-1]); }
    else onBack();
  };

  // ── Count helpers ───────────────────────────────────────────
  const filledOnPage = metrics.filter(m => {
    const v = values[makeMetricKey(activeLobKey, m.metric)];
    return v && v !== "";
  }).length;
  const filledTotal = Object.values(values).filter(v => v !== "").length;
  const totalPossible = lobList.reduce((s, lk) => s + (getMetricsForLob(lk).length), 0);

  // ── Lob completion per LOB ──────────────────────────────────
  const lobFilled = lk => getMetricsForLob(lk).filter(m => {
    const v = values[makeMetricKey(lk, m.metric)];
    return v && v !== "";
  }).length;
  const lobTotal  = lk => getMetricsForLob(lk).length;

  return (
    <PageWrap maxWidth={1000}>
      <SectionHead
        tag={`Step 3 of 4 · ${BENCH_LOB_SHORT[activeLobKey]} · ${BENCH_CAT_SHORT[activeCat]}`}
        title="Performance Metrics Assessment"
        subtitle="Enter your carrier's actual KPI values. Benchmarks are LOB-specific and tier-adjusted — green = BIC, amber = industry, red = below industry."
        action={
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:FONT.mono,fontSize:22,fontWeight:700,color:tierColor}}>
              {filledTotal}<span style={{fontSize:13,color:C.textMuted,fontFamily:FONT.sans,fontWeight:400}}>/{totalPossible}</span>
            </div>
            <div style={{fontSize:11,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em"}}>metrics entered</div>
          </div>
        }
      />

      {/* Progress + tier badge */}
      <div style={{...card,padding:"14px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:12,color:C.textSoft,fontFamily:FONT.sans}}>
              <strong style={{color:C.text}}>{BENCH_LOB_SHORT[activeLobKey]}</strong> · {BENCH_CAT_SHORT[activeCat]}
            </span>
            <span style={{fontSize:11,color:C.textMuted,fontFamily:FONT.mono}}>Step {currentStep} / {totalSteps}</span>
          </div>
          <div style={{height:5,background:"#d8ebe2",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:pct+"%",background:tierColor,borderRadius:3,transition:"width 0.3s"}}/>
          </div>
        </div>
        <span style={{
          padding:"4px 12px",borderRadius:4,fontSize:11,fontFamily:FONT.sans,fontWeight:700,flexShrink:0,
          background:tierColor+"18",color:tierColor,border:"1px solid "+tierColor+"44"
        }}>{TIER_LABEL[carrierTier]}</span>
        {lastSaved && (
          <span style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:C.textMuted,fontFamily:FONT.sans,flexShrink:0}}>
            <Clock size={11}/>{lastSaved.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
          </span>
        )}
        <button onClick={() => triggerSave(values)}
          title="Save your progress — you can resume from the Dashboard where you left off"
          style={{...btnSecondary,padding:"5px 12px",fontSize:11,borderRadius:5,display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
          <Save size={11}/> Save Progress
        </button>
      </div>

      {/* LOB tabs (only LOBs the carrier has) */}
      {lobList.length > 1 && (
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          {lobList.map((lk, i) => {
            const filled = lobFilled(lk), total = lobTotal(lk), done = filled===total && total>0;
            const active = i === activeLobIdx;
            return (
              <button key={lk} onClick={() => { setActiveLobIdx(i); setActiveCat(BENCH_CATS[0]); }}
                style={{
                  padding:"7px 16px",borderRadius:5,fontSize:12,fontFamily:FONT.sans,
                  fontWeight:active?700:400,cursor:"pointer",
                  border:"1.5px solid "+(active?tierColor:(done?"#86efac":"#d8ebe2")),
                  background:active?tierColor:(done?"#f0fdf4":"white"),
                  color:active?"white":(done?"#166534":C.textSoft),
                  display:"flex",alignItems:"center",gap:6,
                }}>
                {done && <CheckCircle2 size={11}/>}
                {BENCH_LOB_SHORT[lk]}
                {!active && filled>0 && !done && (
                  <span style={{fontSize:9,background:"#c3ddd0",color:"#1a4731",borderRadius:9,padding:"0 5px",fontWeight:700}}>{filled}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Category tabs */}
      <div style={{display:"flex",gap:0,marginBottom:18,borderBottom:"2px solid #d8ebe2"}}>
        {BENCH_CATS.map((cat) => {
          const catMetrics = getMetricsForLob(activeLobKey, cat);
          const cf  = catMetrics.filter(m => { const v=values[makeMetricKey(activeLobKey,m.metric)]; return v&&v!==""; }).length;
          const ct  = catMetrics.length;
          const done = cf===ct && ct>0;
          const active = cat===activeCat;
          return (
            <button key={cat} onClick={() => setActiveCat(cat)}
              style={{
                padding:"9px 14px",border:"none",background:"transparent",cursor:"pointer",
                fontFamily:FONT.sans,fontSize:12,fontWeight:active?700:400,
                color:active?tierColor:(done?"#166534":C.textSoft),
                borderBottom:"2px solid "+(active?tierColor:"transparent"),
                marginBottom:-2,display:"flex",alignItems:"center",gap:5,
              }}>
              {done && <CheckCircle2 size={11} color="#166534"/>}
              {BENCH_CAT_SHORT[cat]}
              {cf>0&&!done&&<span style={{fontSize:9,background:"#fef3c7",color:"#92400e",borderRadius:9,padding:"0 5px",fontWeight:700}}>{cf}/{ct}</span>}
            </button>
          );
        })}
      </div>

      {/* Metrics table */}
      <div style={{...card,overflow:"hidden",marginBottom:24}}>
        {/* Header */}
        <div style={{display:"grid",gridTemplateColumns:"2.2fr 110px 140px 140px 28px",gap:0,
          padding:"11px 18px",background:"#f7faf8",borderBottom:"2.5px solid "+tierColor}}>
          {[
            ["Metric","left"],
            ["Your Value","center"],
            [`IND Range · ${TIER_LABEL[carrierTier]}`,"center"],
            [`BIC Range · ${TIER_LABEL[carrierTier]}`,"center"],
            ["","center"],
          ].map(([h,align],i) => (
            <div key={i} style={{
              fontFamily:FONT.sans,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",
              color:i===2?"#92400e":i===3?"#166534":C.textMuted,textAlign:align,
            }}>{h}</div>
          ))}
        </div>

        {metrics.length === 0 && (
          <div style={{padding:"40px",textAlign:"center",fontFamily:FONT.sans,fontSize:13,color:C.textMuted}}>
            No metrics for {BENCH_CAT_SHORT[activeCat]} in {BENCH_LOB_SHORT[activeLobKey]}.
          </div>
        )}

        {metrics.map((m, i) => {
          const hib     = isHigherBetter(m);
          const overKey = `${activeLobKey}:${m.metric}:${carrierTier}`;
          const bench   = benchmarkOverrides?.[overKey] || getBenchForTier(m, carrierTier);
          const key     = makeMetricKey(activeLobKey, m.metric);
          const v       = values[key] || "";
          const st      = getStatus(v, bench, hib);
          return (
            <div key={m.metric} style={{
              display:"grid",gridTemplateColumns:"2.2fr 110px 140px 140px 28px",
              alignItems:"center",padding:"13px 18px",
              background:i%2===0?"white":"#fafcfa",
              borderBottom:"1px solid #edf5f0",
            }}>
              {/* Name + units + direction */}
              <div>
                <div style={{fontFamily:FONT.sans,fontSize:12,fontWeight:600,color:C.textMid,lineHeight:1.3}}>{m.metric}</div>
                <div style={{fontFamily:FONT.sans,fontSize:10,color:C.textMuted,marginTop:2}}>
                  {m.units} · {hib ? "↑ Higher = better" : "↓ Lower = better"}
                </div>
              </div>

              {/* Input */}
              <div style={{position:"relative"}}>
                <input value={v} onChange={e => setVal(key, e.target.value)} placeholder="—"
                  style={{
                    width:"100%",padding:"7px 28px 7px 10px",boxSizing:"border-box",
                    border:"1.5px solid "+(st?STATUS_BORD[st]:"#d8ebe2"),
                    borderRadius:5,fontSize:12,fontFamily:FONT.mono,outline:"none",
                    background:st?STATUS_BG[st]:"white",
                    color:st?STATUS_COLOR[st]:C.text,
                  }}/>
                <span style={{position:"absolute",right:7,top:"50%",transform:"translateY(-50%)",
                  fontSize:9,color:C.textMuted,fontFamily:FONT.mono,pointerEvents:"none"}}>{m.units}</span>
              </div>

              {/* IND range */}
              <div style={{textAlign:"center"}}>
                {bench.indMin!=null && bench.indMax!=null ? (
                  <>
                    <div style={{fontFamily:FONT.mono,fontSize:12,color:"#92400e",fontWeight:600}}>
                      {fmt(bench.indMin)} – {fmt(bench.indMax)}
                    </div>
                    <div style={{fontSize:9,color:C.textMuted}}>industry</div>
                  </>
                ) : <span style={{color:C.textMuted}}>—</span>}
              </div>

              {/* BIC range */}
              <div style={{textAlign:"center"}}>
                {bench.bicMin!=null && bench.bicMax!=null ? (
                  <>
                    <div style={{fontFamily:FONT.mono,fontSize:12,color:"#166534",fontWeight:700}}>
                      {fmt(bench.bicMin)} – {fmt(bench.bicMax)}
                    </div>
                    <div style={{fontSize:9,color:C.textMuted}}>best-in-class</div>
                  </>
                ) : <span style={{color:C.textMuted}}>—</span>}
              </div>

              {/* Status dot */}
              <div style={{display:"flex",justifyContent:"center"}}>
                {st ? (
                  <span title={STATUS_LABEL[st]}
                    style={{width:9,height:9,borderRadius:"50%",background:STATUS_COLOR[st],display:"inline-block"}}/>
                ) : (
                  <span style={{width:9,height:9,borderRadius:"50%",background:"#d8ebe2",display:"inline-block"}}/>
                )}
              </div>
            </div>
          );
        })}

        {/* Legend footer */}
        <div style={{padding:"11px 18px",background:"#f7faf8",borderTop:"1px solid #d8ebe2",
          display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
          {[["bic","BIC — Best-in-Class"],["ind","Industry Range"],["low","Below Industry"]].map(([k,l]) => (
            <div key={k} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:STATUS_COLOR[k]}}/>
              <span style={{fontFamily:FONT.sans,fontSize:11,color:C.textSoft}}>{l}</span>
            </div>
          ))}
          <span style={{marginLeft:"auto",fontSize:11,color:C.textSoft,fontFamily:FONT.sans}}>
            {filledOnPage}/{metrics.length} entered on this page
          </span>
        </div>
      </div>

      {/* Sticky footer */}
      <div style={{position:"sticky",bottom:0,background:"white",borderTop:"1px solid #d8ebe2",
        padding:"14px 0",display:"flex",justifyContent:"space-between",alignItems:"center",
        boxShadow:"0 -2px 12px rgba(0,0,0,0.06)"}}>
        <button style={{...btnSecondary,borderRadius:6}} onClick={handleBack}><ArrowLeft size={14}/> Back</button>
        <div style={{fontSize:12,color:C.textSoft,fontFamily:FONT.sans}}>
          {isLastPage
            ? <span style={{color:tierColor,fontWeight:700}}>All sections complete — view results</span>
            : <span>{BENCH_LOB_SHORT[activeLobKey]} · {BENCH_CAT_SHORT[activeCat]}</span>
          }
        </div>
        <button style={{...btnPrimary,borderRadius:6,background:tierColor}} onClick={handleNext}>
          {isLastPage ? <>View Results <ArrowRight size={14}/></> : <>Next <ArrowRight size={14}/></>}
        </button>
      </div>

      <SaveToast show={showToast}/>
    </PageWrap>
  );
}
