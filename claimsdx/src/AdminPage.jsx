import { useState, useEffect, useMemo } from "react";
import {
  Settings, Database, Users, ChevronDown,
  BarChart3, TrendingUp, Eye, ArrowLeft, RefreshCw, AlertCircle,
} from "lucide-react";
import { C, FONT, card, btnPrimary, btnSecondary } from "../constants.js";
import { Tag, PageWrap, Nav } from "../components.jsx";
import { useApp, ROLES } from "../AppContext.jsx";
import { LOB_OPTIONS } from "../benchmarkData.js";
import { MOCK_ASSESSMENTS, getMockStats, getLensAverages, LENS_LABELS, LENS_KEYS } from "../mockData.js";
import { listAllAssessments } from "../lib/progressDB.js";

// ── Shared constants ─────────────────────────────────────────
const MATURITY_COLOR = { Leading:"#166534", Advanced:"#1a4731", Developing:"#92400e", Foundational:"#991b1b" };
const MATURITY_BG    = { Leading:"#f0f7f3", Advanced:"#f0f7f3", Developing:"#fef3c7", Foundational:"#fee2e2" };
const LENS_STROKE    = { process_efficiency:"#1a4731", financial_leakage:"#92400e", quality_compliance:"#166534", technology:"#1e3a5f", org_performance:"#9f1239" };
const CARRIER_COLORS = ["#1a4731","#1e3a5f","#9f1239","#92400e","#0f766e"];
const LOB_LABEL      = { pa:"Personal Auto", ph:"Personal Home", ca:"Comm. Auto", cp:"Comm. Property", wc:"Workers Comp", gl:"Gen. Liability", bop:"BOP/BIP" };
const STATUS_STYLE   = {
  complete:    { color:"#166534", bg:"#f0f7f3", label:"Complete"    },
  in_progress: { color:"#92400e", bg:"#fef3c7", label:"In Progress" },
  archived:    { color:"#6b7280", bg:"#f3f4f6", label:"Archived"    },
};

// ── Helpers ──────────────────────────────────────────────────
function ScoreChip({ score, ml }) {
  const col = MATURITY_COLOR[ml] || "#7a9688";
  const bg  = MATURITY_BG[ml]    || "#f7faf8";
  return (
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <span style={{fontFamily:FONT.mono,fontSize:16,fontWeight:800,color:col}}>{score??"-"}</span>
      {ml&&<span style={{fontSize:10,fontWeight:700,color:col,background:bg,padding:"2px 7px",borderRadius:3}}>{ml}</span>}
    </div>
  );
}

function LensBar({ value, color, max=100 }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,height:6,background:"#edf5f0",borderRadius:3,overflow:"hidden",position:"relative"}}>
        <div style={{height:"100%",width:(value/max*100)+"%",background:color,borderRadius:3}}/>
        <div style={{position:"absolute",left:"65%",top:0,bottom:0,width:1.5,background:"#92400e",opacity:0.5}}/>
      </div>
      <span style={{fontFamily:FONT.mono,fontSize:11,fontWeight:700,color,minWidth:24}}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.in_progress;
  return <span style={{fontSize:10,fontWeight:700,color:s.color,background:s.bg,padding:"3px 8px",borderRadius:3}}>{s.label}</span>;
}

