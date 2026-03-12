import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Download, RotateCcw, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { C, FONT, btnPrimary, btnSecondary, card, SAMPLE_SCORES, LENS_COLORS, METRICS_DATA } from "../constants.js";
import { Tag, ScoreRing, GapBadge, PageWrap } from "../components.jsx";
import { useApp } from "../AppContext.jsx";

// ─── Constants ────────────────────────────────────────────────
const KPI_COLOR = { green:"#166534", amber:"#92400e", red:"#991b1b" };
const KPI_BG    = { green:"#f0f7f3", amber:"#fef3c7", red:"#fee2e2" };
const KPI_BR    = { green:"#c3ddd0", amber:"#fcd34d", red:"#fca5a5" };

// L1 process categories → lens mapping
const L1_TO_LENS = {
  "initial claims processing":          "process_efficiency",
  "claims review and investigation":    "quality_compliance",
  "fraud detection and management":     "financial_leakage",
  "claims adjustment and disbursal":    "financial_leakage",
  "litigation and subrogation":         "financial_leakage",
};
const LENS_LABELS_MAP = {
  process_efficiency:  "Process Efficiency",
  financial_leakage:   "Financial Leakage",
  quality_compliance:  "Quality & Compliance",
  technology:          "Technology Utilization",
  org_performance:     "Org. Performance",
};
const LENS_COLOR_KEY = {
  process_efficiency:  "teal",
  financial_leakage:   "amber",
  quality_compliance:  "forest",
  technology:          "navy",
  org_performance:     "rose",
};

// Metric category → lens mapping (for metrics path score computation)
const CAT_TO_LENS = {
  "Cost Efficiency":     "process_efficiency",
  "Claim Effectiveness": "financial_leakage",
  "Customer Experience": "quality_compliance",
  "Adjuster Productivity":"org_performance",
  "Fraud Prevention":    "financial_leakage",
};

// ─── Dollar value calculation ─────────────────────────────────
// Basis: tier-based estimated DWP × gap-adjusted industry multipliers
// Tier 1 (>$5B DWP):   midpoint $7B
// Tier 2 (>$1B DWP):   midpoint $2.5B
// Tier 3 (>$500M DWP): midpoint $750M
// Each opportunity: gap_pct × DWP × category_leakage_factor
function calcValueOpportunities(lensScores, tier=2) {
  const DWP = tier===1 ? 7000 : tier===2 ? 2500 : 750; // $M
  const opportunities = [];

  const procEff = lensScores.process_efficiency || 65;
  const finLeak = lensScores.financial_leakage  || 65;
  const tech    = lensScores.technology         || 65;

  // Subrogation recovery: financial leakage gap × 8% of DWP (industry avg subrogable losses)
  const subGap = Math.max(0, 65 - finLeak) / 100;
  if (subGap > 0) {
    const val = Math.round(DWP * 0.08 * subGap * 0.6 * 10) / 10;
    opportunities.push({ label:"Subrogation & Leakage Recovery", value:`$${val}M`, basis:`${Math.round(subGap*100)}pp gap × estimated subrogable loss base`, color:"#166534" });
  }

  // STP/Automation: technology gap × est. claim count × $150/claim processing cost
  const techGap = Math.max(0, 65 - tech) / 100;
  if (techGap > 0) {
    const estClaims = DWP * 8; // ~8 claims per $M DWP (industry avg)
    const val = Math.round(estClaims * techGap * 150 / 1000000 * 10) / 10;
    opportunities.push({ label:"STP & Automation Gains", value:`$${val}M`, basis:`${Math.round(techGap*100)}pp automation gap × est. ${Math.round(estClaims/1000)}K claims × $150/claim`, color:"#1e3a5f" });
  }

  // Cycle time & process: process efficiency gap × 3% of DWP (LAE reduction potential)
  const procGap = Math.max(0, 65 - procEff) / 100;
  if (procGap > 0) {
    const val = Math.round(DWP * 0.03 * procGap * 10) / 10;
    opportunities.push({ label:"Cycle Time & LAE Reduction", value:`$${val}M`, basis:`${Math.round(procGap*100)}pp process gap × LAE reduction multiplier`, color:"#92400e" });
  }

  if (opportunities.length === 0) {
    opportunities.push({ label:"Portfolio performing above median", value:"<$0.5M", basis:"All lenses at or above industry median", color:"#166534" });
  }
  return opportunities;
}

// ─── Compute scores from metrics data (metrics path) ──────────
function computeScoresFromMetrics(metricsData, carrierInfo) {
  const lensAccum = {};
  const LENS_KEYS = ["process_efficiency","financial_leakage","quality_compliance","technology","org_performance"];
  LENS_KEYS.forEach(k => { lensAccum[k] = { total:0, count:0 }; });

  const ALL_CATS = Object.keys(METRICS_DATA);
  const lobs = carrierInfo?.lobs?.length > 0 ? carrierInfo.lobs : ["pa"];

  lobs.forEach(lob => {
    ALL_CATS.forEach(cat => {
      const lensKey = CAT_TO_LENS[cat];
      if (!lensKey) return;
      const metrics = METRICS_DATA[cat] || [];
      metrics.forEach(([name, unit, higher, bench]) => {
        const key = `${lob}-${cat}-${name}`;
        const raw = metricsData?.[key];
        if (!raw || raw === "") return;
        const val = parseFloat(raw);
        if (isNaN(val) || bench === 0) return;
        // Score 0-100: at benchmark = 65, at 2× benchmark = 100 (or inverse for lower-is-better)
        let score;
        if (higher) {
          score = Math.min(100, Math.max(0, (val / bench) * 65));
        } else {
          score = Math.min(100, Math.max(0, (bench / Math.max(val, 0.01)) * 65));
        }
        lensAccum[lensKey].total += score;
        lensAccum[lensKey].count++;
      });
    });
  });

  const lensScores = {};
  LENS_KEYS.forEach(k => {
    lensScores[k] = lensAccum[k].count > 0
      ? Math.round(lensAccum[k].total / lensAccum[k].count)
      : null;
  });
  return lensScores;
}

