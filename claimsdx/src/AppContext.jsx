import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { BENCHMARK_DATA } from "./benchmarkData.js";
import { useAuth } from "./lib/useAuth.js";
import { SUPABASE_ENABLED } from "./lib/supabase.js";
import {
  upsertCarrier,
  createAssessment,
  saveProgressToDB,
  loadProgressFromDB,
  markAssessmentComplete,
  saveResults,
  loadBenchmarkOverrides,
  saveBenchmarkOverride,
} from "./lib/progressDB.js";

const AppContext = createContext(null);

export const ROLES = {
  sales:      { label: "Sales",      color: "#9f1239", desc: "Demo mode — limited screens"         },
  consultant: { label: "Consultant", color: "#1a4731", desc: "Full assessment access"              },
  admin:      { label: "Admin",      color: "#0f766e", desc: "Full access including settings"      },
};

export const ROLE_ACCESS = {
  sales:      [1, 2, 3, 5],
  consultant: [1, 2, 3, 4, 5, 6, 7],
  admin:      [1, 2, 3, 4, 5, 6, 7, 8, 9],
};

export function AppProvider({ children }) {
  const auth = useAuth();
  const [benchmarks, setBenchmarks]         = useState(BENCHMARK_DATA);
  const [benchmarkOverrides, setBenchmarkOverrides] = useState({});
  // Ref keeps a sync copy of overrides so updateBenchmarkOverride can read
  // current state without stale closures when calling saveBenchmarkOverride
  const overridesRef = useRef({});
  useEffect(() => { overridesRef.current = benchmarkOverrides; }, [benchmarkOverrides]);

  const [assessmentId, setAssessmentId]     = useState(null);
  const [saveStatus, setSaveStatus]         = useState("idle");
  const [lastSavedAt, setLastSavedAt]       = useState(null);

  // Load benchmark overrides from Supabase on mount
  useEffect(() => {
    if (!SUPABASE_ENABLED) return;
    loadBenchmarkOverrides().then(({ overrides }) => {
      if (overrides && Object.keys(overrides).length > 0) {
        setBenchmarkOverrides(overrides);
      }
    });
  }, []);

  // Admin: update one benchmark field and persist to Supabase
  const updateBenchmarkOverride = useCallback((lob, metricName, tier, field, value) => {
    const overrideKey = `${lob}:${metricName}:${tier}`;
    const numVal = parseFloat(value);
    const safeVal = isNaN(numVal) ? 0 : numVal;

    // 1. Update local state immediately for snappy UI
    setBenchmarkOverrides(prev => {
      const existing = prev[overrideKey] || {};
      return { ...prev, [overrideKey]: { ...existing, [field]: safeVal } };
    });

    // 2. Build the full updated object using ref (avoids stale closure)
    //    and persist to Supabase
    if (SUPABASE_ENABLED) {
      const existing = overridesRef.current[overrideKey] || {};
      const updated  = { ...existing, [field]: safeVal };
      saveBenchmarkOverride(lob, metricName, parseInt(tier), updated);
    }
  }, []);

  // Refs to prevent race conditions (not affected by stale closures)
  const assessmentIdRef  = useRef(null);
  const creatingRef      = useRef(false);   // prevent duplicate assessment creation

  const role = auth.profile?.role || null;

  const updateBenchmark = (lob, index, field, tierKey, value) => {
    setBenchmarks(prev => {
      const next = { ...prev };
      next[lob] = [...prev[lob]];
      next[lob][index] = { ...next[lob][index], [tierKey]: { ...next[lob][index][tierKey], [field]: value } };
      return next;
    });
  };

  const saveProgress = useCallback(async (stateSnapshot) => {
    // Always save to localStorage as backup
    try {
      localStorage.setItem("claimsdx_progress",
        JSON.stringify({ ...stateSnapshot, savedAt: new Date().toISOString() }));
    } catch {}

    // Local / offline mode — done
    if (!SUPABASE_ENABLED || !auth.session || auth.session.user.id === "local") {
      setSaveStatus("saved");
      setLastSavedAt(new Date().toISOString());
      setTimeout(() => setSaveStatus("idle"), 2500);
      return true;
    }

    setSaveStatus("saving");
    try {
      const userId = auth.session.user.id;
      let asmId = assessmentIdRef.current;

      if (!asmId) {
        // Prevent two concurrent calls both trying to create an assessment
        if (creatingRef.current) {
          // Another call is already creating — just save localStorage and return
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2500);
          return true;
        }
        creatingRef.current = true;

        // Step 1: upsert carrier to get a carrierId
        const { id: carrierId, error: carrierErr } = await upsertCarrier(userId, stateSnapshot.carrierInfo || {});
        if (carrierErr) throw carrierErr;

        // Step 2: create assessment row with correct 3-arg call
        const { id, error: asmErr } = await createAssessment(userId, carrierId, stateSnapshot.carrierInfo || {});
        if (asmErr) throw asmErr;

        asmId = id;
        assessmentIdRef.current = id;
        setAssessmentId(id);
        creatingRef.current = false;
      }

      // Step 3: upsert progress blob
      const { error } = await saveProgressToDB(userId, asmId, stateSnapshot);
      if (error) throw error;

      setSaveStatus("saved");
      setLastSavedAt(new Date().toISOString());
      setTimeout(() => setSaveStatus("idle"), 2500);
      return true;
    } catch (e) {
      console.error("Save failed:", e);
      creatingRef.current = false;
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
      return false;
    }
  }, [auth.session]);

  const loadProgress = useCallback(async () => {
    if (!SUPABASE_ENABLED || !auth.session || auth.session.user.id === "local") {
      try {
        const raw = localStorage.getItem("claimsdx_progress");
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    }
    const { progress } = await loadProgressFromDB(auth.session.user.id);
    if (progress) {
      assessmentIdRef.current = progress.assessmentId;
      setAssessmentId(progress.assessmentId);
    }
    return progress;
  }, [auth.session]);

  const clearProgress = useCallback(() => {
    localStorage.removeItem("claimsdx_progress");
    assessmentIdRef.current = null;
    setAssessmentId(null);
  }, []);

  // ── Mark assessment complete + persist results ────────────────
  // Called by Page5 on first render with real data.
  // Writes results to assessment_results, flips status → 'complete',
  // and clears the in-progress progress blob so it no longer resumes.
  const completeAssessment = useCallback(async (results) => {
    // Always clear localStorage progress — regardless of Supabase mode
    localStorage.removeItem("claimsdx_progress");

    if (!SUPABASE_ENABLED || !auth.session || auth.session.user.id === "local") return;

    const userId = auth.session.user.id;
    const asmId  = assessmentIdRef.current;
    if (!asmId) return; // no assessment to mark complete

    try {
      // 1. Persist the computed results to assessment_results table
      const { error: resErr } = await saveResults(userId, asmId, null, {
        overallScore:       results.overallScore,
        maturityLevel:      results.maturityLevel,
        lensScores:         results.lensScores         || {},
        lensGaps:           results.lensGaps           || {},
        strengths:          results.strengths          || [],
        improvements:       results.improvements       || [],
        valueOpportunities: results.valueOpportunities || [],
        tierUsed:           results.tierUsed,
        lobPrimary:         results.lobPrimary,
      });
      if (resErr) console.error("saveResults error:", resErr);

      // 2. Flip status → 'complete', set completed_at
      const { error: completeErr } = await markAssessmentComplete(asmId);
      if (completeErr) console.error("markAssessmentComplete error:", completeErr);

      // 3. Reset in-memory assessment ref so a new assessment starts fresh
      assessmentIdRef.current = null;
      setAssessmentId(null);
    } catch (e) {
      console.error("completeAssessment failed:", e);
    }
  }, [auth.session]);

  return (
    <AppContext.Provider value={{
      session:         auth.session,
      profile:         auth.profile,
      authLoading:     auth.loading,
      signIn:          auth.signIn,
      signUp:          auth.signUp,
      signOut:         auth.signOut,
      localLogin:      auth.localLogin,
      supabaseEnabled: SUPABASE_ENABLED,
      role,
      benchmarks,
      updateBenchmark,
      benchmarkOverrides,
      updateBenchmarkOverride,
      saveProgress,
      loadProgress,
      clearProgress,
      completeAssessment,
      saveStatus,
      lastSavedAt,
      assessmentId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
