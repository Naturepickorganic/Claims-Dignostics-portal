import { useState } from "react";
import { Save, CheckCircle2, Clock, X, PlayCircle } from "lucide-react";
import { C } from "./constants.js";
import { useApp } from "./AppContext.jsx";

export function SaveBanner({ currentState, onResume }) {
  const { saveProgress, loadProgress, clearProgress } = useApp();
  const [saved, setSaved] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const saved_data = loadProgress();

  const handleSave = () => {
    saveProgress(currentState);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button
        onClick={handleSave}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer",
          border: saved ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
          background: saved ? "#f0fdf4" : "white",
          color: saved ? "#16a34a" : C.textSoft,
        }}
      >
        {saved ? <CheckCircle2 size={12} /> : <Save size={12} />}
        {saved ? "Saved!" : "Save Progress"}
      </button>
    </div>
  );
}

export function ResumePrompt({ onResume, onDismiss }) {
  const { loadProgress } = useApp();
  const data = loadProgress();
  if (!data) return null;

  const savedAt = data.savedAt ? new Date(data.savedAt) : null;
  const timeStr = savedAt ? savedAt.toLocaleString() : "recently";

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 200,
      background: "white", borderRadius: 14, padding: "16px 18px",
      border: "1px solid #bfdbfe", boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
      maxWidth: 320,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <PlayCircle size={16} color="#1a4731" />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Resume saved session?</span>
        </div>
        <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted }}>
          <X size={14} />
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 12 }}>
        <Clock size={11} color={C.textMuted} />
        <span style={{ fontSize: 11, color: C.textMuted }}>Saved {timeStr}</span>
      </div>
      {data.page && (
        <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 12 }}>
          You were on step {data.page}.
          {data.processSelections?.length ? ` ${data.processSelections.length} processes selected.` : ""}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onResume(data)}
          style={{ flex: 1, padding: "7px 12px", borderRadius: 7, background: "#1a4731", color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          Resume
        </button>
        <button
          onClick={onDismiss}
          style={{ padding: "7px 12px", borderRadius: 7, background: "#f8fafc", color: C.textSoft, border: "1px solid #e2e8f0", fontSize: 12, cursor: "pointer" }}
        >
          Start fresh
        </button>
      </div>
    </div>
  );
}
