import { useState, useEffect } from "react";
import { ArrowLeft, Clock, CheckCircle2, Eye, RotateCcw, Building2, Calendar } from "lucide-react";
import { C, FONT, card, btnSecondary } from "../constants.js";
import { PageWrap, Tag } from "../components.jsx";
import { listAssessmentsForCarrier, getCarrierEconomics } from "../lib/progressDB.js";

const LOB_LABEL = { pa:"Personal Auto", ph:"Personal Home", ca:"Comm. Auto", cp:"Comm. Property", bop:"BOP/BIP", wc:"Workers Comp", gl:"Gen. Liability" };
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";
const fmtNum = v => { const n = parseFloat(String(v||"").replace(/,/g,"")); return isNaN(n) ? null : n.toLocaleString(); };

export default function CarrierProfilePage({ carrierId, carrierName, onBack, onViewAssessment }) {
  const [rows, setRows] = useState(null);          // null = loading
  const [economics, setEconomics] = useState(null);

  useEffect(() => {
    let alive = true;
    listAssessmentsForCarrier(carrierName, carrierId).then(({ assessments }) => {
      if (!alive) return;
      setRows(assessments || []);
      const naic = assessments?.[0]?.naic;
      if (naic) getCarrierEconomics(naic).then(({ economics: eco }) => { if (alive) setEconomics(eco); });
    });
    return () => { alive = false; };
  }, [carrierName, carrierId]);

  const list = rows || [];
  const head = list[0];
  const completed = list.filter(a => a.status === "completed").length;
  const inProg    = list.filter(a => a.status === "in_progress").length;

  const ecoChips = economics ? [
    economics.dwp ? { label:"DWP", value:`$${fmtNum(economics.dwp)}M` } : null,
    economics.annualClaims ? { label:"Annual Claims", value: fmtNum(economics.annualClaims) } : null,
    economics.adjusterCount ? { label:"Adjusters", value: fmtNum(economics.adjusterCount) } : null,
    economics.policyRetention ? { label:"Retention", value:`${economics.policyRetention}%` } : null,
  ].filter(Boolean) : [];

  return (
    <PageWrap maxWidth={980}>
      <button onClick={onBack} style={{ ...btnSecondary, borderRadius:6, marginBottom:18 }}>
        <ArrowLeft size={13}/> Back to Dashboard
      </button>

      {/* Header */}
      <div style={{ ...card, padding:"22px 26px", marginBottom:16, borderTop:"3px solid #1a4731" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:14, flexWrap:"wrap" }}>
          <div style={{ width:44, height:44, borderRadius:9, background:"#1a4731", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Building2 size={20} color="white"/>
          </div>
          <div style={{ flex:1, minWidth:220 }}>
            <div style={{ fontFamily:FONT.serif, fontSize:20, fontWeight:700, color:C.text }}>{carrierName || head?.carrier_name || "Carrier"}</div>
            <div style={{ fontFamily:FONT.sans, fontSize:11.5, color:C.textMuted, marginTop:3 }}>
              {head?.naic ? `NAIC ${head.naic} · ` : ""}{head?.tier ? `Tier ${head.tier} · ` : ""}
              {(head?.lobs || []).map(l => LOB_LABEL[l] || l).join(", ") || "Lines not set"}
            </div>
            <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
              <Tag color="green">{list.length} assessment{list.length===1?"":"s"}</Tag>
              {completed > 0 && <Tag color="green">{completed} completed</Tag>}
              {inProg > 0 && <Tag color="amber">{inProg} in progress</Tag>}
            </div>
          </div>
          {ecoChips.length > 0 && (
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {ecoChips.map(ch => (
                <div key={ch.label} style={{ background:"#f0f7f3", border:"1px solid #d8ebe2", borderRadius:8, padding:"8px 14px", textAlign:"center" }}>
                  <div style={{ fontFamily:FONT.mono, fontSize:14, fontWeight:800, color:"#1a4731" }}>{ch.value}</div>
                  <div style={{ fontFamily:FONT.sans, fontSize:9, color:C.textMuted, letterSpacing:".05em", textTransform:"uppercase", marginTop:2 }}>{ch.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assessment history */}
      <div style={{ ...card, overflow:"hidden" }}>
        <div style={{ padding:"13px 22px", borderBottom:"1px solid #edf5f0", fontFamily:FONT.serif, fontWeight:700, fontSize:14.5, color:C.text }}>
          Assessment History
        </div>
        {rows === null && (
          <div style={{ padding:28, textAlign:"center", fontFamily:FONT.sans, fontSize:12, color:C.textMuted }}>Loading…</div>
        )}
        {rows !== null && list.length === 0 && (
          <div style={{ padding:28, textAlign:"center", fontFamily:FONT.sans, fontSize:12, color:C.textMuted }}>
            No assessments found for this carrier yet.
          </div>
        )}
        {list.map((a, i) => (
          <div key={a.assessment_id} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 22px", borderBottom: i < list.length-1 ? "1px solid #f1f5f9" : "none", flexWrap:"wrap" }}>
            <div style={{ width:30, height:30, borderRadius:7, background: a.status==="completed" ? "#dcfce7" : "#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {a.status==="completed" ? <CheckCircle2 size={15} color="#166534"/> : <Clock size={15} color="#92400e"/>}
            </div>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontFamily:FONT.sans, fontSize:12.5, fontWeight:600, color:C.text }}>
                {a.path === "metrics" ? "Metrics Diagnostic" : a.path === "process" ? "Process Assessment" : a.path === "both" ? "Full Diagnostic" : "Assessment"}
                <span style={{ fontWeight:400, color:C.textMuted }}> · {a.status === "completed" ? "Completed" : "In progress"}</span>
              </div>
              <div style={{ fontFamily:FONT.sans, fontSize:10.5, color:C.textMuted, marginTop:2, display:"flex", gap:12, flexWrap:"wrap" }}>
                <span><Calendar size={9} style={{marginRight:3,verticalAlign:"-1px"}}/>Started {fmtDate(a.started_at)}</span>
                {a.last_worked_at && <span>Last worked {fmtDate(a.last_worked_at)}</span>}
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => onViewAssessment(a, "view")}
                style={{ ...btnSecondary, padding:"5px 12px", fontSize:11, borderRadius:5, gap:4, color:"#1a4731", borderColor:"#c3ddd0" }}>
                <Eye size={11}/> View
              </button>
              {a.status === "in_progress" && (
                <button onClick={() => onViewAssessment(a, "resume")}
                  style={{ ...btnSecondary, padding:"5px 12px", fontSize:11, borderRadius:5, gap:4, color:"#166534", borderColor:"#bbe3c8", background:"#f0fdf4" }}>
                  <RotateCcw size={11}/> Resume
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageWrap>
  );
}
