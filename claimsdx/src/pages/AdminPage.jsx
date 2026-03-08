import { useState } from "react";
import {
  Settings, Database, Users, Save, ChevronDown, ChevronRight,
  BarChart3, TrendingUp, TrendingDown, Minus, Eye, ArrowLeft,
} from "lucide-react";
import { C, FONT, card, btnPrimary, btnSecondary } from "../constants.js";
import { Tag, PageWrap, Nav } from "../components.jsx";
import { useApp, ROLES } from "../AppContext.jsx";
import { LOB_OPTIONS } from "../benchmarkData.js";
import {
  MOCK_ASSESSMENTS, getMockStats, getLensAverages, LENS_LABELS, LENS_KEYS,
} from "../mockData.js";

// ── Shared constants ──────────────────────────────────────────
const MATURITY_COLOR = { Leading:"#166534", Advanced:"#1a4731", Developing:"#92400e", Foundational:"#991b1b" };
const MATURITY_BG    = { Leading:"#f0f7f3", Advanced:"#f0f7f3", Developing:"#fef3c7", Foundational:"#fee2e2" };
const LENS_STROKE    = { process_efficiency:"#1a4731", financial_leakage:"#92400e", quality_compliance:"#166534", technology:"#1e3a5f", org_performance:"#9f1239" };
const CARRIER_COLORS = ["#1a4731","#1e3a5f","#9f1239","#92400e","#0f766e"];
const LOB_LABEL      = { pa:"Personal Auto", ph:"Personal Home", ca:"Comm. Auto", cp:"Comm. Property", wc:"Workers Comp", gl:"Gen. Liability", bop:"BOP/BIP" };

// ── Helpers ───────────────────────────────────────────────────
function ScoreChip({ score, ml }) {
  const col = MATURITY_COLOR[ml] || "#7a9688";
  const bg  = MATURITY_BG[ml]    || "#f7faf8";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <span style={{ fontFamily:FONT.mono, fontSize:16, fontWeight:800, color:col }}>{score}</span>
      {ml && <span style={{ fontSize:10, fontWeight:700, color:col, background:bg, padding:"2px 7px", borderRadius:3 }}>{ml}</span>}
    </div>
  );
}

function LensBar({ value, color, max=100 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height:6, background:"#edf5f0", borderRadius:3, overflow:"hidden", position:"relative" }}>
        <div style={{ height:"100%", width:(value/max*100)+"%", background:color, borderRadius:3 }}/>
        <div style={{ position:"absolute", left:"65%", top:0, bottom:0, width:1.5, background:"#92400e", opacity:0.5 }}/>
      </div>
      <span style={{ fontFamily:FONT.mono, fontSize:11, fontWeight:700, color, minWidth:24 }}>{value}</span>
    </div>
  );
}

