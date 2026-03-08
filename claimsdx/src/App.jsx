import { useState, useEffect } from "react";
import { Nav } from "./components.jsx";
import { useApp, ROLE_ACCESS } from "./AppContext.jsx";
import { Save, Loader } from "lucide-react";
import { C, FONT } from "./constants.js";

// Pages
import LoginPage          from "./pages/LoginPage.jsx";
import DashboardPage      from "./pages/DashboardPage.jsx";
import AdminPage          from "./pages/AdminPage.jsx";
import CarrierProfilePage from "./pages/CarrierProfilePage.jsx";
import Page1 from "./pages/Page1.jsx";
import Page2 from "./pages/Page2.jsx";
import Page3 from "./pages/Page3.jsx";
import Page4 from "./pages/Page4.jsx";
import Page5 from "./pages/Page5.jsx";
import Page6 from "./pages/Page6.jsx";
import Page7 from "./pages/Page7.jsx";
import { ResumePrompt } from "./SaveProgress.jsx";

// ── Top-level views ───────────────────────────────────────────
// "dashboard"  — Assessment Hub (default after login)
// "assessment" — Active assessment flow (pages 1-7)
// "results"    — Read-only historical results for a carrier
// "carrier"    — Carrier profile with all assessments + trend
// "admin"      — Admin panel