// ─── Compute scores from maturity questionnaire (process path) ─
function computeScoresFromMaturity(maturityScores) {
  const lensAccum = {};
  Object.entries(L1_TO_LENS).forEach(([, v]) => { lensAccum[v] = { total:0, count:0 }; });
  // Also init tech and org since process path doesn't cover them directly
  lensAccum.technology    = { total:0, count:0 };
  lensAccum.org_performance = { total:0, count:0 };

  // maturityScores keys: "L3QuestionText_tech" / "L3QuestionText_proc"
  // We need the QUESTIONS_DATA to know which L1 each question belongs to
  // But we don't import it here — use stored scores + key pattern
  Object.entries(maturityScores).forEach(([key, val]) => {
    if (val === null || val === undefined) return;
    const isTech = key.endsWith("_tech");
    const isProc = key.endsWith("_proc");
    if (!isTech && !isProc) return;
    // Normalize 1-5 → 20-100
    const score = ((val - 1) / 4) * 80 + 20;
    // Without L1 info per key, distribute equally across all lenses
    // (in a full implementation we'd store l1 alongside scores)
    // For now: tech scores → technology lens, proc scores → process_efficiency & quality_compliance
    if (isTech) {
      lensAccum.technology.total += score;
      lensAccum.technology.count++;
    } else {
      lensAccum.process_efficiency.total += score;
      lensAccum.process_efficiency.count++;
      lensAccum.quality_compliance.total += score;
      lensAccum.quality_compliance.count++;
    }
  });

  const result = {};
  Object.entries(lensAccum).forEach(([k,v]) => {
    result[k] = v.count > 0 ? Math.round(v.total / v.count) : null;
  });
  return result;
}

// ─── Build display scores for UI ──────────────────────────────
function buildDisplayScores(lensScores) {
  return SAMPLE_SCORES.map(s => {
    const lensKey = Object.entries(LENS_LABELS_MAP).find(([,v]) => v === s.label || v.startsWith(s.label.split(" ")[0]))?.[0];
    const computed = lensKey ? lensScores[lensKey] : null;
    return {
      ...s,
      score: computed ?? s.score,
      gap:   computed !== null && computed !== undefined ? computed - 65 : s.gap,
    };
  });
}

