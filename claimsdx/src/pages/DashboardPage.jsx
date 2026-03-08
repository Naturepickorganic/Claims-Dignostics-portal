import { useState, useMemo } from "react";
import { Plus, Search, Clock, CheckCircle2, AlertTriangle, ArrowRight,
         TrendingUp, TrendingDown, Minus, Copy, Eye, User, ChevronRight } from "lucide-react";
import { C, FONT, card, btnPrimary, btnSecondary } from "../constants.js";
import { PageWrap, Tag } from "../components.jsx";
import { MOCK_ASSESSMENTS, MOCK_CARRIERS, getMockStats, LENS_LABELS, LENS_KEYS } from "../mockData.js";
import { SUPABASE_ENABLED } from "../lib/supabase.js";

const MATURITY_COLOR = { Leading:"#166534", Advanced:"#1a4731", Developing:"#92400e", Foundational:"#991b1b" };
const STATUS_CFG = {
  complete:    { label:"Complete",    color:"#166534", bg:"#f0f7f3", border:"#c3ddd0", Icon:CheckCircle2 },
  in_progress: { label:"In Progress", color:"#92400e", bg:"#fef3c7", border:"#fcd34d", Icon:Clock        },
};
const LOB_LABEL = { pa:"Personal Auto", ph:"Personal Home", ca:"Comm. Auto", cp:"Comm. Property", wc:"Workers Comp", gl:"Gen. Liability", bop:"BOP/BIP" };

function daysSince(iso) { return Math.round((Date.now() - new Date(iso)) / 86400000); }

function ScoreDelta({ score, prev }) {
  if (!score) return <span style={{ fontFamily:FONT.mono, fontSize:13, color:C.textMuted }}>—</span>;
  const delta = prev != null ? score - prev : null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
      <span style={{ fontFamily:FONT.mono, fontSize:16, fontWeight:800, color:MATURITY_COLOR[score>=80?"Leading":score>=65?"Advanced":score>=50?"Developing":"Foundational"] }}>{score}</span>
      {delta != null && (
        <span style={{ fontSize:10, fontWeight:700, color:delta>0?"#166534":delta<0?"#991b1b":"#7a9688", display:"flex", alignItems:"center", gap:1 }}>
          {delta>0?<TrendingUp size={10}/>:delta<0?<TrendingDown size={10}/>:<Minus size={10}/>}
          {delta>0?"+":""}{delta!==0?delta:""}
        </span>
      )}
    </div>
  );
}