export default function App() {
  const {
    session, profile, authLoading,
    signOut, role,
    saveProgress, loadProgress, clearProgress, saveStatus,
  } = useApp();

  // ── View routing ─────────────────────────────────────────────
  // Admin → dashboard hub; consultant/sales → start at assessment (Page1)
  const defaultView = role === "admin" ? "dashboard" : "assessment";
  const [view, setView]   = useState(defaultView);  // dashboard | assessment | results | carrier | admin

  // ── Assessment state ─────────────────────────────────────────
  const [page, setPage]                           = useState(1);
  const [assessmentPath, setAssessmentPath]       = useState(null);
  const [carrierInfo, setCarrierInfo]             = useState({});
  const [processSelections, setProcessSelections] = useState([]);
  const [maturityScores, setMaturityScores]       = useState({});
  const [metricsData, setMetricsData]             = useState({});

  // ── Context panels ────────────────────────────────────────────
  const [showResume, setShowResume]   = useState(false);
  const [viewingAssessment, setViewingAssessment] = useState(null);  // for read-only results
  const [carrierProfileId, setCarrierProfileId]   = useState(null);
  const [carrierProfileName, setCarrierProfileName] = useState("");

  // Check for saved in-progress after login
  useEffect(() => {
    if (session && profile) {
      loadProgress().then(saved => {
        if (saved?.page && saved.page > 1) setShowResume(true);
      });
    }
  }, [session?.user?.id, profile?.id]);

  const canAccess = (p) => role ? (ROLE_ACCESS[role]?.includes(p) ?? false) : false;

  // ── Navigation helpers ────────────────────────────────────────
  const goToDashboard = () => {
    setView(role === "admin" ? "dashboard" : "assessment");
    setPage(1);
    setAssessmentPath(null);
    setCarrierInfo({});
    setProcessSelections([]);
    setMaturityScores({});
    setMetricsData({});
  };

  const startNewAssessment = (prefill = null) => {
    if (prefill?.carrier_name) {
      // Clone — pre-fill carrier info
      setCarrierInfo({
        name: prefill.carrier_name,
        naic: prefill.naic,
        tier: prefill.tier,
        lobs: prefill.lobs,
      });
      setPage(2);
    } else {
      setPage(1);
    }
    setAssessmentPath(null);
    setView("assessment");
  };

  const resumeAssessment = (saved) => {
    if (saved.page)              setPage(saved.page);
    if (saved.assessmentPath)    setAssessmentPath(saved.assessmentPath);
    if (saved.carrierInfo)       setCarrierInfo(saved.carrierInfo);
    if (saved.processSelections) setProcessSelections(saved.processSelections);
    if (saved.maturityScores)    setMaturityScores(saved.maturityScores);
    if (saved.metricsData)       setMetricsData(saved.metricsData);
    setShowResume(false);
    setView("assessment");
  };

  const viewResults = (assessment) => {
    setViewingAssessment(assessment);
    setView("results");
  };

  const openCarrierProfile = (carrierId, carrierName) => {
    setCarrierProfileId(carrierId);
    setCarrierProfileName(carrierName);
    setView("carrier");
  };

  const handlePathSelect = (path) => {
    setAssessmentPath(path);
    if (role === "sales")        setPage(5);
    else if (path === "metrics") setPage(4);
    else                         setPage(6);
  };

  const handleLogout = () => {
    signOut();
    setView("dashboard");
    setPage(1);
    setAssessmentPath(null);
    setCarrierInfo({});
  };

  const handleSave = () => saveProgress({ page, assessmentPath, carrierInfo, processSelections, maturityScores, metricsData });

  // ── Loading ───────────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ minHeight:"100vh", background:"#f0f7f3", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ position:"fixed", top:0, left:0, right:0, height:4, background:"#1a4731" }} />
      <div style={{ textAlign:"center" }}>
        <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:22, fontWeight:700, color:"#0f1a13", marginBottom:20 }}>
          Claims<span style={{ color:"#1a4731" }}>Dx</span> Portal
        </div>
        <div style={{ width:36, height:36, border:"3px solid #c3ddd0", borderTopColor:"#1a4731", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 14px" }} />
        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:13, color:"#4a6357" }}>Loading your workspace…</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── Not authenticated ─────────────────────────────────────────
  if (!session) return <LoginPage />;

  // ── Admin panel ───────────────────────────────────────────────
  if (view === "admin") return (
    <AdminPage
      onBack={() => setView("dashboard")}
      role={role}
      profile={profile}
      onLogout={handleLogout}
    />
  );

  // ── Carrier profile ───────────────────────────────────────────
  if (view === "carrier") return (
    <>
      <Nav page={0} setPage={()=>{}} role={role} profile={profile}
        onAdmin={role==="admin" ? ()=>setView("admin") : null}
        onLogout={handleLogout} />
      <CarrierProfilePage
        carrierId={carrierProfileId}
        carrierName={carrierProfileName}
        onBack={() => setView("dashboard")}
        onViewAssessment={(a, mode) => {
          if (mode === "resume") resumeAssessment(a);
          else viewResults(a);
        }}
      />
    </>
  );

  // ── Dashboard ─────────────────────────────────────────────────
  if (view === "dashboard") return (
    <>
      <Nav page={0} setPage={()=>{}} role={role} profile={profile}
        onAdmin={role==="admin" ? ()=>setView("admin") : null}
        onLogout={handleLogout} />
      {showResume && <ResumePrompt onResume={(saved)=>{ loadProgress().then(s => s && resumeAssessment(s)); }} onDismiss={() => { clearProgress(); setShowResume(false); }} />}
      <DashboardPage
        profile={profile}
        onNewAssessment={startNewAssessment}
        onResume={resumeAssessment}
        onViewResults={viewResults}
        onCarrierProfile={openCarrierProfile}
      />
    </>
  );

  // ── Read-only results view ────────────────────────────────────
  if (view === "results") return (
    <>
      <Nav page={5} setPage={()=>{}} role={role} profile={profile}
        onAdmin={role==="admin" ? ()=>setView("admin") : null}
        onLogout={handleLogout} />
      <Page5
        assessment={viewingAssessment}
        onBack={() => setView("dashboard")}
        setPage={setPage}
        role={role}
        readOnly
      />
    </>
  );

  // ── Assessment flow ───────────────────────────────────────────
  const showSaveBtn = role !== "sales" && page > 1 && page < 8;

  return (
    <div style={{ background:C.bg, minHeight:"100vh" }}>
      <Nav
        page={page}
        setPage={(p) => { canAccess(p) && setPage(p); }}
        role={role}
        profile={profile}
        onAdmin={role==="admin" ? ()=>setView("admin") : null}
        onLogout={handleLogout}
        onDashboard={() => setView("dashboard")}
      />

      {/* Floating save button */}
      {showSaveBtn && (
        <div style={{ position:"fixed", top:70, right:18, zIndex:100 }}>
          <button onClick={handleSave} style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"6px 13px", borderRadius:6, fontSize:11, fontWeight:600,
            border: saveStatus==="saved" ? "1.5px solid #c3ddd0" : saveStatus==="error" ? "1.5px solid #fca5a5" : "1.5px solid #d8ebe2",
            background: saveStatus==="saved" ? "#f0f7f3" : saveStatus==="error" ? "#fee2e2" : "white",
            color: saveStatus==="saved" ? "#166534" : saveStatus==="error" ? "#991b1b" : C.textSoft,
            cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.09)", fontFamily:FONT.sans,
          }}>
            {saveStatus==="saving" ? <Loader size={12} style={{ animation:"spin 1s linear infinite" }}/> : <Save size={12}/>}
            {saveStatus==="saving" ? "Saving…" : saveStatus==="saved" ? "Saved!" : saveStatus==="error" ? "Failed" : "Save"}
          </button>
        </div>
      )}

      {showResume && (
        <ResumePrompt
          onResume={() => { loadProgress().then(s => s && resumeAssessment(s)); }}
          onDismiss={() => { clearProgress(); setShowResume(false); }}
        />
      )}

      {page===1 && <Page1 onNext={()=>setPage(2)} onDashboard={()=>setView("dashboard")} role={role} />}
      {page===2 && canAccess(2) && <Page2 onNext={()=>setPage(3)} onBack={()=>setPage(1)} onCarrierInfo={setCarrierInfo} initialData={carrierInfo} />}
      {page===3 && canAccess(3) && <Page3 onNext={handlePathSelect} onBack={()=>setPage(2)} />}
      {page===4 && canAccess(4) && <Page4 onNext={()=>setPage(5)} onBack={()=>setPage(3)} onDataChange={setMetricsData} carrierLobs={carrierInfo?.lobs || []} />}
      {page===5 && canAccess(5) && (
        <Page5
          onBack={()=> assessmentPath==="process" ? setPage(6) : setPage(4)}
          setPage={setPage}
          onNext={assessmentPath==="metrics" ? ()=>setPage(6) : null}
          onDashboard={()=>setView("dashboard")}
          role={role}
        />
      )}
      {page===6 && canAccess(6) && (
        <Page6
          onNext={(sel)=>{ setProcessSelections(sel); setPage(7); }}
          onBack={()=> assessmentPath==="process" ? setPage(3) : setPage(5)}
          initialSelections={processSelections}
        />
      )}
      {page===7 && canAccess(7) && (
        <Page7
          onNext={(scores)=>{ setMaturityScores(scores); setPage(5); }}
          onBack={()=>setPage(6)}
          processSelections={processSelections}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