// ─── Radar chart ──────────────────────────────────────────────
function RadarChart({ scores, size }) {
  const sz = size || 300;
  const cx = sz/2, cy = sz/2, r = sz*0.36;
  const n = scores.length;
  const angles = scores.map((_,i) => (i*2*Math.PI/n) - Math.PI/2);
  const pt = (val,idx) => { const a=angles[idx],rr=(val/100)*r; return [cx+rr*Math.cos(a), cy+rr*Math.sin(a)]; };
  const toPath = vals => vals.map((v,i)=>{ const [x,y]=pt(v,i); return (i===0?"M":"L")+x.toFixed(1)+","+y.toFixed(1); }).join(" ")+" Z";

  return (
    <svg width={sz} height={sz} style={{overflow:"visible"}}>
      {[20,40,60,80,100].map(gl=>(
        <polygon key={gl} points={angles.map(a=>{const rr=(gl/100)*r; return `${(cx+rr*Math.cos(a)).toFixed(1)},${(cy+rr*Math.sin(a)).toFixed(1)}`;}).join(" ")} fill="none" stroke="#edf5f0" strokeWidth={1}/>
      ))}
      {angles.map((a,i)=>(<line key={i} x1={cx} y1={cy} x2={(cx+r*Math.cos(a)).toFixed(1)} y2={(cy+r*Math.sin(a)).toFixed(1)} stroke="#d8ebe2" strokeWidth={1}/>))}
      <path d={toPath(scores.map(()=>80))} fill="#1a4731" fillOpacity={0.04} stroke="#1a4731" strokeWidth={1.5} strokeDasharray="5,3"/>
      <path d={toPath(scores.map(()=>65))} fill="#92400e" fillOpacity={0.04} stroke="#92400e" strokeWidth={1.5} strokeDasharray="5,3"/>
      <path d={toPath(scores.map(s=>s.score))} fill="#0f766e" fillOpacity={0.15} stroke="#0f766e" strokeWidth={2.5}/>
      {scores.map((s,i)=>{const lc=LENS_COLORS[s.colorKey],[x,y]=pt(s.score,i); return <circle key={i} cx={x} cy={y} r={5} fill={lc.color} stroke="white" strokeWidth={2}/>;})}
      {scores.map((s,i)=>{
        const a=angles[i],lr=r+30,lx=cx+lr*Math.cos(a),ly=cy+lr*Math.sin(a),lc=LENS_COLORS[s.colorKey];
        const words=s.label.split(" ");
        return (
          <text key={i} x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontFamily="Inter,sans-serif">
            {words.map((w,wi)=>(
              <tspan key={wi} x={lx.toFixed(1)} dy={wi===0?(-(words.length-1)*7)+"px":"14px"} fontSize={10} fontWeight={600} fill={lc.color}>{w}</tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Spectrum Bar (reads from metricsData) ────────────────────
function SpectrumBar({ metric, tierData, orgValue }) {
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
  const fmt = v => (v >= 1000 ? (v/1000).toFixed(1)+"K" : v%1===0 ? v.toString() : v.toFixed(1));

  const orgNum = orgValue !== "" && orgValue !== undefined ? parseFloat(orgValue) : null;
  const orgPct = orgNum !== null && !isNaN(orgNum) ? pct(orgNum) : null;
  let orgStatus = "ind";
  if (orgNum !== null && !isNaN(orgNum)) {
    const inBIC = isLowerBetter ? orgNum <= bicMax : orgNum >= bicMin;
    const inInd = isLowerBetter ? orgNum <= indMax : orgNum >= indMin;
    orgStatus = inBIC ? "bic" : inInd ? "ind" : "below";
  }
  const statusColor = { bic:"#166534", ind:"#92400e", below:"#991b1b" };
  const statusBg    = { bic:"#f0f7f3", ind:"#fef3c7", below:"#fee2e2" };

  return (
    <div style={{display:"grid",gridTemplateColumns:"220px 90px 1fr 110px",gap:14,padding:"14px 18px",borderBottom:"1px solid #edf5f0",alignItems:"center"}}>
      <div>
        <div style={{fontFamily:FONT.sans,fontSize:12,fontWeight:600,color:C.textMid}}>{metric.metric}</div>
        <div style={{fontFamily:FONT.sans,fontSize:10,color:C.textMuted,marginTop:1}}>{metric.units}</div>
      </div>
      {/* Your value — read-only from metrics input */}
      <div style={{
        padding:"6px 10px",borderRadius:5,fontSize:12,fontFamily:FONT.mono,
        background: orgNum!==null ? statusBg[orgStatus] : "#f7faf8",
        color: orgNum!==null ? statusColor[orgStatus] : C.textMuted,
        border:"1.5px solid "+(orgNum!==null ? statusColor[orgStatus]+"44" : "#e2e8f0"),
        textAlign:"center", fontWeight: orgNum!==null ? 700 : 400,
      }}>
        {orgNum!==null ? `${orgNum} ${metric.units||""}`.trim() : "—"}
      </div>
      {/* Spectrum bar — triangle clips fix: no overflow:hidden on wrapper */}
      <div style={{paddingTop:14}}>
        <div style={{position:"relative",height:18,borderRadius:4,marginBottom:4}}>
          {/* Background zones */}
          <div style={{position:"absolute",inset:0,background:"#fee2e2",borderRadius:4}}/>
          <div style={{position:"absolute",left:pct(indMin)+"%",width:(pct(indMax)-pct(indMin))+"%",top:0,bottom:0,background:"linear-gradient(90deg,#fde68a,#fbbf24)"}}/>
          <div style={{position:"absolute",left:pct(bicMin)+"%",width:(pct(bicMax)-pct(bicMin))+"%",top:0,bottom:0,background:"linear-gradient(90deg,#86efac,#22c55e)"}}/>
          {/* Inverted triangle "You are here" — positioned relative to bar, overflow visible */}
          {orgPct !== null && (
            <div style={{position:"absolute",left:orgPct+"%",top:-14,transform:"translateX(-50%)",zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",pointerEvents:"none"}}>
              <div style={{fontSize:8,fontWeight:700,color:statusColor[orgStatus],fontFamily:FONT.sans,whiteSpace:"nowrap",marginBottom:1}}>▲ You</div>
              <div style={{width:0,height:0,borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderBottom:"8px solid "+statusColor[orgStatus]}}/>
            </div>
          )}
        </div>
        <div style={{position:"relative",height:14}}>
          {[{v:indMin,c:"#92400e"},{v:bicMin,c:"#166534"},{v:bicMax,c:"#166534"},{v:indMax,c:"#92400e"}].map(({v,c},i)=>(
            <span key={i} style={{position:"absolute",left:pct(v)+"%",transform:"translateX(-50%)",fontSize:9,fontWeight:600,color:c,fontFamily:FONT.mono,whiteSpace:"nowrap"}}>{fmt(v)}</span>
          ))}
        </div>
      </div>
      <div style={{textAlign:"right",fontSize:10,fontFamily:FONT.mono}}>
        <div style={{color:"#166534",fontWeight:700,marginBottom:2}}>BIC {fmt(bicMin)}–{fmt(bicMax)}</div>
        <div style={{color:"#92400e"}}>Ind {fmt(indMin)}–{fmt(indMax)}</div>
      </div>
    </div>
  );
}

function BenchmarkTable({ lobKey, tier, metricsData, carrierLobs }) {
  const { benchmarks } = useApp();
  const [activeCat, setActiveCat] = useState(null);
  const data = (benchmarks && benchmarks[lobKey]) ? benchmarks[lobKey] : [];
  const cats = [...new Set(data.map(m=>m.category).filter(Boolean))];
  const tierKey = tier===1?"tier1":tier===2?"tier2":"tier3";
  const displayData = activeCat ? data.filter(m=>m.category===activeCat) : data;

  // Map Page4 metricsData keys to benchmark metric values
  // Page4 key format: "{lobId}-{category}-{metricName}"
  // We need to find the matching value for each benchmark metric
  const getOrgValue = (metricName) => {
    if (!metricsData) return "";
    // Try each LOB and each category
    const lobs = carrierLobs?.length > 0 ? carrierLobs : ["pa"];
    const cats = Object.keys(METRICS_DATA);
    for (const lob of lobs) {
      for (const cat of cats) {
        const key = `${lob}-${cat}-${metricName}`;
        if (metricsData[key] !== undefined && metricsData[key] !== "") return metricsData[key];
      }
    }
    return "";
  };

  const enteredCount = displayData.filter(m => getOrgValue(m.metric) !== "").length;

  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <button onClick={()=>setActiveCat(null)} style={{padding:"5px 12px",borderRadius:5,fontSize:11,fontWeight:!activeCat?700:400,border:"1px solid "+((!activeCat)?"#1a4731":"#d8ebe2"),background:!activeCat?"#1a4731":"white",color:!activeCat?"white":C.textSoft,cursor:"pointer"}}>All</button>
        {cats.map(c=>(
          <button key={c} onClick={()=>setActiveCat(c===activeCat?null:c)} style={{padding:"5px 12px",borderRadius:5,fontSize:11,fontWeight:activeCat===c?700:400,border:"1px solid "+(activeCat===c?"#1a4731":"#d8ebe2"),background:activeCat===c?"#1a4731":"white",color:activeCat===c?"white":C.textSoft,cursor:"pointer"}}>
            {c.replace(" metrics","").replace(" and efficiency","")}
          </button>
        ))}
        {enteredCount>0 && <span style={{marginLeft:"auto",fontSize:11,color:"#1a4731",fontWeight:600,fontFamily:FONT.sans}}>{enteredCount} values from your assessment</span>}
      </div>

      {/* Legend */}
      <div style={{...card,padding:"10px 16px",marginBottom:14,display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
        {[["#fee2e2","#991b1b","Below industry"],["#fbbf24","#92400e","Industry range"],["#22c55e","#166534","Best-in-Class"]].map(([bg,clr,lbl])=>(
          <div key={lbl} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:12,height:7,borderRadius:2,background:bg,border:"1px solid "+clr+"55"}}/>
            <span style={{fontFamily:FONT.sans,fontSize:11,color:C.textSoft}}>{lbl}</span>
          </div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <span style={{fontSize:11,color:"#1a4731",fontWeight:700}}>▲ You</span>
          <span style={{fontFamily:FONT.sans,fontSize:11,color:C.textSoft}}>Your position (from Metrics tab)</span>
        </div>
        <span style={{marginLeft:"auto",fontFamily:FONT.sans,fontSize:10,color:C.textMuted,fontStyle:"italic"}}>
          Values auto-populated from your Metrics Assessment
        </span>
      </div>

      <div style={{...card,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"220px 90px 1fr 110px",gap:14,padding:"10px 18px",background:"#f7faf8",borderBottom:"2px solid #1a4731"}}>
          {[["Metric","left"],["Your Value","left"],["Benchmark Spectrum","left"],["Reference","right"]].map(([h,align])=>(
            <div key={h} style={{fontFamily:FONT.sans,fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",textAlign:align}}>{h}</div>
          ))}
        </div>
        {displayData.map((m,i)=>(
          <SpectrumBar key={m.metric+i} metric={m} tierData={m[tierKey]}
            orgValue={getOrgValue(m.metric)}/>
        ))}
        {displayData.length===0 && (
          <div style={{padding:"32px",textAlign:"center",fontFamily:FONT.sans,fontSize:13,color:C.textMuted}}>
            No benchmark data for this LOB. Select a different line.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Process results tab ──────────────────────────────────────
function TabProcessResults({ maturityScores }) {
  const SCALE_LABELS = [
    "Minimal alignment — significant improvements needed",
    "Partial alignment — multiple areas require enhancement",
    "Some alignment — opportunities exist for optimization",
    "Strong alignment — minor gaps remain",
    "Fully aligned — no significant improvements required",
  ];
  const SCALE_COLORS = ["#dc2626","#ea580c","#ca8a04","#16a34a","#166534"];
  const SCALE_BG     = ["#fef2f2","#fff7ed","#fefce8","#f0fdf4","#dcfce7"];

  // Group by l3 key stem (remove _tech/_proc suffix)
  const l3Keys = [...new Set(
    Object.keys(maturityScores)
      .filter(k=>k.endsWith("_tech")||k.endsWith("_proc"))
      .map(k=>k.replace(/_tech$|_proc$/,""))
  )];

  const scored = l3Keys.filter(k=>maturityScores[k+"_tech"] && maturityScores[k+"_proc"]).length;
  const totalQuestions = l3Keys.length;

  if (totalQuestions === 0) {
    return (
      <div style={{...card,padding:"40px",textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:12}}>📋</div>
        <div style={{fontFamily:FONT.serif,fontSize:16,fontWeight:700,color:C.text,marginBottom:8}}>No process scores found</div>
        <div style={{fontFamily:FONT.sans,fontSize:13,color:C.textSoft}}>Complete the Process Maturity Assessment (Step 5) to see results here.</div>
      </div>
    );
  }

  // Compute per-dimension averages (tech vs process)
  const techScores = l3Keys.map(k=>maturityScores[k+"_tech"]).filter(Boolean);
  const procScores = l3Keys.map(k=>maturityScores[k+"_proc"]).filter(Boolean);
  const avgTech = techScores.length ? (techScores.reduce((a,b)=>a+b,0)/techScores.length) : 0;
  const avgProc = procScores.length ? (procScores.reduce((a,b)=>a+b,0)/procScores.length) : 0;
  const avgCombined = (avgTech + avgProc) / 2;

  const maturityLabel = avgCombined >= 4.5 ? "Leading" : avgCombined >= 3.5 ? "Advanced" : avgCombined >= 2.5 ? "Developing" : "Foundational";
  const maturityColor = avgCombined >= 4.5 ? "#166534" : avgCombined >= 3.5 ? "#1a4731" : avgCombined >= 2.5 ? "#92400e" : "#991b1b";

  return (
    <div>
      {/* Summary cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
        {[
          {label:"Process Maturity (avg)",value:avgProc.toFixed(1)+"/5",color:"#15803d",bg:"#f0fdf4"},
          {label:"Technology Maturity (avg)",value:avgTech.toFixed(1)+"/5",color:"#0369a1",bg:"#f0f9ff"},
          {label:"Combined Maturity Level",value:maturityLabel,color:maturityColor,bg:"#f7faf8"},
        ].map(s=>(
          <div key={s.label} style={{...card,padding:"20px",borderTop:"3px solid "+s.color}}>
            <div style={{fontFamily:FONT.mono,fontSize:26,fontWeight:800,color:s.color,lineHeight:1,marginBottom:4}}>{s.value}</div>
            <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em"}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Score distribution */}
      <div style={{...card,padding:"20px 24px",marginBottom:16}}>
        <div style={{fontFamily:FONT.serif,fontSize:15,fontWeight:700,color:C.text,marginBottom:14}}>Score Distribution — {scored} of {totalQuestions} sub-processes scored</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          {[
            {label:"Process Dimension",scores:procScores,color:"#15803d"},
            {label:"Technology Dimension",scores:techScores,color:"#0369a1"},
          ].map(({label,scores,color})=>{
            const dist=[0,0,0,0,0];
            scores.forEach(s=>{ if(s>=1&&s<=5) dist[s-1]++; });
            return (
              <div key={label}>
                <div style={{fontFamily:FONT.sans,fontSize:12,fontWeight:700,color,marginBottom:10}}>{label}</div>
                {[1,2,3,4,5].map(n=>{
                  const cnt=dist[n-1];
                  const pct=scores.length?Math.round((cnt/scores.length)*100):0;
                  return (
                    <div key={n} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{fontSize:11,fontWeight:700,color:SCALE_COLORS[n-1],background:SCALE_BG[n-1],borderRadius:3,padding:"1px 7px",minWidth:18,textAlign:"center"}}>{n}</span>
                      <div style={{flex:1,height:8,borderRadius:4,background:"#edf5f0",overflow:"hidden"}}>
                        <div style={{height:"100%",width:pct+"%",background:SCALE_COLORS[n-1],borderRadius:4}}/>
                      </div>
                      <span style={{fontFamily:FONT.mono,fontSize:10,color:SCALE_COLORS[n-1],minWidth:28}}>{cnt} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Question detail table */}
      <div style={{...card,overflow:"hidden"}}>
        <div style={{padding:"12px 18px",background:"#f7faf8",borderBottom:"2px solid #1a4731",fontFamily:FONT.serif,fontSize:14,fontWeight:700,color:C.text}}>
          Sub-process Detail
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 80px",gap:0,padding:"8px 18px",background:"#f7faf8",borderBottom:"1px solid #d8ebe2"}}>
          {["Sub-process","Process","Technology","Combined"].map((h,i)=>(
            <div key={h} style={{fontFamily:FONT.sans,fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",textAlign:i>0?"center":"left"}}>{h}</div>
          ))}
        </div>
        {l3Keys.slice(0,30).map((k,i)=>{
          const t=maturityScores[k+"_tech"];
          const p=maturityScores[k+"_proc"];
          const avg=t&&p?((t+p)/2).toFixed(1):"-";
          const avgN=t&&p?(t+p)/2:null;
          return (
            <div key={k} style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 80px",gap:0,padding:"10px 18px",borderBottom:"1px solid #edf5f0",background:i%2===0?"white":"#fafcfa",alignItems:"center"}}>
              <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textMid,lineHeight:1.4}}>{k.replace(/_/g," ")}</div>
              {[p,t].map((score,si)=>(
                <div key={si} style={{textAlign:"center"}}>
                  {score ? <span style={{fontFamily:FONT.mono,fontSize:13,fontWeight:700,color:SCALE_COLORS[score-1],background:SCALE_BG[score-1],borderRadius:4,padding:"2px 8px"}}>{score}</span>
                   : <span style={{color:"#d8ebe2"}}>—</span>}
                </div>
              ))}
              <div style={{textAlign:"center"}}>
                {avgN!==null?<span style={{fontFamily:FONT.mono,fontSize:13,fontWeight:800,color:SCALE_COLORS[Math.round(avgN)-1]}}>{avg}</span>:<span style={{color:"#d8ebe2"}}>—</span>}
              </div>
            </div>
          );
        })}
        {l3Keys.length>30&&<div style={{padding:"10px 18px",fontFamily:FONT.sans,fontSize:11,color:C.textMuted,textAlign:"center"}}>Showing 30 of {l3Keys.length} sub-processes</div>}
      </div>
    </div>
  );
}

// ─── Tab: Comparative ─────────────────────────────────────────
function TabComparative({ displayScores, valueOpps }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"340px 1fr",gap:20,alignItems:"start"}}>
      <div style={{...card,padding:24,display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{fontFamily:FONT.serif,fontWeight:700,fontSize:14,color:C.text,marginBottom:4}}>Maturity Radar</div>
        <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textMuted,marginBottom:18}}>Five value dimensions</div>
        <RadarChart scores={displayScores} size={260}/>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:18,width:"100%"}}>
          {[{color:"#0f766e",dash:false,label:"Your organisation"},{color:"#92400e",dash:true,label:"Tier median (65)"},{color:"#1a4731",dash:true,label:"Best-in-class (80)"}].map(l=>(
            <div key={l.label} style={{display:"flex",alignItems:"center",gap:8}}>
              <svg width={28} height={10}><line x1={0} y1={5} x2={28} y2={5} stroke={l.color} strokeWidth={l.dash?1.5:2.5} strokeDasharray={l.dash?"4,3":"none"}/></svg>
              <span style={{fontFamily:FONT.sans,fontSize:11,color:C.textSoft}}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{...card,overflow:"hidden",marginBottom:16}}>
          <div style={{padding:"14px 18px",borderBottom:"2px solid #1a4731"}}>
            <div style={{fontFamily:FONT.serif,fontWeight:700,fontSize:15,color:C.text}}>Score Summary vs. Benchmarks</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1.4fr 60px 60px 60px 60px 100px"}}>
            {["Value Driver","Score","Median","Top 25%","Gap","Level"].map((h,i)=>(
              <div key={h} style={{padding:"9px 12px",background:"#f7faf8",borderBottom:"1px solid #d8ebe2",fontFamily:FONT.sans,fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",borderRight:i<5?"1px solid #edf5f0":"none"}}>{h}</div>
            ))}
            {displayScores.map((s,i)=>{
              const lc=LENS_COLORS[s.colorKey];
              const level=s.score>=80?"Leading":s.score>=65?"Advanced":s.score>=50?"Developing":"Foundational";
              const lvlColor=s.score>=80?"#166534":s.score>=65?"#1a4731":s.score>=50?"#92400e":"#991b1b";
              return [
                <div key={"n"+i} style={{padding:"11px 12px",borderBottom:"1px solid #edf5f0",fontFamily:FONT.sans,fontSize:13,color:C.text,fontWeight:500,borderRight:"1px solid #edf5f0"}}>{s.label}</div>,
                <div key={"s"+i} style={{padding:"11px 12px",borderBottom:"1px solid #edf5f0",fontFamily:FONT.mono,fontSize:15,fontWeight:800,color:lc.color,textAlign:"center",borderRight:"1px solid #edf5f0"}}>{s.score}</div>,
                <div key={"m"+i} style={{padding:"11px 12px",borderBottom:"1px solid #edf5f0",fontFamily:FONT.mono,fontSize:12,color:C.textSoft,textAlign:"center",borderRight:"1px solid #edf5f0"}}>65</div>,
                <div key={"t"+i} style={{padding:"11px 12px",borderBottom:"1px solid #edf5f0",fontFamily:FONT.mono,fontSize:12,color:"#1a4731",fontWeight:700,textAlign:"center",borderRight:"1px solid #edf5f0"}}>80</div>,
                <div key={"g"+i} style={{padding:"11px 12px",borderBottom:"1px solid #edf5f0",fontFamily:FONT.mono,fontSize:12,fontWeight:700,color:s.gap>=0?"#166634":"#991b1b",textAlign:"center",borderRight:"1px solid #edf5f0"}}>{s.gap>=0?"+":""}{s.gap}</div>,
                <div key={"l"+i} style={{padding:"11px 12px",borderBottom:"1px solid #edf5f0",fontFamily:FONT.sans,fontSize:11,fontWeight:700,color:lvlColor}}>{level}</div>,
              ];
            })}
          </div>
        </div>
        {/* Value opportunities */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
          {valueOpps.map(item=>(
            <div key={item.label} style={{...card,padding:"18px 16px",borderTop:"3px solid "+item.color}}>
              <div style={{fontFamily:FONT.mono,fontSize:22,fontWeight:800,color:item.color,marginBottom:4}}>{item.value}</div>
              <div style={{fontFamily:FONT.sans,fontSize:12,fontWeight:600,color:C.textMid,marginBottom:3}}>{item.label}</div>
              <div style={{fontFamily:FONT.sans,fontSize:10,color:C.textMuted,lineHeight:1.4}}>{item.basis}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────
function TabOverview({ displayScores }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14,marginBottom:12}}>
        {displayScores.map(s=>{
          const lc=LENS_COLORS[s.colorKey],isOpen=expanded===s.label;
          return (
            <div key={s.label} style={{...card,padding:20,cursor:"pointer",borderLeft:"4px solid "+lc.color,transition:"box-shadow 0.2s"}}
              onClick={()=>setExpanded(isOpen?null:s.label)}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 20px rgba(26,71,49,0.10)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 4px rgba(26,71,49,0.06)"}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{fontFamily:FONT.sans,fontSize:13,fontWeight:600,color:C.text,marginBottom:3}}>{s.label}</div>
                  <GapBadge gap={s.gap}/>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:FONT.mono,fontSize:22,fontWeight:800,color:lc.color,lineHeight:1}}>{s.score}</div>
                  <div style={{fontFamily:FONT.sans,fontSize:10,color:lc.color,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.score>=80?"Leading":s.score>=65?"Advanced":s.score>=50?"Developing":"Foundational"}</div>
                </div>
              </div>
              <div style={{height:4,borderRadius:2,background:"#edf5f0",overflow:"hidden",marginBottom:10}}>
                <div style={{height:"100%",width:s.score+"%",background:lc.color,borderRadius:2,transition:"width 0.5s"}}/>
              </div>
              <div style={{fontFamily:FONT.sans,fontSize:12,color:C.textSoft,lineHeight:1.6}}>{s.insight}</div>
              {isOpen&&(
                <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid #d8ebe2"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1.2fr 55px 55px 55px",gap:6,marginBottom:7}}>
                    {["KPI","Yours","Med.","Top"].map((h,i)=><div key={h} style={{fontFamily:FONT.sans,fontSize:9,fontWeight:700,color:i===3?"#1a4731":C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</div>)}
                  </div>
                  {s.kpis.map(k=>(
                    <div key={k.n} style={{display:"grid",gridTemplateColumns:"1.2fr 55px 55px 55px",gap:6,padding:"6px 0",borderBottom:"1px solid #edf5f0"}}>
                      <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textMid}}>{k.n}</div>
                      <div style={{fontFamily:FONT.mono,fontSize:11,color:KPI_COLOR[k.s]||C.text,fontWeight:600}}>{k.y}</div>
                      <div style={{fontFamily:FONT.mono,fontSize:11,color:C.textSoft}}>{k.b}</div>
                      <div style={{fontFamily:FONT.mono,fontSize:11,color:"#1a4731",fontWeight:700}}>{k.t}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{fontFamily:FONT.sans,fontSize:12,color:C.textSoft,fontStyle:"italic"}}>Click any card to expand KPI detail.</div>
    </div>
  );
}

// ─── Tab: Benchmarks ─────────────────────────────────────────
function TabBenchmarks({ metricsData, carrierInfo }) {
  const lobOptions = carrierInfo?.lobs?.length > 0
    ? carrierInfo.lobs.map(id=>({ id, label: {pa:"Personal Auto",ph:"Personal Home",ca:"Comm. Auto",cp:"Comm. Property",wc:"Workers Comp",gl:"Gen. Liability",bop:"BOP/BIP"}[id]||id.toUpperCase() }))
    : [{ id:"pa", label:"Personal Auto" }];

  const [lob, setLob] = useState(lobOptions[0]?.id || "pa");
  const [tier, setTier] = useState(carrierInfo?.tier || 2);

  // Map carrier LOB to benchmark LOB key
  const lobToBenchKey = { pa:"personal_lines", ph:"personal_lines", ca:"commercial_lines", cp:"commercial_lines", wc:"workers_compensation", gl:"general_liability", bop:"commercial_lines" };
  const benchLobKey = lobToBenchKey[lob] || "personal_lines";

  return (
    <div>
      <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {lobOptions.map(l=>(
            <button key={l.id} onClick={()=>setLob(l.id)} style={{padding:"6px 13px",borderRadius:5,fontSize:12,fontWeight:lob===l.id?700:400,fontFamily:FONT.sans,border:"1px solid "+(lob===l.id?"#1a4731":"#d8ebe2"),background:lob===l.id?"#1a4731":"white",color:lob===l.id?"white":C.textSoft,cursor:"pointer"}}>{l.label}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:6,marginLeft:"auto",alignItems:"center"}}>
          <span style={{fontFamily:FONT.sans,fontSize:11,color:C.textMuted}}>Tier:</span>
          {[1,2,3].map(t=>(
            <button key={t} onClick={()=>setTier(t)} style={{width:34,height:30,borderRadius:5,fontFamily:FONT.sans,fontSize:12,fontWeight:tier===t?700:400,border:"1px solid "+(tier===t?"#1a4731":"#d8ebe2"),background:tier===t?"#1a4731":"white",color:tier===t?"white":C.textSoft,cursor:"pointer"}}>T{t}</button>
          ))}
        </div>
      </div>
      <BenchmarkTable lobKey={benchLobKey} tier={tier} metricsData={metricsData} carrierLobs={carrierInfo?.lobs}/>
    </div>
  );
}

// ─── Tab: Findings ────────────────────────────────────────────
function TabFindings({ displayScores }) {
  const strengths    = displayScores.filter(s=>s.score>=65).map(s=>`${s.label}: score ${s.score} (${s.score>=80?"Leading":"+"+Math.abs(s.gap)+"pp above median"})`);
  const improvements = displayScores.filter(s=>s.score<65).map(s=>`${s.label}: ${Math.abs(s.gap)}pp below median — estimated opportunity exists`);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {[
          {title:"Strengths",color:"#166534",border:"#c3ddd0",bg:"#f0f7f3",Icon:CheckCircle2,items:strengths.length?strengths:["No lenses above median yet — complete the assessment for personalized strengths"]},
          {title:"Improvement Areas",color:"#991b1b",border:"#fca5a5",bg:"#fee2e2",Icon:AlertCircle,items:improvements.length?improvements:["All lenses at or above industry median — strong baseline performance"]},
        ].map(({title,color,border,bg,Icon,items})=>(
          <div key={title} style={{...card,padding:22,borderTop:"3px solid "+color}}>
            <div style={{fontFamily:FONT.serif,fontSize:14,fontWeight:700,color,marginBottom:14}}>{title}</div>
            {items.map((s,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:10}}>
                <Icon size={13} color={color} style={{flexShrink:0,marginTop:2}}/>
                <span style={{fontFamily:FONT.sans,fontSize:12,color:C.textMid,lineHeight:1.6}}>{s}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{...card,padding:22}}>
        <div style={{fontFamily:FONT.serif,fontWeight:700,fontSize:15,color:C.text,marginBottom:16}}>KPI Heatmap by Lens</div>
        {displayScores.map(s=>{
          const lc=LENS_COLORS[s.colorKey];
          return (
            <div key={s.label} style={{marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <span style={{fontFamily:FONT.sans,fontSize:12,fontWeight:600,color:C.text}}>{s.label}</span>
                <div style={{flex:1,height:1,background:"#d8ebe2"}}/>
                <span style={{fontFamily:FONT.mono,fontSize:12,color:lc.color,fontWeight:700}}>{s.score}/100</span>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {s.kpis.map(k=><div key={k.n} style={{padding:"4px 10px",borderRadius:4,fontFamily:FONT.sans,fontSize:11,fontWeight:500,background:KPI_BG[k.s],color:KPI_COLOR[k.s],border:"1px solid "+KPI_BR[k.s]}}>{k.n}</div>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Roadmap ─────────────────────────────────────────────
function TabRoadmap({ displayScores, valueOpps }) {
  const horizons = [
    {label:"Near Term (0–6 months)",color:"#166534",bg:"#f0f7f3",border:"#c3ddd0",items:[
      {t:"Launch STP for low-complexity claims under $5K",lens:"Technology",eff:"Med",imp:"High"},
      {t:"AI-assisted subrogation identification workflow",lens:"Financial",eff:"Low",imp:"High"},
      {t:"Digital FNOL with real-time coverage verification",lens:"CX",eff:"Med",imp:"Med"},
      {t:"30-day reserve accuracy checkpoint cadence",lens:"Financial",eff:"Low",imp:"Med"},
    ]},
    {label:"Mid Term (6–18 months)",color:"#1a4731",bg:"#f0f7f3",border:"#c3ddd0",items:[
      {t:"Subrogation workflow upgrade with MSP Navigator",lens:"Financial",eff:"High",imp:"High"},
      {t:"Adjuster coaching program tied to KPI scorecards",lens:"Org",eff:"Med",imp:"Med"},
      {t:"IDP for claims correspondence modernisation",lens:"Technology",eff:"High",imp:"High"},
      {t:"Claims portal self-service expansion",lens:"CX",eff:"Med",imp:"Med"},
    ]},
    {label:"Long Term (18+ months)",color:"#92400e",bg:"#fef3c7",border:"#fcd34d",items:[
      {t:"Full omni-channel digital claims service layer",lens:"Technology",eff:"High",imp:"High"},
      {t:"Predictive litigation analytics",lens:"Financial",eff:"High",imp:"High"},
      {t:"Real-time ML severity prediction for reserves",lens:"Financial",eff:"High",imp:"High"},
    ]},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Value creation — now calculated */}
      <div style={{...card,padding:20,borderTop:"3px solid #1a4731"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontFamily:FONT.serif,fontWeight:700,fontSize:15,color:C.text,marginBottom:4}}>Estimated Value Creation Opportunity</div>
            <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textMuted}}>
              Based on gap-to-median analysis × tier-adjusted DWP estimates × industry leakage multipliers (T1 &gt;$5B · T2 &gt;$1B · T3 &gt;$500M DWP)
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,background:"#f0f7f3",border:"1px solid #c3ddd0",borderRadius:5,padding:"5px 10px",cursor:"help"}} title="Tier 1 (>$5B DWP) = $7B midpoint | Tier 2 (>$1B DWP) = $2.5B midpoint | Tier 3 (>$500M DWP) = $750M midpoint. Formula: gap_pp × DWP × category leakage factor. Indicative only.">
            <Info size={11} color="#1a4731"/>
            <span style={{fontFamily:FONT.sans,fontSize:10,color:"#1a4731",fontWeight:600}}>Calculation basis</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
          {valueOpps.map(item=>(
            <div key={item.label} style={{textAlign:"center",padding:"16px 12px",borderRadius:6,border:"1px solid "+item.color+"33",background:item.color+"08"}}>
              <div style={{fontFamily:FONT.mono,fontSize:22,fontWeight:800,color:item.color}}>{item.value}</div>
              <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textMid,fontWeight:600,marginTop:4}}>{item.label}</div>
              <div style={{fontFamily:FONT.sans,fontSize:10,color:C.textMuted,marginTop:4,lineHeight:1.4}}>{item.basis}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:12,padding:"8px 12px",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:4,fontFamily:FONT.sans,fontSize:11,color:"#92400e"}}>
          ⚠ Estimates are indicative only, based on industry benchmarks and tier-adjusted DWP assumptions. Actual value depends on carrier-specific premium base and implementation quality.
        </div>
      </div>
      {horizons.map(p=>(
        <div key={p.label} style={{...card,overflow:"hidden"}}>
          <div style={{padding:"12px 20px",background:p.bg,borderBottom:"1px solid "+p.border,borderLeft:"4px solid "+p.color}}>
            <span style={{fontFamily:FONT.sans,fontSize:12,fontWeight:700,color:p.color}}>{p.label}</span>
          </div>
          {p.items.map((item,i)=>(
            <div key={item.t} style={{display:"grid",gridTemplateColumns:"1fr 90px 75px 75px",gap:10,padding:"12px 20px",borderBottom:i<p.items.length-1?"1px solid #edf5f0":"none",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                <ArrowRight size={11} color={p.color} style={{flexShrink:0,marginTop:3}}/>
                <span style={{fontFamily:FONT.sans,fontSize:12,color:C.textMid,lineHeight:1.5}}>{item.t}</span>
              </div>
              <div style={{fontFamily:FONT.sans,fontSize:10,color:C.textSoft,background:"#f7faf8",borderRadius:4,padding:"3px 8px",textAlign:"center",border:"1px solid #d8ebe2"}}>{item.lens}</div>
              <div style={{fontFamily:FONT.sans,fontSize:10,fontWeight:600,color:item.eff==="Low"?"#166534":item.eff==="Med"?"#92400e":"#991b1b",textAlign:"center"}}>{item.eff} effort</div>
              <div style={{fontFamily:FONT.sans,fontSize:10,fontWeight:600,color:item.imp==="High"?"#166534":"#1a4731",textAlign:"center"}}>{item.imp} impact</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page5 ───────────────────────────────────────────────
export default function Page5({ onBack, setPage, onNext, onDashboard, role, readOnly, assessment,
  metricsData, maturityScores, assessmentPath, carrierInfo }) {

  const hasMetrics  = metricsData  && Object.keys(metricsData).length > 0;
  const hasMaturity = maturityScores && Object.keys(maturityScores).length > 0;
  const hasRealData = hasMetrics || hasMaturity;

  // Compute lens scores from real data
  const lensScores = useMemo(()=>{
    if (readOnly && assessment?.lens_scores) return assessment.lens_scores;
    if (hasMetrics)  return computeScoresFromMetrics(metricsData, carrierInfo);
    if (hasMaturity) return computeScoresFromMaturity(maturityScores);
    return {};
  }, [metricsData, maturityScores, readOnly, assessment]);

  const displayScores = useMemo(()=>buildDisplayScores(lensScores), [lensScores]);

  const overall = useMemo(()=>{
    const vals = Object.values(lensScores).filter(v=>v!==null&&v!==undefined);
    return vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)
      : Math.round(SAMPLE_SCORES.reduce((a,s)=>a+s.score,0)/SAMPLE_SCORES.length);
  }, [lensScores]);

  const maturity = overall>=80?"Leading":overall>=65?"Advanced":overall>=50?"Developing":"Foundational";
  const maturityColor = overall>=80?"#166534":overall>=65?"#1a4731":overall>=50?"#92400e":"#991b1b";

  const valueOpps = useMemo(()=>calcValueOpportunities(lensScores, carrierInfo?.tier||2), [lensScores, carrierInfo]);

  // Tabs — show process tab if maturity data exists
  const TABS = [
    { id:"comparative", label:"Comparative View" },
    { id:"overview",    label:"Score Overview"   },
    { id:"benchmarks",  label:"Benchmark Table"  },
    ...(hasMaturity ? [{ id:"process", label:"Process Results" }] : []),
    { id:"findings",    label:"Key Findings"     },
    { id:"priorities",  label:"Roadmap"          },
  ];
  const [tab, setTab] = useState("comparative");

  // PDF export
  const handleExportPDF = () => {
    const style = document.createElement("style");
    style.id = "print-style";
    style.innerHTML = `@media print { .no-print { display:none!important; } body { background:white; } }`;
    document.head.appendChild(style);
    window.print();
    setTimeout(()=>{ const el=document.getElementById("print-style"); if(el) el.remove(); }, 1000);
  };

  return (
    <PageWrap maxWidth={1100}>
      {/* ReadOnly banner */}
      {readOnly && (
        <div style={{background:"#f0f7f3",border:"1px solid #c3ddd0",borderRadius:6,padding:"10px 16px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontFamily:FONT.sans,fontSize:12,color:"#1a4731"}}>
            📋 Viewing historical results for <strong>{assessment?.carrier_name}</strong>
            {assessment?.completed_at&&` — completed ${new Date(assessment.completed_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}`}
          </span>
          <button onClick={onBack} style={{fontFamily:FONT.sans,fontSize:12,color:"#1a4731",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>← Back to Hub</button>
        </div>
      )}

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,flexWrap:"wrap",gap:14}}>
        <div>
          <div style={{marginBottom:10}}><Tag color="forest">{readOnly?"Historical Results":"Assessment Complete"}</Tag></div>
          <h1 style={{fontFamily:FONT.serif,fontSize:28,fontWeight:700,color:C.text,marginBottom:6}}>
            {readOnly&&assessment?.carrier_name?assessment.carrier_name+" — ":""}Claims Maturity Results
          </h1>
          <p style={{fontFamily:FONT.sans,fontSize:13,color:C.textSoft}}>
            {carrierInfo?.name||assessment?.carrier_name||"Assessment"} · {carrierInfo?.lobs?.join(", ")||"All LOBs"} · {new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"})}
          </p>
          {!hasRealData && (
            <div style={{marginTop:8,display:"inline-flex",alignItems:"center",gap:5,background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:4,padding:"4px 10px"}}>
              <Info size={11} color="#92400e"/>
              <span style={{fontFamily:FONT.sans,fontSize:11,color:"#92400e"}}>Showing sample data — complete Metrics or Process assessment for real scores</span>
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:10}} className="no-print">
          <button style={{...btnSecondary,borderRadius:6}} onClick={onBack}><ArrowLeft size={13}/> Back</button>
          <button style={{...btnPrimary,borderRadius:6}} onClick={handleExportPDF}><Download size={13}/> Export PDF</button>
        </div>
      </div>

      {/* Overall score */}
      <div style={{...card,padding:"24px 28px",marginBottom:24,borderLeft:"5px solid #1a4731",display:"flex",gap:28,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{position:"relative",width:90,height:90,flexShrink:0}}>
          <ScoreRing score={overall} color={maturityColor} size={90}/>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontFamily:FONT.mono,fontSize:22,fontWeight:800,color:maturityColor,lineHeight:1}}>{overall}</div>
            <div style={{fontFamily:FONT.sans,fontSize:9,color:C.textMuted}}>/ 100</div>
          </div>
        </div>
        <div style={{flex:1,minWidth:200}}>
          <div style={{fontFamily:FONT.sans,fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Overall Maturity</div>
          <div style={{fontFamily:FONT.serif,fontSize:22,fontWeight:700,color:maturityColor,marginBottom:6}}>{maturity}</div>
          <div style={{fontFamily:FONT.sans,fontSize:13,color:C.textSoft,lineHeight:1.65,maxWidth:460}}>
            {displayScores.filter(s=>s.score>=65).map(s=>s.label.split(" ")[0]).join(" and ")||"Overall"} {displayScores.filter(s=>s.score>=65).length>0?"anchors the portfolio.":""}{" "}
            {displayScores.filter(s=>s.score<65).length>0&&`${displayScores.filter(s=>s.score<65).map(s=>s.label.split(" ")[0]).join(" and ")} represent${displayScores.filter(s=>s.score<65).length===1?"s":""} the primary opportunity — `}
            {valueOpps[0]&&<strong style={{color:"#1a4731"}}>{valueOpps[0].value} estimated improvement potential.</strong>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:0,borderBottom:"2px solid #d8ebe2",marginBottom:24,flexWrap:"wrap"}} className="no-print">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"10px 18px",border:"none",background:"transparent",fontFamily:FONT.sans,
            borderBottom:"2px solid "+(tab===t.id?"#1a4731":"transparent"),
            color:tab===t.id?"#1a4731":C.textSoft,
            fontWeight:tab===t.id?700:400,fontSize:13,cursor:"pointer",marginBottom:-2,
          }}>{t.label}</button>
        ))}
      </div>

      {tab==="comparative" && <TabComparative displayScores={displayScores} valueOpps={valueOpps}/>}
      {tab==="overview"    && <TabOverview displayScores={displayScores}/>}
      {tab==="benchmarks"  && <TabBenchmarks metricsData={metricsData} carrierInfo={carrierInfo}/>}
      {tab==="process"     && <TabProcessResults maturityScores={maturityScores||{}}/>}
      {tab==="findings"    && <TabFindings displayScores={displayScores}/>}
      {tab==="priorities"  && <TabRoadmap displayScores={displayScores} valueOpps={valueOpps}/>}

      <div style={{marginTop:28,display:"flex",justifyContent:"space-between"}} className="no-print">
        <button style={{...btnSecondary,borderRadius:6}} onClick={()=>setPage(1)}><RotateCcw size={13}/> Start New</button>
        {onNext&&<button style={{...btnPrimary,borderRadius:6}} onClick={onNext}>Process Selection <ArrowRight size={14}/></button>}
      </div>
    </PageWrap>
  );
}