// ── SVG Radar ─────────────────────────────────────────────────
function Radar({ datasets, size=260 }) {
  const cx=size/2, cy=size/2, r=size*0.33;
  const n=LENS_KEYS.length;
  const angles=LENS_KEYS.map((_,i)=>(i*2*Math.PI/n)-Math.PI/2);
  const pt=(val,i)=>{ const a=angles[i],rr=(val/100)*r; return [cx+rr*Math.cos(a), cy+rr*Math.sin(a)]; };
  const toPath=vals=>vals.map((v,i)=>{ const [x,y]=pt(v,i); return (i===0?"M":"L")+x.toFixed(1)+","+y.toFixed(1); }).join(" ")+" Z";

  return (
    <svg width={size} height={size} style={{overflow:"visible"}}>
      {[25,50,75,100].map(gl=>(
        <polygon key={gl}
          points={angles.map(a=>{ const rr=(gl/100)*r; return `${(cx+rr*Math.cos(a)).toFixed(1)},${(cy+rr*Math.sin(a)).toFixed(1)}`; }).join(" ")}
          fill="none" stroke="#edf5f0" strokeWidth={gl===65?1.5:1} strokeDasharray={gl===65?"3,2":"none"}/>
      ))}
      {angles.map((a,i)=><line key={i} x1={cx} y1={cy} x2={(cx+r*Math.cos(a)).toFixed(1)} y2={(cy+r*Math.sin(a)).toFixed(1)} stroke="#d8ebe2" strokeWidth={1}/>)}
      {LENS_KEYS.map((k,i)=>{
        const a=angles[i],lr=r+26;
        return <text key={k} x={(cx+lr*Math.cos(a)).toFixed(1)} y={(cy+lr*Math.sin(a)).toFixed(1)} fontSize={9} fill={C.textMuted} textAnchor="middle" fontFamily="Inter,sans-serif" dominantBaseline="middle">{LENS_LABELS[k].split(" ").slice(0,2).join(" ")}</text>;
      })}
      {datasets.map((ds,ci)=>(
        <path key={ci} d={toPath(LENS_KEYS.map(k=>ds.lens_scores?.[k]||0))}
          fill={CARRIER_COLORS[ci]} fillOpacity={0.07} stroke={CARRIER_COLORS[ci]} strokeWidth={2.5}/>
      ))}
      {datasets.map((ds,ci)=>LENS_KEYS.map((k,i)=>{
        const [x,y]=pt(ds.lens_scores?.[k]||0,i);
        return <circle key={k+ci} cx={x.toFixed(1)} cy={y.toFixed(1)} r={4} fill={CARRIER_COLORS[ci]} stroke="white" strokeWidth={2}/>;
      }))}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 1 — Portfolio Overview
// ═══════════════════════════════════════════════════════════════
function TabPortfolio() {
  const stats    = getMockStats();
  const lensAvgs = getLensAverages();
  const complete = MOCK_ASSESSMENTS.filter(a=>a.status==="complete"&&a.overall_score);
  const sorted   = [...complete].sort((a,b)=>b.overall_score-a.overall_score);

  const tierCounts={1:0,2:0,3:0};
  MOCK_ASSESSMENTS.forEach(a=>{ if(a.tier) tierCounts[a.tier]++; });

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
          {label:"Portfolio Avg",      value:stats.avgScore,   color:"#1e3a5f"},
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

        {/* Right col */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Maturity distribution */}
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
          {/* Tier breakdown */}
          <div style={{...card,padding:"20px 22px"}}>
            <div style={{fontFamily:FONT.serif,fontSize:15,fontWeight:700,color:C.text,marginBottom:14}}>By Carrier Tier</div>
            {[1,2,3].map(t=>(
              <div key={t} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{fontFamily:FONT.sans,fontSize:12,fontWeight:600,color:C.textMid,width:44}}>Tier {t}</div>
                <div style={{flex:1,height:10,borderRadius:5,background:"#edf5f0",overflow:"hidden"}}>
                  <div style={{height:"100%",width:((tierCounts[t]/stats.total)*100)+"%",background:"#1a4731"}}/>
                </div>
                <div style={{fontFamily:FONT.mono,fontSize:11,fontWeight:700,color:"#1a4731",minWidth:20}}>{tierCounts[t]}</div>
                {stats.tierAvg[t]&&<div style={{fontFamily:FONT.mono,fontSize:10,color:C.textMuted,minWidth:48}}>avg {stats.tierAvg[t]}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top/Bottom performers */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        {[{title:"Top Performers",data:sorted.slice(0,5),col:"#166534"},{title:"Needs Attention",data:[...sorted].reverse().slice(0,5),col:"#991b1b"}].map(({title,data,col})=>(
          <div key={title} style={{...card,overflow:"hidden"}}>
            <div style={{padding:"14px 18px",borderBottom:"1px solid #d8ebe2",borderLeft:"4px solid "+col}}>
              <span style={{fontFamily:FONT.serif,fontSize:14,fontWeight:700,color:C.text}}>{title}</span>
            </div>
            {data.map((a,i)=>(
              <div key={a.assessment_id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 18px",borderBottom:i<data.length-1?"1px solid #edf5f0":"none"}}>
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
// TAB 2 — Carrier History (all diagnostics + drill-down)
// ═══════════════════════════════════════════════════════════════
function AssessmentDetail({ a, onBack }) {
  return (
    <div>
      <button onClick={onBack} style={{...btnSecondary,padding:"6px 12px",fontSize:12,borderRadius:5,marginBottom:18,display:"flex",alignItems:"center",gap:6}}>
        <ArrowLeft size={12}/> Back to History
      </button>

      {/* Header */}
      <div style={{...card,padding:"22px 26px",marginBottom:18,borderLeft:"5px solid #1a4731"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <Tag color="forest">Diagnostic Report</Tag>
            <h2 style={{fontFamily:FONT.serif,fontSize:22,fontWeight:700,color:C.text,margin:"8px 0 4px"}}>{a.carrier_name}</h2>
            <div style={{fontFamily:FONT.sans,fontSize:12,color:C.textSoft}}>
              NAIC {a.naic} · Tier {a.tier} · {a.lobs?.map(l=>LOB_LABEL[l]||l).join(", ")}
            </div>
            <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textMuted,marginTop:4}}>
              {a.path==="metrics"?"Metrics Path":"Process Path"} · Completed {a.completed_at?new Date(a.completed_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}):"—"}
            </div>
          </div>
          <ScoreChip score={a.overall_score} ml={a.maturity_level}/>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:18,marginBottom:18}}>
        {/* Radar */}
        {a.lens_scores && (
          <div style={{...card,padding:"20px",display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div style={{fontFamily:FONT.serif,fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Maturity Radar</div>
            <Radar datasets={[a]} size={220}/>
          </div>
        )}

        {/* Lens scores */}
        {a.lens_scores && (
          <div style={{...card,padding:"22px 24px"}}>
            <div style={{fontFamily:FONT.serif,fontSize:15,fontWeight:700,color:C.text,marginBottom:16}}>Lens Score Breakdown</div>
            {LENS_KEYS.map(k=>{
              const v=a.lens_scores[k]||0;
              const gap=v-65;
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
        )}
      </div>

      {/* Value Opportunities (MBB style) */}
      <div style={{...card,padding:"22px 24px",marginBottom:18}}>
        <div style={{fontFamily:FONT.serif,fontSize:15,fontWeight:700,color:C.text,marginBottom:6}}>Value Opportunity Summary</div>
        <div style={{fontFamily:FONT.sans,fontSize:12,color:C.textSoft,marginBottom:16}}>Estimated annualised improvement potential based on gap-to-benchmark analysis</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {[
            {label:"Cycle Time Reduction",sub:"Process efficiency gap",value:"$1.2M–$1.8M",col:"#1a4731"},
            {label:"Leakage Recovery",sub:"Payment accuracy delta",value:"$0.8M–$1.4M",col:"#92400e"},
            {label:"STP Rate Uplift",sub:"Automation opportunity",value:"$0.5M–$0.9M",col:"#1e3a5f"},
          ].map(v=>(
            <div key={v.label} style={{background:"#f7faf8",border:"1px solid #d8ebe2",borderRadius:8,padding:"16px 18px",borderTop:"3px solid "+v.col}}>
              <div style={{fontFamily:FONT.sans,fontSize:11,color:v.col,fontWeight:700,marginBottom:6}}>{v.label}</div>
              <div style={{fontFamily:FONT.mono,fontSize:18,fontWeight:800,color:v.col,marginBottom:4}}>{v.value}</div>
              <div style={{fontFamily:FONT.sans,fontSize:10,color:C.textMuted}}>{v.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {[
          {title:"Identified Strengths",col:"#166534",bg:"#f0fdf4",items:["Strong STP rate vs industry median","Litigation closure efficiency above T"+a.tier+" benchmark","Quality compliance scores in top quartile"]},
          {title:"Priority Improvement Areas",col:"#991b1b",bg:"#fef2f2",items:["Technology adoption lagging best-in-class by 18pp","Fraud detection process maturity below Tier "+a.tier+" peers","Subrogation recovery rate 8pp below benchmark"]},
        ].map(({title,col,bg,items})=>(
          <div key={title} style={{...card,overflow:"hidden"}}>
            <div style={{padding:"13px 18px",background:bg,borderBottom:"1px solid "+col+"33",borderLeft:"4px solid "+col}}>
              <span style={{fontFamily:FONT.serif,fontSize:13,fontWeight:700,color:C.text}}>{title}</span>
            </div>
            {items.map((item,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"10px 18px",borderBottom:i<items.length-1?"1px solid #edf5f0":"none",alignItems:"flex-start"}}>
                <span style={{color:col,fontSize:14,flexShrink:0}}>{col==="#166534"?"✓":"↗"}</span>
                <span style={{fontFamily:FONT.sans,fontSize:12,color:C.textMid,lineHeight:1.5}}>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function TabHistory() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const all = MOCK_ASSESSMENTS.filter(a=>a.status==="complete").sort((a,b)=>new Date(b.completed_at)-new Date(a.completed_at));

  const filtered = search ? all.filter(a=>
    a.carrier_name?.toLowerCase().includes(search.toLowerCase())||a.naic?.includes(search)
  ) : all;

  if (selected) return <AssessmentDetail a={selected} onBack={()=>setSelected(null)}/>;

  return (
    <div>
      <div style={{fontFamily:FONT.sans,fontSize:13,color:C.textSoft,marginBottom:16}}>
        All completed assessments across all consultants. Click any row to view full diagnostic report.
      </div>

      {/* Search */}
      <div style={{position:"relative",maxWidth:340,marginBottom:14}}>
        <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:14}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search carrier or NAIC…"
          style={{width:"100%",padding:"8px 12px 8px 32px",border:"1px solid #d8ebe2",borderRadius:6,fontFamily:FONT.sans,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
      </div>

      <div style={{...card,overflow:"hidden"}}>
        {/* Table header */}
        <div style={{display:"grid",gridTemplateColumns:"2fr 60px 90px 70px 70px 90px 90px",gap:8,padding:"10px 18px",background:"#f7faf8",borderBottom:"2px solid #1a4731"}}>
          {["Carrier","Tier","Status","Path","Score","Completed","Action"].map(h=>(
            <div key={h} style={{fontFamily:FONT.sans,fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</div>
          ))}
        </div>

        {filtered.length===0&&(
          <div style={{padding:"36px",textAlign:"center",fontFamily:FONT.sans,fontSize:13,color:C.textMuted}}>No assessments found.</div>
        )}

        {filtered.map((a,i)=>(
          <div key={a.assessment_id} style={{display:"grid",gridTemplateColumns:"2fr 60px 90px 70px 70px 90px 90px",gap:8,padding:"13px 18px",borderBottom:"1px solid #edf5f0",background:i%2===0?"white":"#fafcfa",alignItems:"center",cursor:"pointer",transition:"background 0.1s"}}
            onMouseEnter={e=>e.currentTarget.style.background="#f0f7f3"}
            onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"white":"#fafcfa"}
            onClick={()=>setSelected(a)}>
            <div>
              <div style={{fontFamily:FONT.sans,fontSize:12,fontWeight:600,color:"#1a4731",textDecoration:"underline",textDecorationColor:"#c3ddd0"}}>{a.carrier_name}</div>
              <div style={{fontFamily:FONT.mono,fontSize:10,color:C.textMuted}}>NAIC {a.naic}</div>
            </div>
            <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textSoft}}>T{a.tier}</div>
            <div><span style={{fontSize:10,fontWeight:700,color:"#166534",background:"#f0f7f3",padding:"3px 8px",borderRadius:3}}>Complete</span></div>
            <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textSoft,textTransform:"capitalize"}}>{a.path||"—"}</div>
            <ScoreChip score={a.overall_score} ml={null}/>
            <div style={{fontFamily:FONT.sans,fontSize:10,color:C.textMuted}}>{a.completed_at?new Date(a.completed_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—"}</div>
            <button onClick={e=>{e.stopPropagation();setSelected(a);}} style={{...btnSecondary,padding:"5px 10px",fontSize:11,borderRadius:4,color:"#1a4731",borderColor:"#c3ddd0",display:"flex",alignItems:"center",gap:4}}>
              <Eye size={11}/> View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 3 — Carrier Comparison (MBB-style)
// ═══════════════════════════════════════════════════════════════
function TabComparison() {
  const complete = MOCK_ASSESSMENTS.filter(a=>a.status==="complete"&&a.lens_scores);
  // Dedupe: latest per carrier
  const latestMap={};
  complete.forEach(a=>{
    if(!latestMap[a.carrier_id]||new Date(a.completed_at)>new Date(latestMap[a.carrier_id].completed_at))
      latestMap[a.carrier_id]=a;
  });
  const available=Object.values(latestMap);
  const [selected,setSelected]=useState(available.slice(0,4).map(a=>a.carrier_id));

  const toggle=id=>selected.includes(id)?setSelected(s=>s.filter(x=>x!==id)):selected.length<5&&setSelected(s=>[...s,id]);
  const selData=selected.map(id=>available.find(a=>a.carrier_id===id)).filter(Boolean);

  // MBB-style: gap analysis vs median (65)
  const gapRows = LENS_KEYS.map(k=>{
    const vals=selData.map(a=>a.lens_scores?.[k]||0);
    const max=Math.max(...vals);
    return { key:k, label:LENS_LABELS[k], vals, max };
  });

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
          {/* Radar + Legend */}
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

            {/* Gap-to-median analysis (MBB waterfall style) */}
            <div style={{...card,padding:"22px 24px"}}>
              <div style={{fontFamily:FONT.serif,fontSize:15,fontWeight:700,color:C.text,marginBottom:4}}>Gap-to-Median Analysis</div>
              <div style={{fontFamily:FONT.sans,fontSize:12,color:C.textSoft,marginBottom:18}}>Each bar shows carrier score vs industry median (65). Positive = above median.</div>
              {gapRows.map(({key,label,vals,max})=>(
                <div key={key} style={{marginBottom:14}}>
                  <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textMid,marginBottom:6,fontWeight:600}}>{label}</div>
                  <div style={{display:"flex",gap:4,alignItems:"center"}}>
                    {selData.map((a,ci)=>{
                      const v=a.lens_scores?.[key]||0;
                      const gap=v-65;
                      const isTop=v===max;
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

          {/* Overall score comparison table */}
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
                  {/* Overall */}
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
                        const v=a.lens_scores?.[k]||0;
                        const isTop=v===Math.max(...selData.map(x=>x.lens_scores?.[k]||0));
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

          {/* Tier-adjusted benchmark comparison (MBB insight) */}
          <div style={{...card,padding:"22px 24px"}}>
            <div style={{fontFamily:FONT.serif,fontSize:15,fontWeight:700,color:C.text,marginBottom:6}}>McKinsey-Style Insight Summary</div>
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
                      <strong style={{color:"#1a4731"}}>Tier {a.tier} peers:</strong> avg {getMockStats().tierAvg?.[a.tier]||"—"}
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

  const metrics    = benchmarks[activeLob] || [];
  const categories = [...new Set(metrics.map(m=>m.category).filter(Boolean))];

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap",alignItems:"center"}}>
        {LOB_OPTIONS.map(l=>(
          <button key={l.id} onClick={()=>setActiveLob(l.id)} style={{
            padding:"6px 14px",borderRadius:5,fontSize:12,fontFamily:FONT.sans,
            fontWeight:activeLob===l.id?700:400,cursor:"pointer",
            border:"1.5px solid "+(activeLob===l.id?"#1a4731":"#d8ebe2"),
            background:activeLob===l.id?"#1a4731":"white",
            color:activeLob===l.id?"white":C.textSoft,
          }}>{l.label}</button>
        ))}
        <button onClick={()=>setSaved(true)} style={{...btnPrimary,marginLeft:"auto",padding:"6px 16px",fontSize:12,borderRadius:5,display:"flex",alignItems:"center",gap:6}}>
          <Save size={12}/>{saved?"Saved!":"Save Changes"}
        </button>
      </div>

      {categories.map(cat=>{
        const isOpen=expandedCat===cat;
        const catMetrics=metrics.filter(m=>m.category===cat);
        return (
          <div key={cat} style={{...card,marginBottom:8,overflow:"hidden"}}>
            <div onClick={()=>setExpandedCat(isOpen?null:cat)}
              style={{padding:"12px 18px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",background:isOpen?"#f0f7f3":"white",borderBottom:isOpen?"1px solid #d8ebe2":"none"}}>
              <span style={{fontFamily:FONT.sans,fontWeight:600,fontSize:13,color:C.text}}>{cat}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontFamily:FONT.sans,fontSize:11,color:C.textMuted}}>{catMetrics.length} metrics</span>
                {isOpen?<ChevronDown size={14} color={C.textMuted}/>:<ChevronRight size={14} color={C.textMuted}/>}
              </div>
            </div>
            {isOpen&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"2fr repeat(4,1fr)",gap:8,padding:"8px 18px",background:"#f7faf8",borderBottom:"1px solid #edf5f0"}}>
                  {["Metric","Ind Min","Ind Max","BIC Min","BIC Max"].map(h=>(
                    <div key={h} style={{fontFamily:FONT.sans,fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</div>
                  ))}
                </div>
                {catMetrics.map((m,i)=>{
                  const td=m.tier2||{};
                  return (
                    <div key={m.metric} style={{display:"grid",gridTemplateColumns:"2fr repeat(4,1fr)",gap:8,padding:"8px 18px",borderBottom:"1px solid #edf5f0",background:i%2===0?"white":"#fafcfa",alignItems:"center"}}>
                      <div style={{fontFamily:FONT.sans,fontSize:12,color:C.textMid}}>{m.metric}<span style={{color:C.textMuted,fontSize:10}}> {m.units}</span></div>
                      {["indMin","indMax","bicMin","bicMax"].map(f=>(
                        <input key={f} defaultValue={td[f]||""} placeholder="—"
                          style={{padding:"4px 8px",border:"1px solid #d8ebe2",borderRadius:4,fontSize:11,fontFamily:FONT.mono,outline:"none",width:"100%",boxSizing:"border-box"}}/>
                      ))}
                    </div>
                  );
                })}
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
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
      {Object.entries(ROLES).map(([key,r])=>(
        <div key={key} style={{...card,padding:"22px",borderTop:"3px solid "+r.color}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:r.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontFamily:FONT.sans,fontSize:12,fontWeight:700}}>
              {r.label[0]}
            </div>
            <div style={{fontFamily:FONT.serif,fontSize:15,fontWeight:700,color:C.text}}>{r.label}</div>
          </div>
          <div style={{fontFamily:FONT.sans,fontSize:12,color:C.textSoft,marginBottom:14,lineHeight:1.6}}>{r.desc}</div>
          <div style={{fontFamily:FONT.sans,fontSize:11,color:C.textMuted,background:"#f7faf8",padding:"10px 12px",borderRadius:5,border:"1px solid #d8ebe2"}}>
            Assign role in Supabase SQL Editor:<br/>
            <code style={{fontFamily:FONT.mono,fontSize:10,color:"#1a4731"}}>
              update profiles set role = '{key}'<br/>where email = 'user@email.com';
            </code>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN — AdminPage
// ═══════════════════════════════════════════════════════════════
const TABS = [
  { id:"portfolio",   label:"Portfolio Overview",  Icon:BarChart3  },
  { id:"history",     label:"Carrier History",     Icon:Database   },
  { id:"comparison",  label:"Carrier Comparison",  Icon:TrendingUp },
  { id:"benchmarks",  label:"Benchmark Editor",    Icon:Settings   },
  { id:"users",       label:"User Roles",           Icon:Users      },
];

export default function AdminPage({ onBack, role, profile, onLogout }) {
  const [tab, setTab] = useState("portfolio");

  return (
    <div style={{background:C.bg,minHeight:"100vh"}}>
      {/* Nav */}
      <Nav page={0} setPage={()=>{}} role={role} profile={profile}
        onAdmin={null} onLogout={onLogout} onDashboard={onBack}/>

      {/* Sub-header with tabs */}
      <div style={{background:"white",borderBottom:"1px solid #d8ebe2"}}>
        <div style={{maxWidth:1160,margin:"0 auto",padding:"20px 28px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div>
            <div style={{marginBottom:8}}><Tag color="forest">Admin Panel</Tag></div>
            <h1 style={{fontFamily:FONT.serif,fontSize:22,fontWeight:700,color:C.text,marginBottom:16}}>ClaimsDx Administration</h1>
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
        {tab==="portfolio"   && <TabPortfolio/>}
        {tab==="history"     && <TabHistory/>}
        {tab==="comparison"  && <TabComparison/>}
        {tab==="benchmarks"  && <TabBenchmarks/>}
        {tab==="users"       && <TabUsers/>}
      </PageWrap>
    </div>
  );
}