function StatsBar({ stats }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:28 }}>
      {[
        { label:"Total",       value:stats.total,       color:"#1a4731" },
        { label:"Completed",   value:stats.complete,    color:"#166534" },
        { label:"In Progress", value:stats.inProgress,  color:"#92400e" },
        { label:"This Month",  value:stats.thisMonth,   color:"#0f766e" },
        { label:"Avg Score",   value:stats.avgScore,    color:"#1e3a5f" },
      ].map(it => (
        <div key={it.label} style={{ ...card, padding:"16px 18px", borderTop:"3px solid "+it.color }}>
          <div style={{ fontFamily:FONT.mono, fontSize:24, fontWeight:800, color:it.color, lineHeight:1 }}>{it.value}</div>
          <div style={{ fontFamily:FONT.sans, fontSize:11, color:C.textMuted, marginTop:5, textTransform:"uppercase", letterSpacing:"0.07em" }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

// Carrier cards grid view (grouped by carrier)
function CarrierGrid({ onCarrierClick, onViewAssessment }) {
  // Latest completed per carrier
  const byCarrier = {};
  MOCK_ASSESSMENTS.forEach(a => {
    if (!byCarrier[a.carrier_id]) byCarrier[a.carrier_id] = [];
    byCarrier[a.carrier_id].push(a);
  });

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
      {Object.entries(byCarrier).map(([cid, assessments]) => {
        const completed = assessments.filter(a => a.status === "complete").sort((a,b) => new Date(b.completed_at) - new Date(a.completed_at));
        const inProg    = assessments.filter(a => a.status === "in_progress");
        const latest    = completed[0];
        const prev      = completed[1];
        const delta     = latest && prev ? latest.overall_score - prev.overall_score : null;
        const mc        = latest?.maturity_level;

        return (
          <div key={cid} style={{ ...card, padding:"20px 20px", cursor:"pointer", transition:"box-shadow 0.2s", borderTop: mc ? "3px solid "+MATURITY_COLOR[mc] : "3px solid #d8ebe2" }}
            onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 20px rgba(26,71,49,0.12)"}
            onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 4px rgba(26,71,49,0.06)"}
            onClick={() => onCarrierClick(cid, assessments[0]?.carrier_name)}>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <div>
                <div style={{ fontFamily:FONT.sans, fontSize:13, fontWeight:700, color:C.text, lineHeight:1.3, marginBottom:3 }}>{assessments[0]?.carrier_name}</div>
                <div style={{ fontFamily:FONT.mono, fontSize:10, color:C.textMuted }}>NAIC {assessments[0]?.naic} · T{assessments[0]?.tier}</div>
              </div>
              {latest && <ScoreDelta score={latest.overall_score} prev={prev?.overall_score} />}
            </div>

            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
              {assessments[0]?.lobs?.slice(0,3).map(l => (
                <span key={l} style={{ fontFamily:FONT.sans, fontSize:9, color:C.textSoft, background:"#f0f7f3", border:"1px solid #d8ebe2", borderRadius:3, padding:"2px 6px" }}>{LOB_LABEL[l]||l}</span>
              ))}
            </div>

            <div style={{ borderTop:"1px solid #edf5f0", paddingTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", gap:8 }}>
                {completed.length > 0 && (
                  <span style={{ fontFamily:FONT.sans, fontSize:10, color:"#166534", fontWeight:600 }}>✓ {completed.length} complete</span>
                )}
                {inProg.length > 0 && (
                  <span style={{ fontFamily:FONT.sans, fontSize:10, color:"#92400e", fontWeight:600 }}>⟳ {inProg.length} in progress</span>
                )}
              </div>
              <ChevronRight size={13} color={C.textMuted} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// List view row
function AssessmentRow({ a, onResume, onView, onCarrierClick }) {
  const st = STATUS_CFG[a.status] || STATUS_CFG.in_progress;
  const Icon = st.Icon;
  const days = daysSince(a.started_at);
  const isStale = a.status === "in_progress" && days > 7;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"2fr 70px 110px 80px 90px 150px", gap:10, padding:"13px 20px", borderBottom:"1px solid #edf5f0", alignItems:"center", background: isStale ? "#fffbeb" : "white", transition:"background 0.1s" }}
      onMouseEnter={e=>{ if(!isStale) e.currentTarget.style.background="#fafcfa"; }}
      onMouseLeave={e=>{ if(!isStale) e.currentTarget.style.background="white"; }}>

      <div>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
          <button onClick={() => onCarrierClick(a.carrier_id, a.carrier_name)}
            style={{ fontFamily:FONT.sans, fontSize:13, fontWeight:600, color:"#1a4731", background:"none", border:"none", cursor:"pointer", padding:0, textDecoration:"underline", textDecorationColor:"#c3ddd0" }}>
            {a.carrier_name}
          </button>
          {isStale && <span style={{ fontSize:9, color:"#92400e", fontWeight:700 }}>⚠ STALE</span>}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <span style={{ fontFamily:FONT.mono, fontSize:10, color:C.textMuted }}>NAIC {a.naic}</span>
          <span style={{ fontFamily:FONT.sans, fontSize:10, color:C.textSoft }}>{a.lobs?.slice(0,2).map(l=>LOB_LABEL[l]||l).join(", ")}{a.lobs?.length>2?` +${a.lobs.length-2}`:""}</span>
        </div>
      </div>

      <div style={{ fontFamily:FONT.sans, fontSize:11, color:C.textSoft }}>T{a.tier}</div>

      <div>
        <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:600, color:st.color, background:st.bg, border:"1px solid "+st.border, borderRadius:4, padding:"3px 8px" }}>
          <Icon size={10}/>{st.label}
        </span>
        {a.status==="in_progress" && <div style={{ fontFamily:FONT.sans, fontSize:9, color:C.textMuted, marginTop:2 }}>{days}d ago</div>}
      </div>

      <div style={{ fontFamily:FONT.sans, fontSize:11, color:C.textSoft, textTransform:"capitalize" }}>{a.path||"—"}</div>

      <ScoreDelta score={a.overall_score} prev={a.prev_score} />

      <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
        {a.status==="in_progress" && (
          <button onClick={()=>onResume(a)} style={{ ...btnPrimary, padding:"5px 12px", fontSize:11, borderRadius:5, gap:4 }}>
            <ArrowRight size={11}/> Resume
          </button>
        )}
        {a.status==="complete" && (
          <button onClick={()=>onView(a)} style={{ ...btnSecondary, padding:"5px 12px", fontSize:11, borderRadius:5, gap:4, color:"#1a4731", borderColor:"#c3ddd0" }}>
            <Eye size={11}/> View
          </button>
        )}
        <button onClick={()=>onView({ ...a, cloneMode:true })} title="New assessment for this carrier"
          style={{ padding:"5px 8px", borderRadius:5, border:"1px solid #d8ebe2", background:"white", cursor:"pointer", color:C.textMuted, display:"flex", alignItems:"center" }}>
          <Copy size={11}/>
        </button>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────
export default function DashboardPage({ onNewAssessment, onResume, onViewResults, onCarrierProfile, profile }) {
  const [viewMode, setViewMode] = useState("list");   // "list" | "cards"
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatus] = useState("all");
  const [tierFilter, setTier]   = useState("all");
  const [sortBy, setSortBy]     = useState("date");
  const [sortDir, setSortDir]   = useState("desc");

  const stats = getMockStats();

  const filtered = useMemo(() => {
    let data = [...MOCK_ASSESSMENTS];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(a =>
        a.carrier_name?.toLowerCase().includes(q) ||
        a.naic?.includes(q) ||
        a.lobs?.some(l => (LOB_LABEL[l]||l).toLowerCase().includes(q))
      );
    }
    if (statusFilter !== "all") data = data.filter(a => a.status === statusFilter);
    if (tierFilter   !== "all") data = data.filter(a => String(a.tier) === tierFilter);

    data.sort((a,b) => {
      const va = sortBy==="date" ? new Date(a.started_at) : sortBy==="score" ? (a.overall_score||0) : a.carrier_name;
      const vb = sortBy==="date" ? new Date(b.started_at) : sortBy==="score" ? (b.overall_score||0) : b.carrier_name;
      return sortDir==="desc" ? (va>vb?-1:1) : (va<vb?-1:1);
    });
    return data;
  }, [search, statusFilter, tierFilter, sortBy, sortDir]);

  const inProgCount = MOCK_ASSESSMENTS.filter(a => a.status === "in_progress").length;

  const greeting = () => { const h = new Date().getHours(); return h<12?"Good morning":h<17?"Good afternoon":"Good evening"; };

  return (
    <div style={{ background:C.bg, minHeight:"calc(100vh - 66px)" }}>
      {/* Hero */}
      <div style={{ background:"white", borderBottom:"1px solid #d8ebe2" }}>
        <div style={{ maxWidth:1160, margin:"0 auto", padding:"28px 28px 24px", display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:16 }}>
          <div>
            <div style={{ fontFamily:FONT.sans, fontSize:12, color:C.textMuted, marginBottom:4 }}>{greeting()},</div>
            <h1 style={{ fontFamily:FONT.serif, fontSize:26, fontWeight:700, color:C.text, marginBottom:6 }}>
              {profile?.full_name||"Consultant"} <span style={{ color:"#1a4731" }}>·</span> Assessment Hub
            </h1>
            <p style={{ fontFamily:FONT.sans, fontSize:13, color:C.textSoft }}>
              {inProgCount>0 ? `${inProgCount} assessment${inProgCount>1?"s":""} in progress — resume to continue.` : "All assessments up to date."}
            </p>
          </div>
          <button onClick={onNewAssessment} style={{ ...btnPrimary, borderRadius:6, padding:"11px 22px", fontSize:14, flexShrink:0 }}>
            <Plus size={15}/> New Assessment
          </button>
        </div>
      </div>

      <PageWrap maxWidth={1160}>
        {!SUPABASE_ENABLED && (
          <div style={{ ...card, padding:"10px 16px", marginBottom:20, display:"flex", gap:10, alignItems:"center", borderLeft:"3px solid #92400e", background:"#fef3c7" }}>
            <AlertTriangle size={13} color="#92400e"/>
            <span style={{ fontFamily:FONT.sans, fontSize:12, color:"#92400e" }}>
              <strong>Demo mode</strong> — showing sample data for 10 carriers. Add Supabase keys to use real data.
            </span>
          </div>
        )}

        <StatsBar stats={stats}/>

        {/* Controls */}
        <div style={{ ...card, padding:"14px 18px", marginBottom:14 }}>
          <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:220, position:"relative" }}>
              <Search size={13} color={C.textMuted} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search carrier name, NAIC, or LOB…"
                style={{ width:"100%", padding:"8px 12px 8px 32px", border:"1px solid #d8ebe2", borderRadius:6, fontFamily:FONT.sans, fontSize:13, color:C.text, outline:"none", boxSizing:"border-box" }}/>
            </div>

            {/* Status filter */}
            <div style={{ display:"flex", gap:4 }}>
              {[["all","All"],["in_progress","In Progress"],["complete","Complete"]].map(([v,l]) => (
                <button key={v} onClick={()=>setStatus(v)} style={{ padding:"6px 11px", borderRadius:5, fontSize:11, fontWeight:statusFilter===v?700:400, fontFamily:FONT.sans, cursor:"pointer", border:"1px solid "+(statusFilter===v?"#1a4731":"#d8ebe2"), background:statusFilter===v?"#1a4731":"white", color:statusFilter===v?"white":C.textSoft }}>{l}</button>
              ))}
            </div>

            {/* Tier filter */}
            <div style={{ display:"flex", gap:4 }}>
              {[["all","All"],["1","T1"],["2","T2"],["3","T3"]].map(([v,l]) => (
                <button key={v} onClick={()=>setTier(v)} style={{ padding:"6px 10px", borderRadius:5, fontSize:11, fontWeight:tierFilter===v?700:400, fontFamily:FONT.sans, cursor:"pointer", border:"1px solid "+(tierFilter===v?"#1a4731":"#d8ebe2"), background:tierFilter===v?"#1a4731":"white", color:tierFilter===v?"white":C.textSoft }}>{l}</button>
              ))}
            </div>

            {/* View toggle */}
            <div style={{ display:"flex", border:"1px solid #d8ebe2", borderRadius:5, overflow:"hidden", marginLeft:"auto" }}>
              {[["list","≡ List"],["cards","⊞ Cards"]].map(([v,l]) => (
                <button key={v} onClick={()=>setViewMode(v)} style={{ padding:"6px 12px", fontSize:11, fontWeight:viewMode===v?700:400, fontFamily:FONT.sans, border:"none", background:viewMode===v?"#1a4731":"white", color:viewMode===v?"white":C.textSoft, cursor:"pointer" }}>{l}</button>
              ))}
            </div>

            <span style={{ fontFamily:FONT.sans, fontSize:11, color:C.textMuted }}>{filtered.length} result{filtered.length!==1?"s":""}</span>
          </div>
        </div>

        {/* Cards view */}
        {viewMode === "cards" && (
          <CarrierGrid onCarrierClick={onCarrierProfile} onViewAssessment={onViewResults}/>
        )}

        {/* List view */}
        {viewMode === "list" && (
          <div style={{ ...card, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 70px 110px 80px 90px 150px", gap:10, padding:"11px 20px", background:"#f7faf8", borderBottom:"2px solid #1a4731" }}>
              {[["Carrier","name"],["Tier",null],["Status",null],["Path",null],["Score","score"],["Actions",null]].map(([h,col]) => (
                <div key={h}
                  onClick={col ? () => { setSortBy(col); setSortDir(d => d==="asc" ? "desc" : "asc"); } : undefined}
                  style={{ fontFamily:FONT.sans, fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", cursor:col?"pointer":"default", display:"flex", alignItems:"center", gap:3 }}>
                  {h}{col && sortBy===col && (sortDir==="asc" ? " ↑" : " ↓")}
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div style={{ padding:"40px 20px", textAlign:"center", fontFamily:FONT.sans, fontSize:13, color:C.textMuted }}>No assessments match your search.</div>
            )}
            {filtered.map((a,i) => (
              <AssessmentRow key={a.assessment_id+i} a={a}
                onResume={onResume}
                onView={onViewResults}
                onCarrierClick={onCarrierProfile}/>
            ))}
          </div>
        )}

        {inProgCount > 0 && (
          <div style={{ marginTop:14, fontFamily:FONT.sans, fontSize:12, color:C.textSoft, display:"flex", alignItems:"center", gap:6 }}>
            <AlertTriangle size={12} color="#92400e"/>
            Assessments in progress 7+ days are flagged stale. Click Resume or Clone to start fresh for the same carrier.
          </div>
        )}
      </PageWrap>
    </div>
  );
}
