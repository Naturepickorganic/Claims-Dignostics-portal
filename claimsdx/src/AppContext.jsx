import { createContext, useContext, useState, useCallback } from "react";
import { BENCHMARK_DATA } from "./benchmarkData.js";
import { useAuth } from "./lib/useAuth.js";
import { SUPABASE_ENABLED } from "./lib/supabase.js";
import { saveProgressToDB, loadProgressFromDB, createAssessment } from "./lib/progressDB.js";

const AppContext = createContext(null);

export const ROLES = {
  sales:      { label: "Sales",      color: "#9f1239", desc: "Demo mode — limited screens"          },
  consultant: { label: "Consultant", color: "#1a4731", desc: "Full assessment access"               },
  admin:      { label: "Admin",      color: "#0f766e", desc: "Full access including settings"       },
};

export const ROLE_ACCESS = {
  sales:      [1, 2, 3, 5],
  consultant: [1, 2, 3, 4, 5, 6, 7],
  admin:      [1, 2, 3, 4, 5, 6, 7, 8, 9],
};

export function AppProvider({ children }) {
  const auth = useAuth();
  const [benchmarks, setBenchmarks]     = useState(BENCHMARK_DATA);
  const [assessmentId, setAssessmentId] = useState(null);
  const [saveStatus, setSaveStatus]     = useState("idle");

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

    if (!SUPABASE_ENABLED || !auth.session || auth.session.user.id === "local") {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
      return true;
    }

    setSaveStatus("saving");
    try {
      let asmId = assessmentId;
      if (!asmId) {
        const { id, error } = await createAssessment(auth.session.user.id, stateSnapshot.carrierInfo);
        if (error) throw error;
        asmId = id;
        setAssessmentId(id);
      }
      const { error } = await saveProgressToDB(auth.session.user.id, asmId, stateSnapshot);
      if (error) throw error;
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
      return true;
    } catch (e) {
      console.error("Save failed:", e);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
      return false;
    }
  }, [auth.session, assessmentId]);

  const loadProgress = useCallback(async () => {
    // Local fallback first
    if (!SUPABASE_ENABLED || !auth.session || auth.session.user.id === "local") {
      try {
        const raw = localStorage.getItem("claimsdx_progress");
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    }
    const { progress } = await loadProgressFromDB(auth.session.user.id);
    if (progress) setAssessmentId(progress.assessmentId);
    return progress;
  }, [auth.session]);

  const clearProgress = useCallback(() => {
    localStorage.removeItem("claimsdx_progress");
    setAssessmentId(null);
  }, []);

  return (
    <AppContext.Provider value={{
      session: auth.session,
      profile: auth.profile,
      authLoading: auth.loading,
      signIn: auth.signIn,
      signUp: auth.signUp,
      signOut: auth.signOut,
      localLogin: auth.localLogin,   // ← for offline dev
      supabaseEnabled: SUPABASE_ENABLED,
      role,
      benchmarks,
      updateBenchmark,
      saveProgress,
      loadProgress,
      clearProgress,
      saveStatus,
      assessmentId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
