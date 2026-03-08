import { useState } from "react";
import { ArrowLeft, Clock, CheckCircle2, BarChart3, TrendingUp, TrendingDown, Minus, Calendar, FileText } from "lucide-react";
import { C, FONT, card, btnPrimary, btnSecondary, LENS_COLORS } from "../constants.js";
import { PageWrap, Tag, ScoreRing } from "../components.jsx";
import { MOCK_ASSESSMENTS, LENS_KEYS, LENS_LABELS } from "../mockData.js";

const MATURITY_COLOR = { Leading: "#166534", Advanced: "#1a4731", Developing: "#92400e", Foundational: "#991b1b" };
const LENS_STROKE    = ["#1a4731","#92400e","#166534","#1e3a5f","#9f1239"];

function TrendLine({ values, color, size = 80 }) {
  if (values.length < 2) return null;
  const min = Math.min(...values) - 5;
  const max = Math.max(...values) + 5;
  const range = max - min || 1;
  const w = size, h = 36;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={(i / (values.length - 1)) * w} cy={h - ((v - min) / range) * h} r={3} fill={color} stroke="white" strokeWidth={1.5} />
      ))}
    </svg>
  );
}

export default function CarrierProfilePage({ carrierId, carrierName, onBack, onViewAssessment }) {
  const [activeTab, setActiveTab] = useState("overview");

  // Get all assessments for this carrier
  const all = MOCK_ASSESSMENTS.filter(a => a.carrier_id === carrierId || a.carrier_name === carrierName);
  const completed = all.filter(a => a.status === "complete" && a.overall_score).sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at));
  const inProgress = all.filter(a => a.status === "in_progress");
  const latest = completed[completed.length - 1];
  const previous = completed[completed.length - 2];

  const scoreTrend = completed.map(a => a.overall_score);
  const delta = latest && previous ? latest.overall_score - previous.overall_score : null;

  return (
    <div style={{ background: C.bg, minHeight: "calc(100vh - 66px)" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #d8ebe2" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 28px 0" }}>
          <button onClick={onBack} style={{ ...btnSecondary, borderRadius: 5, padding: "6px 12px", fontSize: 12, marginBottom: 16 }}>
            <ArrowLeft size={12} /> Back to Hub
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, paddingBottom: 0 }}>
            <div>
              <div style={{ marginBottom: 8 }}><Tag color="forest">Carrier Profile</Tag></div>
              <h1 style={{ fontFamily: FONT.serif, fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 4 }}>{carrierName}</h1>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {latest && <span style={{ fontFamily: FONT.sans, fontSize: 12, color: C.textSoft }}>T{latest.tier} · NAIC {latest.naic}</span>}
                <span style={{ fontFamily: FONT.sans, fontSize: 12, color: C.textSoft }}>{completed.length} completed · {inProgress.length} in progress</span>
              </div>
            </div>
            {latest && (
              <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 4 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: FONT.sans, fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Latest Score</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: FONT.mono, fontSize: 28, fontWeight: 800, color: MATURITY_COLOR[latest.maturity_level] }}>{latest.overall_score}</span>
                    {delta !== null && (
                      <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 700, color: delta > 0 ? "#166534" : delta < 0 ? "#991b1b" : "#7a9688" }}>
                        {delta > 0 ? <TrendingUp size={14} /> : delta < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
                        {delta > 0 ? "+" : ""}{delta}
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: MATURITY_COLOR[latest.maturity_level] }}>{latest.maturity_level}</div>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginTop: 20 }}>
            {[["overview","Overview"],["history","Assessment History"],["lenses","Lens Breakdown"]].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                padding: "9px 18px", border: "none", background: "transparent",
                borderBottom: "2px solid " + (activeTab === id ? "#1a4731" : "transparent"),
                color: activeTab === id ? "#1a4731" : C.textSoft,
                fontFamily: FONT.sans, fontWeight: activeTab === id ? 700 : 400,
                fontSize: 13, cursor: "pointer", marginBottom: -1,
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <PageWrap maxWidth={1100}>
        {/* ── Tab: Overview ── */}
        {activeTab === "overview" && (
          <div className="fade-up">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
              {latest && LENS_KEYS.slice(0, 3).map((k, i) => {
                const v = latest.lens_scores?.[k];
                const gap = v ? v - 65 : null;
                return (
                  <div key={k} style={{ ...card, padding: "18px 20px", borderTop: "3px solid " + LENS_STROKE[i] }}>
                    <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{LENS_LABELS[k]}</div>
                    <div style={{ fontFamily: FONT.mono, fontSize: 24, fontWeight: 800, color: LENS_STROKE[i], marginBottom: 4 }}>{v ?? "—"}</div>
                    {gap !== null && <div style={{ fontFamily: FONT.sans, fontSize: 11, color: gap >= 0 ? "#166534" : "#991b1b", fontWeight: 600 }}>{gap >= 0 ? "+" : ""}{gap} vs median</div>}
                  </div>
                );
              })}
            </div>
            {latest && LENS_KEYS.slice(3).map((k, i) => null) /* handled below */}

            {/* Score trend chart */}
            {completed.length >= 2 && (
              <div style={{ ...card, padding: "22px 24px", marginBottom: 20 }}>
                <div style={{ fontFamily: FONT.serif, fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 18 }}>Overall Score Trend</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
                  <TrendLine values={scoreTrend} color="#1a4731" size={300} />
                  <div style={{ display: "flex", flex: 1, gap: 12, justifyContent: "flex-end" }}>
                    {completed.map((a, i) => (
                      <div key={a.assessment_id} style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 800, color: MATURITY_COLOR[a.maturity_level] }}>{a.overall_score}</div>
                        <div style={{ fontFamily: FONT.sans, fontSize: 9, color: C.textMuted, marginTop: 3 }}>
                          {new Date(a.completed_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Latest lens scores */}
            {latest?.lens_scores && (
              <div style={{ ...card, padding: "22px 24px" }}>
                <div style={{ fontFamily: FONT.serif, fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 18 }}>Latest Lens Scores</div>
                {LENS_KEYS.map((k, i) => {
                  const v = latest.lens_scores[k] || 0;
                  return (
                    <div key={k} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontFamily: FONT.sans, fontSize: 12, color: C.textMid }}>{LENS_LABELS[k]}</span>
                        <div style={{ display: "flex", gap: 10 }}>
                          <span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, color: LENS_STROKE[i] }}>{v}</span>
                          <span style={{ fontFamily: FONT.sans, fontSize: 11, color: v - 65 >= 0 ? "#166534" : "#991b1b", fontWeight: 600 }}>{v - 65 >= 0 ? "+" : ""}{v - 65} vs median</span>
                        </div>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: "#edf5f0", overflow: "hidden", position: "relative" }}>
                        <div style={{ height: "100%", width: v + "%", background: LENS_STROKE[i], borderRadius: 3 }} />
                        {/* Median marker at 65% */}
                        <div style={{ position: "absolute", left: "65%", top: 0, bottom: 0, width: 1.5, background: "#92400e", opacity: 0.5 }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ fontFamily: FONT.sans, fontSize: 10, color: C.textMuted, marginTop: 4 }}>Orange marker = industry median (65)</div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: History ── */}
        {activeTab === "history" && (
          <div className="fade-up">
            {inProgress.length > 0 && (
              <div style={{ ...card, padding: "14px 20px", marginBottom: 16, borderLeft: "4px solid #92400e", background: "#fef3c7" }}>
                <div style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>
                  {inProgress.length} assessment{inProgress.length > 1 ? "s" : ""} in progress
                </div>
                {inProgress.map(a => (
                  <div key={a.assessment_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: FONT.sans, fontSize: 12, color: C.textMid }}>
                      Started {new Date(a.started_at).toLocaleDateString()} · {a.path || "path not selected"}
                    </span>
                    <button onClick={() => onViewAssessment(a, "resume")} style={{ ...btnPrimary, padding: "5px 12px", fontSize: 11, borderRadius: 5 }}>Resume</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "120px 80px 80px 80px 1fr 100px", gap: 10, padding: "11px 20px", background: "#f7faf8", borderBottom: "2px solid #1a4731" }}>
                {["Date","Path","Tier","Score","Maturity","Action"].map(h => (
                  <div key={h} style={{ fontFamily: FONT.sans, fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
                ))}
              </div>
              {completed.length === 0 && (
                <div style={{ padding: "32px 20px", textAlign: "center", fontFamily: FONT.sans, fontSize: 13, color: C.textMuted }}>No completed assessments yet.</div>
              )}
              {[...completed].reverse().map((a, i) => (
                <div key={a.assessment_id} style={{ display: "grid", gridTemplateColumns: "120px 80px 80px 80px 1fr 100px", gap: 10, padding: "13px 20px", borderBottom: "1px solid #edf5f0", background: i % 2 === 0 ? "white" : "#fafcfa", alignItems: "center" }}>
                  <div style={{ fontFamily: FONT.sans, fontSize: 12, color: C.textMid }}>
                    {new Date(a.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textSoft, textTransform: "capitalize" }}>{a.path || "—"}</div>
                  <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textSoft }}>Tier {a.tier}</div>
                  <div style={{ fontFamily: FONT.mono, fontSize: 15, fontWeight: 800, color: MATURITY_COLOR[a.maturity_level] }}>{a.overall_score}</div>
                  <div>
                    <span style={{ fontFamily: FONT.sans, fontSize: 10, fontWeight: 700, color: MATURITY_COLOR[a.maturity_level], background: MATURITY_COLOR[a.maturity_level] + "14", padding: "3px 9px", borderRadius: 3 }}>{a.maturity_level}</span>
                  </div>
                  <button onClick={() => onViewAssessment(a, "view")} style={{ ...btnSecondary, padding: "5px 12px", fontSize: 11, borderRadius: 5, color: "#1a4731", borderColor: "#c3ddd0" }}>
                    View Results
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: Lens Breakdown ── */}
        {activeTab === "lenses" && completed.length > 0 && (
          <div className="fade-up">
            {LENS_KEYS.map((k, ki) => (
              <div key={k} style={{ ...card, padding: "20px 24px", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontFamily: FONT.serif, fontSize: 15, fontWeight: 700, color: C.text }}>{LENS_LABELS[k]}</div>
                  {latest?.lens_scores?.[k] && (
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 800, color: LENS_STROKE[ki] }}>{latest.lens_scores[k]}</span>
                      <span style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted }}>latest</span>
                    </div>
                  )}
                </div>
                {completed.length >= 2 && (
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 8 }}>
                    <TrendLine values={completed.map(a => a.lens_scores?.[k] || 0)} color={LENS_STROKE[ki]} size={200} />
                    <div style={{ display: "flex", gap: 10 }}>
                      {completed.map(a => (
                        <div key={a.assessment_id} style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, color: LENS_STROKE[ki] }}>{a.lens_scores?.[k] || "—"}</div>
                          <div style={{ fontFamily: FONT.sans, fontSize: 9, color: C.textMuted }}>{new Date(a.completed_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Gap bar */}
                {latest?.lens_scores?.[k] && (() => {
                  const v = latest.lens_scores[k];
                  const gap = v - 65;
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#edf5f0", overflow: "hidden", position: "relative" }}>
                        <div style={{ height: "100%", width: v + "%", background: LENS_STROKE[ki], borderRadius: 3 }} />
                        <div style={{ position: "absolute", left: "65%", top: 0, bottom: 0, width: 1.5, background: "#92400e", opacity: 0.6 }} />
                      </div>
                      <span style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: gap >= 0 ? "#166534" : "#991b1b", flexShrink: 0 }}>{gap >= 0 ? "+" : ""}{gap} vs median</span>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
        {activeTab === "lenses" && completed.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, fontFamily: FONT.sans, fontSize: 13, color: C.textMuted }}>No completed assessments to show lens data for.</div>
        )}
      </PageWrap>
    </div>
  );
}