// ── SVG Radar ────────────────────────────────────────────────
function Radar({ datasets, size=260 }) {
  const cx=size/2, cy=size/2, r=size*0.33;
  const n=LENS_KEYS.length;
  const angles=LENS_KEYS.map((_,i)=>(i*2*Math.PI/n)-Math.PI/2);
  const pt=(val,i)=>{ const a=angles[i],rr=(val/100)*r; return [cx+rr*Math.cos(a), cy+rr*Math.sin(a)]; };
  const toPath=vals=>vals.map((v,i)=>{ const [x,y]=pt(v,i); return (i===0?"M":"L")+x.toFixed(1)+","+y.toFixed(1); }).join(" ")+" Z";

  return (
    <svg width={size} height={size} style={{overflow:"visible"}}>
      {[20,40,60,80,100].map(gl=>(
        <polygon key={gl} points={angles.map(a=>{ const rr=(gl/100)*r; return `${(cx+rr*Math.cos(a)).toFixed(1)},${(cy+rr*Math.sin(a)).toFixed(1)}`; }).join(" ")} fill="none" stroke="#edf5f0" strokeWidth={1}/>
      ))}
      {angles.map((a,i)=>(<line key={i} x1={cx} y1={cy} x2={(cx+r*Math.cos(a)).toFixed(1)} y2={(cy+r*Math.sin(a)).toFixed(1)} stroke="#d8ebe2" strokeWidth={1}/>))}
      {datasets.map((d,di)=>{
        const col=CARRIER_COLORS[di]||"#1a4731";
        const vals=LENS_KEYS.map(k=>d.lens_scores?.[k]||0);
        return <path key={di} d={toPath(vals)} fill={col} fillOpacity={0.08} stroke={col} strokeWidth={2}/>;
      })}
      {angles.map((a,i)=>{
        const lr=r+26,lx=cx+lr*Math.cos(a),ly=cy+lr*Math.sin(a);
        const words=LENS_LABELS[LENS_KEYS[i]].split(" ");
        return (
          <text key={i} x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor="middle" dominantBaseline="middle">
            {words.map((w,wi)=>(
              <tspan key={wi} x={lx.toFixed(1)} dy={wi===0?(-(words.length-1)*7)+"px":"14px"} fontSize={9} fill={C.textMuted} fontFamily="Inter,sans-serif">{w}</tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

// ── Compute stats from any assessments array ──────────────────
function computeStats(assessments) {
  const complete   = assessments.filter(a=>a.status==="complete");
  const inProgress = assessments.filter(a=>a.status==="in_progress");
  const thisMonth  = complete.filter(a=>new Date(a.completed_at)>new Date(Date.now()-30*86400000));
  const scored     = complete.filter(a=>a.overall_score);
  const avgScore   = scored.length ? Math.round(scored.reduce((s,a)=>s+(a.overall_score||0),0)/scored.length) : 0;
  const byTier={1:[],2:[],3:[]};
  scored.forEach(a=>{ if(a.tier) byTier[a.tier].push(a.overall_score); });
  const tierAvg={};
  Object.entries(byTier).forEach(([t,scores])=>{ tierAvg[t]=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):null; });
  return { total:assessments.length, complete:complete.length, inProgress:inProgress.length, thisMonth:thisMonth.length, avgScore, tierAvg };
}

function computeLensAvgs(assessments) {
  const complete=assessments.filter(a=>a.status==="complete"&&a.lens_scores);
  if(!complete.length) return Object.fromEntries(LENS_KEYS.map(k=>[k,65]));
  const totals=Object.fromEntries(LENS_KEYS.map(k=>[k,0]));
  complete.forEach(a=>LENS_KEYS.forEach(k=>{ totals[k]+=(a.lens_scores[k]||0); }));
  return Object.fromEntries(LENS_KEYS.map(k=>[k,Math.round(totals[k]/complete.length)]));
}

// ═══════════════════════════════════════════════════════════════
// TAB 1 — Portfolio Overview
// ═══════════════════════════════════════════════════════════════
function TabPortfolio({ assessments }) {
  const stats    = computeStats(assessments);
  const lensAvgs = computeLensAvgs(assessments);
  const complete = assessments.filter(a=>a.status==="complete"&&a.overall_score);
  const sorted   = [...complete].sort((a,b)=>b.overall_score-a.overall_score);

  const tierCounts={1:0,2:0,3:0};
  assessments.forEach(a=>{ if(a.tier) tierCounts[a.tier]++; });

  const matCounts={};
  complete.forEach(a=>{ matCounts[a.maturity_level]=(matCounts[a.maturity_level]||0)+1; });

  return (
    <div>
      {/* KPI strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        {[
          {label:"Total Assessments", value:stats.total,      color:"#1a4731"},
          {label:"Completed",          value:stats.complete,   color:"#166534"},
          {label:"In Progress",        value:stats.inProgress, color:"#92400e"},
          {label:"Portfolio Avg",      value:stats.avgScore||"—", color:"#1e3a5f"},
        ].map(it=>(
          <div key={it.label} style={{...card,padding:"18px 20px",borderTop:"3px solid "+it.color}}>
            <div style={{fontFamily:FONT.mono,fontSize:28,fontWeight:800,color:it.color,lineHeight:1}}>{it.value}</div>
            <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textMuted,marginTop:5,textTransform:"uppercase",letterSpacing:"0.07em"}}>{it.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:18,marginBottom:18}}>
        {/* Lens averages */}
        <div style={{...card,padding:"22px 24px"}}>
          <div style={{fontFamily:FONT.serif,fontSize:15,fontWeight:700,color:C.text,marginBottom:18}}>Portfolio Average by Lens</div>
          {LENS_KEYS.map(k=>(
            <div key={k} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontFamily:FONT.sans,fontSize:12,color:C.textMid}}>{LENS_LABELS[k]}</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontFamily:FONT.mono,fontSize:12,fontWeight:700,color:LENS_STROKE[k]}}>{lensAvgs[k]}</span>
                  <span style={{fontFamily:FONT.sans,fontSize:10,color:lensAvgs[k]-65>=0?"#166534":"#991b1b",fontWeight:600}}>{lensAvgs[k]-65>=0?"+":""}{lensAvgs[k]-65} vs med</span>
                </div>
              </div>
              <LensBar value={lensAvgs[k]} color={LENS_STROKE[k]}/>
            </div>
          ))}
          <div style={{fontFamily:FONT.sans,fontSize:10,color:C.textMuted,marginTop:6}}>Orange dashed line = industry median (65)</div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{...card,padding:"20px 22px"}}>
            <div style={{fontFamily:FONT.serif,fontSize:15,fontWeight:700,color:C.text,marginBottom:14}}>Maturity Distribution</div>
            {["Leading","Advanced","Developing","Foundational"].map(m=>{
              const cnt=matCounts[m]||0;
              return (
                <div key={m} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
                  <div style={{fontSize:10,fontWeight:700,color:MATURITY_COLOR[m],background:MATURITY_BG[m],padding:"2px 8px",borderRadius:3,width:80,textAlign:"center"}}>{m}</div>
                  <div style={{flex:1,height:8,borderRadius:4,background:"#edf5f0",overflow:"hidden"}}>
                    <div style={{height:"100%",width:((cnt/(complete.length||1))*100)+"%",background:MATURITY_COLOR[m]}}/>
                  </div>
                  <div style={{fontFamily:FONT.mono,fontSize:12,fontWeight:700,color:MATURITY_COLOR[m],minWidth:20}}>{cnt}</div>
                </div>
              );
            })}
          </div>
          <div style={{...card,padding:"20px 22px"}}>
            <div style={{fontFamily:FONT.serif,fontSize:15,fontWeight:700,color:C.text,marginBottom:14}}>By Carrier Tier</div>
            {[1,2,3].map(t=>(
              <div key={t} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{fontFamily:FONT.sans,fontSize:12,fontWeight:600,color:C.textMid,width:44}}>Tier {t}</div>
                <div style={{flex:1,height:10,borderRadius:5,background:"#edf5f0",overflow:"hidden"}}>
                  <div style={{height:"100%",width:((tierCounts[t]/(stats.total||1))*100)+"%",background:"#1a4731"}}/>
                </div>
                <div style={{fontFamily:FONT.mono,fontSize:11,fontWeight:700,color:"#1a4731",minWidth:20}}>{tierCounts[t]}</div>
                {stats.tierAvg[t]&&<div style={{fontFamily:FONT.mono,fontSize:10,color:C.textMuted,minWidth:48}}>avg {stats.tierAvg[t]}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top / Bottom performers */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        {[{title:"Top Performers",data:sorted.slice(0,5),col:"#166534"},{title:"Needs Attention",data:[...sorted].reverse().slice(0,5),col:"#991b1b"}].map(({title,data,col})=>(
          <div key={title} style={{...card,overflow:"hidden"}}>
            <div style={{padding:"14px 18px",borderBottom:"1px solid #d8ebe2",borderLeft:"4px solid "+col}}>
              <span style={{fontFamily:FONT.serif,fontSize:14,fontWeight:700,color:C.text}}>{title}</span>
            </div>
            {data.length===0&&<div style={{padding:"20px 18px",fontFamily:FONT.sans,fontSize:12,color:C.textMuted}}>No completed assessments yet.</div>}
            {data.map((a,i)=>(
              <div key={a.assessment_id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 18px",borderBottom:i<data.length-1?"1px solid #edf5f0":"none"}}>
                <div>
                  <div style={{fontFamily:FONT.sans,fontSize:12,fontWeight:600,color:C.text}}>{a.carrier_name}</div>
                  <div style={{fontFamily:FONT.sans,fontSize:10,color:C.textMuted}}>T{a.tier} · NAIC {a.naic}</div>
                </div>
                <ScoreChip score={a.overall_score} ml={a.maturity_level}/>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 2 — Carrier History
// ═══════════════════════════════════════════════════════════════
function AssessmentDetail({ a, onBack }) {
  return (
    <div>
      <button onClick={onBack} style={{...btnSecondary,padding:"6px 12px",fontSize:12,borderRadius:5,marginBottom:18,display:"flex",alignItems:"center",gap:6}}>
        <ArrowLeft size={12}/> Back to History
      </button>

      <div style={{...card,padding:"22px 26px",marginBottom:18,borderLeft:"5px solid #1a4731"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <Tag color="forest">Diagnostic Report</Tag>
            <h2 style={{fontFamily:FONT.serif,fontSize:22,fontWeight:700,color:C.text,margin:"8px 0 4px"}}>{a.carrier_name}</h2>
            <div style={{fontFamily:FONT.sans,fontSize:12,color:C.textSoft}}>
              NAIC {a.naic} · Tier {a.tier} · {a.lobs?.map(l=>LOB_LABEL[l]||l).join(", ")||"—"}
            </div>
            <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textMuted,marginTop:4}}>
              {a.path==="metrics"?"Metrics Path":a.path==="process"?"Process Path":a.path||"—"} ·{" "}
              {a.status==="complete"
                ? "Completed "+new Date(a.completed_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})
                : "Started "+new Date(a.started_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})
              }
            </div>
            {a.consultant_name&&<div style={{fontFamily:FONT.sans,fontSize:11,color:C.textMuted,marginTop:2}}>Consultant: {a.consultant_name}</div>}
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
            <StatusBadge status={a.status}/>
            {a.overall_score&&<ScoreChip score={a.overall_score} ml={a.maturity_level}/>}
          </div>
        </div>
      </div>

      {/* No results yet for in-progress */}
      {a.status!=="complete"&&(
        <div style={{...card,padding:"32px",textAlign:"center",marginBottom:18}}>
          <AlertCircle size={24} color="#92400e" style={{marginBottom:8}}/>
          <div style={{fontFamily:FONT.serif,fontSize:15,fontWeight:700,color:C.text,marginBottom:6}}>Assessment In Progress</div>
          <div style={{fontFamily:FONT.sans,fontSize:13,color:C.textSoft}}>This assessment hasn't been completed yet. Scores will appear once the consultant finishes and views results.</div>
        </div>
      )}

      {a.lens_scores&&(
        <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:18,marginBottom:18}}>
          <div style={{...card,padding:"20px",display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div style={{fontFamily:FONT.serif,fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Maturity Radar</div>
            <Radar datasets={[a]} size={220}/>
          </div>
          <div style={{...card,padding:"22px 24px"}}>
            <div style={{fontFamily:FONT.serif,fontSize:15,fontWeight:700,color:C.text,marginBottom:16}}>Lens Score Breakdown</div>
            {LENS_KEYS.map(k=>{
              const v=a.lens_scores[k]||0,gap=v-65;
              return (
                <div key={k} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontFamily:FONT.sans,fontSize:12,color:C.textMid}}>{LENS_LABELS[k]}</span>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <span style={{fontFamily:FONT.mono,fontSize:13,fontWeight:700,color:LENS_STROKE[k]}}>{v}</span>
                      <span style={{fontFamily:FONT.sans,fontSize:11,color:gap>=0?"#166534":"#991b1b",fontWeight:600}}>{gap>=0?"+":""}{gap}</span>
                    </div>
                  </div>
                  <LensBar value={v} color={LENS_STROKE[k]}/>
                </div>
              );
            })}
            <div style={{fontFamily:FONT.sans,fontSize:10,color:C.textMuted,marginTop:4}}>Gap shown vs industry median (65)</div>
          </div>
        </div>
      )}

      {a.value_opportunities?.length>0&&(
        <div style={{...card,padding:"22px 24px",marginBottom:18}}>
          <div style={{fontFamily:FONT.serif,fontSize:15,fontWeight:700,color:C.text,marginBottom:6}}>Value Opportunity Summary</div>
          <div style={{fontFamily:FONT.sans,fontSize:12,color:C.textSoft,marginBottom:16}}>Estimated annualised improvement potential based on gap-to-benchmark analysis</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
            {a.value_opportunities.map((v,i)=>(
              <div key={i} style={{background:"#f7faf8",border:"1px solid #d8ebe2",borderRadius:8,padding:"16px 18px",borderTop:"3px solid "+CARRIER_COLORS[i%CARRIER_COLORS.length]}}>
                <div style={{fontFamily:FONT.sans,fontSize:11,color:CARRIER_COLORS[i%CARRIER_COLORS.length],fontWeight:700,marginBottom:6}}>{v.label}</div>
                <div style={{fontFamily:FONT.mono,fontSize:18,fontWeight:800,color:CARRIER_COLORS[i%CARRIER_COLORS.length],marginBottom:4}}>{v.value}</div>
                <div style={{fontFamily:FONT.sans,fontSize:10,color:C.textMuted}}>{v.basis}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TabHistory({ assessments }) {
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  // Show ALL statuses (complete + in_progress + archived)
  const filtered = useMemo(()=>{
    let data = [...assessments].sort((a,b)=>new Date(b.started_at||0)-new Date(a.started_at||0));
    if (statusFilter!=="all") data=data.filter(a=>a.status===statusFilter);
    if (search) data=data.filter(a=>
      a.carrier_name?.toLowerCase().includes(search.toLowerCase())||a.naic?.includes(search)
    );
    return data;
  }, [assessments, search, statusFilter]);

  if (selected) return <AssessmentDetail a={selected} onBack={()=>setSelected(null)}/>;

  return (
    <div>
      <div style={{fontFamily:FONT.sans,fontSize:13,color:C.textSoft,marginBottom:16}}>
        All assessments across all consultants — including in-progress. Click any row to view details.
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{position:"relative",flex:1,maxWidth:340}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:14}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search carrier or NAIC…"
            style={{width:"100%",padding:"8px 12px 8px 32px",border:"1px solid #d8ebe2",borderRadius:6,fontFamily:FONT.sans,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"flex",gap:6}}>
          {[["all","All"],["complete","Completed"],["in_progress","In Progress"]].map(([val,label])=>(
            <button key={val} onClick={()=>setStatusFilter(val)} style={{
              padding:"7px 13px",borderRadius:5,fontSize:12,fontFamily:FONT.sans,cursor:"pointer",
              fontWeight:statusFilter===val?700:400,
              border:"1px solid "+(statusFilter===val?"#1a4731":"#d8ebe2"),
              background:statusFilter===val?"#1a4731":"white",
              color:statusFilter===val?"white":C.textSoft,
            }}>{label}</button>
          ))}
        </div>
        <span style={{fontFamily:FONT.sans,fontSize:11,color:C.textMuted,marginLeft:"auto"}}>{filtered.length} record{filtered.length!==1?"s":""}</span>
      </div>

      <div style={{...card,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 60px 90px 70px 70px 110px 80px",gap:8,padding:"10px 18px",background:"#f7faf8",borderBottom:"2px solid #1a4731"}}>
          {["Carrier","Tier","Status","Path","Score","Date","Action"].map(h=>(
            <div key={h} style={{fontFamily:FONT.sans,fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</div>
          ))}
        </div>

        {filtered.length===0&&(
          <div style={{padding:"36px",textAlign:"center",fontFamily:FONT.sans,fontSize:13,color:C.textMuted}}>No assessments found.</div>
        )}

        {filtered.map((a,i)=>(
          <div key={a.assessment_id||i}
            style={{display:"grid",gridTemplateColumns:"2fr 60px 90px 70px 70px 110px 80px",gap:8,padding:"13px 18px",borderBottom:"1px solid #edf5f0",background:i%2===0?"white":"#fafcfa",alignItems:"center",cursor:"pointer",transition:"background 0.1s"}}
            onMouseEnter={e=>e.currentTarget.style.background="#f0f7f3"}
            onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"white":"#fafcfa"}
            onClick={()=>setSelected(a)}>
            <div>
              <div style={{fontFamily:FONT.sans,fontSize:12,fontWeight:600,color:"#1a4731",textDecoration:"underline",textDecorationColor:"#c3ddd0"}}>{a.carrier_name||"—"}</div>
              <div style={{fontFamily:FONT.mono,fontSize:10,color:C.textMuted}}>NAIC {a.naic||"—"}{a.consultant_name?" · "+a.consultant_name:""}</div>
            </div>
            <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textSoft}}>T{a.tier||"—"}</div>
            <div><StatusBadge status={a.status}/></div>
            <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textSoft,textTransform:"capitalize"}}>{a.path||"—"}</div>
            <div>{a.overall_score?<ScoreChip score={a.overall_score} ml={null}/>:<span style={{color:C.textMuted,fontSize:11}}>—</span>}</div>
            <div style={{fontFamily:FONT.sans,fontSize:10,color:C.textMuted}}>
              {a.status==="complete"&&a.completed_at
                ? new Date(a.completed_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})
                : a.started_at
                ? "Started "+new Date(a.started_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})
                : "—"}
            </div>
            <button onClick={e=>{e.stopPropagation();setSelected(a);}}
              style={{...btnSecondary,padding:"5px 10px",fontSize:11,borderRadius:4,color:"#1a4731",borderColor:"#c3ddd0",display:"flex",alignItems:"center",gap:4}}>
              <Eye size={11}/> View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 3 — Carrier Comparison
// ═══════════════════════════════════════════════════════════════
function TabComparison({ assessments }) {
  const complete = assessments.filter(a=>a.status==="complete"&&a.lens_scores);
  const latestMap={};
  complete.forEach(a=>{
    if(!latestMap[a.carrier_id]||new Date(a.completed_at)>new Date(latestMap[a.carrier_id].completed_at))
      latestMap[a.carrier_id]=a;
  });
  const available=Object.values(latestMap);
  const [selected,setSelected]=useState(()=>available.slice(0,4).map(a=>a.carrier_id));

  const toggle=id=>selected.includes(id)?setSelected(s=>s.filter(x=>x!==id)):selected.length<5&&setSelected(s=>[...s,id]);
  const selData=selected.map(id=>available.find(a=>a.carrier_id===id)).filter(Boolean);

  const gapRows=LENS_KEYS.map(k=>{
    const vals=selData.map(a=>a.lens_scores?.[k]||0);
    const max=Math.max(...vals);
    return {key:k,label:LENS_LABELS[k],vals,max};
  });

  const tierAvg = useMemo(()=>{
    const stats=computeStats(assessments);
    return stats.tierAvg;
  },[assessments]);

  if (available.length===0) return (
    <div style={{...card,padding:"48px",textAlign:"center"}}>
      <div style={{fontSize:32,marginBottom:12}}>📊</div>
      <div style={{fontFamily:FONT.serif,fontSize:16,fontWeight:700,color:C.text,marginBottom:8}}>No completed assessments to compare</div>
      <div style={{fontFamily:FONT.sans,fontSize:13,color:C.textSoft}}>Comparison will populate once at least two carriers have completed assessments with scores.</div>
    </div>
  );

  return (
    <div>
      {/* Carrier selector */}
      <div style={{...card,padding:"16px 20px",marginBottom:20}}>
        <div style={{fontFamily:FONT.sans,fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>
          Select up to 5 carriers · {selData.length} selected
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {available.map((a,i)=>{
            const idx=selected.indexOf(a.carrier_id);
            const isSel=idx>-1;
            const col=isSel?CARRIER_COLORS[idx]:"#d8ebe2";
            return (
              <button key={a.carrier_id} onClick={()=>toggle(a.carrier_id)} style={{
                padding:"6px 13px",borderRadius:5,fontSize:12,fontWeight:isSel?700:400,
                fontFamily:FONT.sans,cursor:"pointer",
                border:"1.5px solid "+col, background:isSel?col+"18":"white", color:isSel?col:C.textSoft,
                display:"flex",alignItems:"center",gap:5,
              }}>
                {isSel&&<span style={{width:8,height:8,borderRadius:"50%",background:col,display:"inline-block"}}/>}
                {a.carrier_name.split(" ").slice(0,2).join(" ")}
                <span style={{fontFamily:FONT.mono,fontSize:10,color:isSel?col:C.textMuted}}>{a.overall_score}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selData.length===0&&<div style={{textAlign:"center",padding:48,fontFamily:FONT.sans,fontSize:13,color:C.textMuted}}>Select carriers above</div>}

      {selData.length>0&&(
        <>
          {/* Radar + Gap analysis */}
          <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:20,marginBottom:20}}>
            <div style={{...card,padding:"20px",display:"flex",flexDirection:"column",alignItems:"center"}}>
              <div style={{fontFamily:FONT.serif,fontSize:13,fontWeight:700,color:C.text,marginBottom:16}}>Comparative Radar</div>
              <Radar datasets={selData} size={240}/>
              <div style={{width:"100%",marginTop:14}}>
                {selData.map((a,i)=>(
                  <div key={a.carrier_id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:CARRIER_COLORS[i],flexShrink:0}}/>
                    <span style={{fontFamily:FONT.sans,fontSize:11,color:C.textMid,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.carrier_name}</span>
                    <span style={{fontFamily:FONT.mono,fontSize:11,fontWeight:700,color:CARRIER_COLORS[i]}}>{a.overall_score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{...card,padding:"22px 24px"}}>
              <div style={{fontFamily:FONT.serif,fontSize:15,fontWeight:700,color:C.text,marginBottom:4}}>Gap-to-Median Analysis</div>
              <div style={{fontFamily:FONT.sans,fontSize:12,color:C.textSoft,marginBottom:18}}>Each bar shows carrier score vs industry median (65). Positive = above median.</div>
              {gapRows.map(({key,label,vals,max})=>(
                <div key={key} style={{marginBottom:14}}>
                  <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textMid,marginBottom:6,fontWeight:600}}>{label}</div>
                  <div style={{display:"flex",gap:4,alignItems:"center"}}>
                    {selData.map((a,ci)=>{
                      const v=a.lens_scores?.[key]||0,gap=v-65,isTop=v===max;
                      return (
                        <div key={a.carrier_id} style={{flex:1}}>
                          <div style={{height:28,borderRadius:4,background:gap>=0?"#f0f7f3":"#fef2f2",border:"1px solid "+(gap>=0?"#c3ddd0":"#fca5a5"),display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 8px",position:"relative",overflow:"hidden"}}>
                            <div style={{position:"absolute",left:0,top:0,bottom:0,width:((v/100)*100)+"%",background:CARRIER_COLORS[ci],opacity:0.15,borderRadius:4}}/>
                            <span style={{fontFamily:FONT.mono,fontSize:12,fontWeight:800,color:CARRIER_COLORS[ci],position:"relative"}}>{v}</span>
                            <span style={{fontFamily:FONT.sans,fontSize:10,fontWeight:700,color:gap>=0?"#166534":"#991b1b",position:"relative"}}>{gap>=0?"+":""}{gap}</span>
                            {isTop&&<span style={{position:"absolute",top:-1,right:-1,fontSize:9,color:CARRIER_COLORS[ci]}}>★</span>}
                          </div>
                          <div style={{fontFamily:FONT.sans,fontSize:9,color:C.textMuted,textAlign:"center",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.carrier_name.split(" ")[0]}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-side table */}
          <div style={{...card,overflow:"hidden",marginBottom:18}}>
            <div style={{padding:"14px 20px",background:"#f7faf8",borderBottom:"2px solid #1a4731",fontFamily:FONT.serif,fontSize:15,fontWeight:700,color:C.text}}>
              Side-by-Side Score Table
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#f7faf8"}}>
                    <th style={{padding:"10px 16px",fontFamily:FONT.sans,fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",textAlign:"left",borderBottom:"1px solid #d8ebe2"}}>Dimension</th>
                    {selData.map((a,i)=>(
                      <th key={a.carrier_id} style={{padding:"10px 14px",fontFamily:FONT.sans,fontSize:11,fontWeight:700,color:CARRIER_COLORS[i],borderBottom:"1px solid #d8ebe2",textAlign:"center",borderLeft:"1px solid #edf5f0"}}>
                        <div>{a.carrier_name.split(" ").slice(0,2).join(" ")}</div>
                        <div style={{fontFamily:FONT.mono,fontSize:9,color:C.textMuted,fontWeight:400}}>T{a.tier} · NAIC {a.naic}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{background:"#f0f7f3"}}>
                    <td style={{padding:"12px 16px",fontFamily:FONT.sans,fontSize:12,fontWeight:700,color:"#1a4731",borderBottom:"1px solid #d8ebe2"}}>Overall Score</td>
                    {selData.map((a,i)=>(
                      <td key={a.carrier_id} style={{padding:"12px 14px",textAlign:"center",borderBottom:"1px solid #d8ebe2",borderLeft:"1px solid #edf5f0"}}>
                        <div style={{fontFamily:FONT.mono,fontSize:20,fontWeight:800,color:CARRIER_COLORS[i]}}>{a.overall_score}</div>
                        <div style={{fontFamily:FONT.sans,fontSize:9,fontWeight:700,color:MATURITY_COLOR[a.maturity_level],textTransform:"uppercase"}}>{a.maturity_level}</div>
                      </td>
                    ))}
                  </tr>
                  {LENS_KEYS.map((k,ri)=>(
                    <tr key={k} style={{background:ri%2===0?"white":"#fafcfa"}}>
                      <td style={{padding:"10px 16px",fontFamily:FONT.sans,fontSize:12,color:C.textMid,borderBottom:"1px solid #edf5f0"}}>{LENS_LABELS[k]}</td>
                      {selData.map((a,i)=>{
                        const v=a.lens_scores?.[k]||0,isTop=v===Math.max(...selData.map(x=>x.lens_scores?.[k]||0));
                        return (
                          <td key={a.carrier_id} style={{padding:"10px 14px",textAlign:"center",borderBottom:"1px solid #edf5f0",borderLeft:"1px solid #edf5f0",background:isTop?CARRIER_COLORS[i]+"08":"transparent"}}>
                            <div style={{fontFamily:FONT.mono,fontSize:14,fontWeight:700,color:isTop?CARRIER_COLORS[i]:C.textMid}}>{v}{isTop?" ★":""}</div>
                            <div style={{fontFamily:FONT.sans,fontSize:10,color:v-65>=0?"#166534":"#991b1b",fontWeight:600}}>{v-65>=0?"+":""}{v-65}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* VM Peer Benchmark Insight — McKinsey text REMOVED */}
          <div style={{...card,padding:"22px 24px"}}>
            <div style={{fontFamily:FONT.serif,fontSize:15,fontWeight:700,color:C.text,marginBottom:6}}>ValueMomentum Peer Benchmark Insight</div>
            <div style={{fontFamily:FONT.sans,fontSize:12,color:C.textSoft,marginBottom:16}}>Performance positioning relative to tier-peer benchmarks and best-in-class thresholds</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
              {selData.map((a,i)=>{
                const aboveMedian=LENS_KEYS.filter(k=>(a.lens_scores?.[k]||0)>65).length;
                const belowMedian=LENS_KEYS.length-aboveMedian;
                const priorityLens=LENS_KEYS.reduce((best,k)=>((a.lens_scores?.[k]||0)<(a.lens_scores?.[best]||0))?k:best, LENS_KEYS[0]);
                return (
                  <div key={a.carrier_id} style={{background:"white",border:"1.5px solid "+CARRIER_COLORS[i]+"44",borderTop:"3px solid "+CARRIER_COLORS[i],borderRadius:8,padding:"16px"}}>
                    <div style={{fontFamily:FONT.sans,fontSize:12,fontWeight:700,color:CARRIER_COLORS[i],marginBottom:8}}>{a.carrier_name}</div>
                    <div style={{display:"flex",gap:10,marginBottom:10}}>
                      <div style={{flex:1,textAlign:"center",background:"#f0f7f3",borderRadius:5,padding:"8px 4px"}}>
                        <div style={{fontFamily:FONT.mono,fontSize:16,fontWeight:800,color:"#166534"}}>{aboveMedian}</div>
                        <div style={{fontFamily:FONT.sans,fontSize:9,color:C.textMuted}}>Above Median</div>
                      </div>
                      <div style={{flex:1,textAlign:"center",background:"#fef2f2",borderRadius:5,padding:"8px 4px"}}>
                        <div style={{fontFamily:FONT.mono,fontSize:16,fontWeight:800,color:"#991b1b"}}>{belowMedian}</div>
                        <div style={{fontFamily:FONT.sans,fontSize:9,color:C.textMuted}}>Below Median</div>
                      </div>
                    </div>
                    <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textMid}}>
                      <strong style={{color:"#991b1b"}}>Priority gap:</strong> {LENS_LABELS[priorityLens]}
                    </div>
                    <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textMid,marginTop:4}}>
                      <strong style={{color:"#1a4731"}}>Tier {a.tier} peers:</strong> avg {tierAvg?.[a.tier]||"—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 4 — Benchmark Editor
// ═══════════════════════════════════════════════════════════════
function TabBenchmarks() {
  const { benchmarks, updateBenchmark } = useApp();
  const [activeLob, setActiveLob] = useState("personal_lines");
  const [expandedCat, setExpandedCat] = useState(null);
  const [saved, setSaved] = useState(false);

  const lob = benchmarks[activeLob] || [];
  const cats = [...new Set(lob.map(m=>m.category).filter(Boolean))];

  const handleSave = () => { setSaved(true); setTimeout(()=>setSaved(false), 2500); };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {LOB_OPTIONS.map(l=>(
            <button key={l.id} onClick={()=>setActiveLob(l.id)} style={{
              padding:"6px 13px",borderRadius:5,fontSize:12,fontFamily:FONT.sans,cursor:"pointer",
              fontWeight:activeLob===l.id?700:400,
              border:"1px solid "+(activeLob===l.id?"#1a4731":"#d8ebe2"),
              background:activeLob===l.id?"#1a4731":"white",
              color:activeLob===l.id?"white":C.textSoft,
            }}>{l.label}</button>
          ))}
        </div>
        <button onClick={handleSave} style={{...btnPrimary,borderRadius:6,padding:"8px 18px",fontSize:12,background:saved?"#166534":"#1a4731"}}>
          {saved?"✓ Saved":"Save Overrides"}
        </button>
      </div>

      <div style={{...card,padding:"12px 16px",marginBottom:14,background:"#fffbeb",border:"1px solid #fde68a"}}>
        <span style={{fontFamily:FONT.sans,fontSize:11,color:"#92400e"}}>
          ℹ Edits here update the benchmark ranges shown in consultant assessments. Changes are in-memory — connect Supabase benchmark_overrides to persist.
        </span>
      </div>

      {cats.map(cat=>{
        const metrics=lob.filter(m=>m.category===cat);
        const isOpen=expandedCat===cat;
        return (
          <div key={cat} style={{...card,overflow:"hidden",marginBottom:10}}>
            <button onClick={()=>setExpandedCat(isOpen?null:cat)}
              style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",background:"#f7faf8",border:"none",cursor:"pointer",borderBottom:isOpen?"1px solid #d8ebe2":"none"}}>
              <span style={{fontFamily:FONT.serif,fontSize:14,fontWeight:700,color:C.text}}>{cat}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontFamily:FONT.sans,fontSize:11,color:C.textMuted}}>{metrics.length} metrics</span>
                {isOpen?<ChevronDown size={14} color={C.textMuted}/>:<ChevronDown size={14} color={C.textMuted} style={{transform:"rotate(-90deg)"}}/>}
              </div>
            </button>
            {isOpen&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1.5fr repeat(6,1fr)",gap:8,padding:"8px 18px",background:"#f7faf8",borderBottom:"1px solid #d8ebe2"}}>
                  {["Metric","T1 IndMin","T1 IndMax","T2 IndMin","T2 IndMax","BIC Min","BIC Max"].map(h=>(
                    <div key={h} style={{fontFamily:FONT.sans,fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</div>
                  ))}
                </div>
                {metrics.map((m,mi)=>(
                  <div key={m.metric} style={{display:"grid",gridTemplateColumns:"1.5fr repeat(6,1fr)",gap:8,padding:"10px 18px",borderBottom:mi<metrics.length-1?"1px solid #edf5f0":"none",alignItems:"center"}}>
                    <div>
                      <div style={{fontFamily:FONT.sans,fontSize:12,fontWeight:600,color:C.textMid}}>{m.metric}</div>
                      <div style={{fontFamily:FONT.sans,fontSize:10,color:C.textMuted}}>{m.units}</div>
                    </div>
                    {[["tier1","indMin"],["tier1","indMax"],["tier2","indMin"],["tier2","indMax"],["tier2","bicMin"],["tier2","bicMax"]].map(([tk,fk])=>{
                      const lobIdx=lob.indexOf(m);
                      return (
                        <input key={tk+fk} type="number" defaultValue={m[tk]?.[fk]||""}
                          onChange={e=>updateBenchmark(activeLob,lobIdx,fk,tk,e.target.value)}
                          style={{padding:"5px 7px",border:"1px solid #d8ebe2",borderRadius:4,fontFamily:FONT.mono,fontSize:11,width:"100%",boxSizing:"border-box",outline:"none"}}/>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 5 — User Roles
// ═══════════════════════════════════════════════════════════════
function TabUsers() {
  return (
    <div style={{maxWidth:640}}>
      <div style={{...card,padding:"24px 28px",marginBottom:16}}>
        <div style={{fontFamily:FONT.serif,fontSize:16,fontWeight:700,color:C.text,marginBottom:6}}>Role Management</div>
        <div style={{fontFamily:FONT.sans,fontSize:13,color:C.textSoft,marginBottom:20}}>
          Roles are managed directly in Supabase. Use the SQL snippet below to promote or change any user's role.
        </div>
        <div style={{marginBottom:14}}>
          {Object.entries(ROLES).map(([key,r])=>(
            <div key={key} style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12,padding:"12px 16px",borderRadius:6,background:"#f7faf8",border:"1px solid #edf5f0"}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:r.color,flexShrink:0,marginTop:4}}/>
              <div>
                <div style={{fontFamily:FONT.sans,fontSize:13,fontWeight:700,color:C.text,marginBottom:2}}>{r.label}</div>
                <div style={{fontFamily:FONT.sans,fontSize:12,color:C.textSoft}}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{...card,padding:"20px 24px"}}>
        <div style={{fontFamily:FONT.serif,fontSize:14,fontWeight:700,color:C.text,marginBottom:12}}>Assign role in Supabase SQL Editor:</div>
        {[
          ["Promote to Admin",   "update public.profiles set role = 'admin'      where email = 'user@email.com';"],
          ["Set to Consultant",  "update public.profiles set role = 'consultant' where email = 'user@email.com';"],
          ["Set to Sales",       "update public.profiles set role = 'sales'      where email = 'user@email.com';"],
          ["View all users",     "select id, email, full_name, role from public.profiles order by created_at desc;"],
        ].map(([label,sql])=>(
          <div key={label} style={{marginBottom:14}}>
            <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textMuted,marginBottom:5,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</div>
            <div style={{background:"#1a1a2e",borderRadius:6,padding:"10px 14px",fontFamily:FONT.mono,fontSize:12,color:"#86efac",lineHeight:1.6,userSelect:"all"}}>{sql}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN — AdminPage (fetches real Supabase data)
// ═══════════════════════════════════════════════════════════════
const TABS = [
  { id:"portfolio",  label:"Portfolio Overview", Icon:BarChart3  },
  { id:"history",    label:"Carrier History",    Icon:Database   },
  { id:"comparison", label:"Carrier Comparison", Icon:TrendingUp },
  { id:"benchmarks", label:"Benchmark Editor",   Icon:Settings   },
  { id:"users",      label:"User Roles",         Icon:Users      },
];

export default function AdminPage({ onBack, role, profile, onLogout }) {
  const { supabaseEnabled } = useApp();
  const [tab, setTab]           = useState("portfolio");
  const [assessments, setAssessments] = useState(MOCK_ASSESSMENTS); // default to mock
  const [loading, setLoading]   = useState(false);
  const [usingReal, setUsingReal] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchData = async () => {
    if (!supabaseEnabled) return;
    setLoading(true);
    try {
      const { assessments: real, error } = await listAllAssessments();
      if (!error && real && real.length > 0) {
        setAssessments(real);
        setUsingReal(true);
      } else if (!error && real && real.length === 0) {
        // Supabase connected but empty — keep mock but mark it
        setUsingReal(false);
      }
    } catch (e) {
      console.error("Failed to load assessments:", e);
    }
    setLoading(false);
    setLastFetch(new Date());
  };

  useEffect(() => { fetchData(); }, [supabaseEnabled]);

  return (
    <div style={{background:C.bg,minHeight:"100vh"}}>
      <Nav page={0} setPage={()=>{}} role={role} profile={profile}
        onAdmin={null} onLogout={onLogout} onDashboard={onBack}/>

      <div style={{background:"white",borderBottom:"1px solid #d8ebe2"}}>
        <div style={{maxWidth:1160,margin:"0 auto",padding:"20px 28px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div>
            <div style={{marginBottom:8}}><Tag color="forest">Admin Panel</Tag></div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
              <h1 style={{fontFamily:FONT.serif,fontSize:22,fontWeight:700,color:C.text,margin:0}}>ClaimsDx Administration</h1>
              {/* Data source indicator */}
              <span style={{
                fontSize:10,fontFamily:FONT.sans,fontWeight:700,padding:"3px 8px",borderRadius:3,
                background:usingReal?"#f0f7f3":"#fef3c7",
                color:usingReal?"#166534":"#92400e",
              }}>
                {loading?"Loading…":usingReal?"● Live Supabase Data":"● Sample Data"}
              </span>
              <button onClick={fetchData} title="Refresh" style={{background:"none",border:"none",cursor:"pointer",color:C.textMuted,display:"flex",alignItems:"center",padding:4}}>
                <RefreshCw size={13} style={{animation:loading?"spin 1s linear infinite":undefined}}/>
              </button>
            </div>
            <div style={{display:"flex",gap:0}}>
              {TABS.map(t=>{
                const Icon=t.Icon;
                return (
                  <button key={t.id} onClick={()=>setTab(t.id)} style={{
                    padding:"8px 16px",border:"none",background:"transparent",
                    borderBottom:"2px solid "+(tab===t.id?"#1a4731":"transparent"),
                    color:tab===t.id?"#1a4731":C.textSoft,
                    fontFamily:FONT.sans,fontWeight:tab===t.id?700:400,fontSize:12,
                    cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:-1,
                  }}>
                    <Icon size={13}/>{t.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{paddingBottom:16}}>
            <button onClick={onBack} style={{...btnSecondary,borderRadius:6,fontSize:12,padding:"7px 14px",display:"flex",alignItems:"center",gap:6}}>
              <ArrowLeft size={12}/> Back to Hub
            </button>
          </div>
        </div>
      </div>

      <PageWrap maxWidth={1160}>
        {tab==="portfolio"  && <TabPortfolio  assessments={assessments}/>}
        {tab==="history"    && <TabHistory    assessments={assessments}/>}
        {tab==="comparison" && <TabComparison assessments={assessments}/>}
        {tab==="benchmarks" && <TabBenchmarks/>}
        {tab==="users"      && <TabUsers/>}
      </PageWrap>
    </div>
  );
}
