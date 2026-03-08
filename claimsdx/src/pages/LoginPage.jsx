import { useState } from "react";
import { ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { C, FONT, btnPrimary } from "../constants.js";
import { VMLogo } from "../components.jsx";
import { useApp, ROLES } from "../AppContext.jsx";

const ROLE_DESC = {
  sales:      { label: "Sales",      accent: "#9f1239", access: "Demo & results overview"          },
  consultant: { label: "Consultant", accent: "#1a4731", access: "Full assessment workflow"          },
  admin:      { label: "Admin",      accent: "#0f766e", access: "Full access + benchmark settings"  },
};

// ── Local dev role picker (no Supabase) ───────────────────────────────────────
function LocalLogin({ onLocalLogin }) {
  const [selected, setSelected] = useState("consultant");

  return (
    <div style={{ background: "white", borderRadius: 10, border: "1px solid #d8ebe2", overflow: "hidden", boxShadow: "0 4px 24px rgba(26,71,49,0.08)" }}>
      {/* Header */}
      <div style={{ background: "#1a4731", padding: "22px 28px" }}>
        <div style={{ fontFamily: FONT.serif, fontSize: 20, fontWeight: 700, color: "white", marginBottom: 4 }}>
          Local Development Mode
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Zap size={12} color="#fde68a" />
          <span style={{ fontFamily: FONT.sans, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
            Supabase not configured — using local role picker
          </span>
        </div>
      </div>

      <div style={{ padding: "28px 28px 24px" }}>
        <div style={{ fontFamily: FONT.sans, fontSize: 12, color: C.textSoft, marginBottom: 20, lineHeight: 1.6, background: "#f0f7f3", border: "1px solid #c3ddd0", borderRadius: 6, padding: "12px 14px" }}>
          <strong style={{ color: "#1a4731" }}>No .env.local needed</strong> — pick a role below to test the app. 
          Add Supabase credentials when ready to deploy.
        </div>

        <div style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
          Select Role to Preview
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {Object.entries(ROLE_DESC).map(([key, r]) => (
            <button key={key} onClick={() => setSelected(key)} style={{
              padding: "14px 16px", borderRadius: 6, cursor: "pointer", textAlign: "left",
              border: "1.5px solid " + (selected === key ? r.accent : "#d8ebe2"),
              background: selected === key ? r.accent + "0d" : "white",
              borderLeft: "4px solid " + (selected === key ? r.accent : "#d8ebe2"),
              transition: "all 0.15s", display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 14, color: selected === key ? r.accent : C.text }}>{r.label}</div>
                <div style={{ fontFamily: FONT.sans, fontSize: 12, color: C.textSoft, marginTop: 2 }}>{r.access}</div>
              </div>
              {selected === key && <CheckCircle2 size={16} color={r.accent} />}
            </button>
          ))}
        </div>

        <button onClick={() => onLocalLogin(selected)} style={{
          ...btnPrimary, width: "100%", justifyContent: "center",
          padding: "12px 0", fontSize: 14, borderRadius: 6,
        }}>
          Enter as {ROLE_DESC[selected].label} <ArrowRight size={15} />
        </button>

        <div style={{ marginTop: 16, fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, textAlign: "center" }}>
          To enable real auth: create <code style={{ background: "#f0f7f3", padding: "1px 6px", borderRadius: 3, color: "#1a4731" }}>.env.local</code> with your Supabase keys
        </div>
      </div>
    </div>
  );
}

// ── Real Supabase login ───────────────────────────────────────────────────────
function SupabaseLogin() {
  const { signIn, signUp } = useApp();
  const [mode, setMode]         = useState("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [signupRole, setSignupRole] = useState("consultant");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true); setError("");
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!email || !password || !name) { setError("Please fill in all fields."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true); setError("");
    const { error } = await signUp(email, password, name, signupRole);
    if (error) setError(error.message);
    else setSuccess("Account created! Check your email to confirm, then sign in.");
    setLoading(false);
  };

  const inp = {
    width: "100%", padding: "10px 14px", border: "1px solid #d8ebe2", borderRadius: 6,
    fontSize: 14, fontFamily: FONT.sans, color: C.text, background: "white",
    outline: "none", boxSizing: "border-box",
  };
  const lbl = { display: "block", fontSize: 12, fontWeight: 600, color: C.textMid, marginBottom: 6, fontFamily: FONT.sans };

  return (
    <div style={{ background: "white", borderRadius: 10, border: "1px solid #d8ebe2", overflow: "hidden", boxShadow: "0 4px 24px rgba(26,71,49,0.08)" }}>
      <div style={{ background: "#1a4731", padding: "22px 28px" }}>
        <div style={{ fontFamily: FONT.serif, fontSize: 20, fontWeight: 700, color: "white", marginBottom: 4 }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </div>
        <div style={{ fontFamily: FONT.sans, fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
          {mode === "login" ? "Sign in to access your assessment workspace." : "Register to start a ClaimsDx assessment."}
        </div>
      </div>

      <div style={{ padding: "28px 28px 24px" }}>
        {/* Tab toggle */}
        <div style={{ display: "flex", border: "1px solid #d8ebe2", borderRadius: 6, overflow: "hidden", marginBottom: 22 }}>
          {["login","signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
              flex: 1, padding: "8px 0", border: "none", fontSize: 13, fontWeight: 600,
              fontFamily: FONT.sans, cursor: "pointer",
              background: mode === m ? "#1a4731" : "white",
              color: mode === m ? "white" : C.textSoft,
            }}>
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {error && <div style={{ display: "flex", gap: 8, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, padding: "10px 12px", marginBottom: 16 }}><AlertCircle size={14} color="#991b1b" style={{ flexShrink: 0, marginTop: 1 }} /><span style={{ fontSize: 13, color: "#991b1b", fontFamily: FONT.sans }}>{error}</span></div>}
        {success && <div style={{ display: "flex", gap: 8, background: "#f0f7f3", border: "1px solid #c3ddd0", borderRadius: 6, padding: "10px 12px", marginBottom: 16 }}><CheckCircle2 size={14} color="#1a4731" style={{ flexShrink: 0, marginTop: 1 }} /><span style={{ fontSize: 13, color: "#1a4731", fontFamily: FONT.sans }}>{success}</span></div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "signup" && <div><label style={lbl}>Full Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" style={inp} /></div>}

          <div><label style={lbl}>Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" style={inp} onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignup())} /></div>

          <div><label style={lbl}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === "signup" ? "Minimum 8 characters" : "Your password"} style={{ ...inp, paddingRight: 40 }} onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignup())} />
              <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 0 }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <div>
              <label style={lbl}>Role</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {Object.entries(ROLE_DESC).map(([key, r]) => (
                  <button key={key} onClick={() => setSignupRole(key)} style={{ padding: "9px 6px", borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: FONT.sans, cursor: "pointer", border: "1.5px solid " + (signupRole === key ? r.accent : "#d8ebe2"), background: signupRole === key ? r.accent + "0f" : "white", color: signupRole === key ? r.accent : C.textSoft }}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={mode === "login" ? handleLogin : handleSignup} disabled={loading} style={{ ...btnPrimary, width: "100%", justifyContent: "center", marginTop: 4, opacity: loading ? 0.75 : 1, padding: "12px 0", borderRadius: 6 }}>
            {loading ? <span className="spin" style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%" }} /> : <ArrowRight size={15} />}
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>

        <div style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: C.textMuted, fontFamily: FONT.sans }}>
          {mode === "login"
            ? <>No account? <button onClick={() => setMode("signup")} style={{ background: "none", border: "none", color: "#1a4731", cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: FONT.sans }}>Create one</button></>
            : <>Already registered? <button onClick={() => setMode("login")} style={{ background: "none", border: "none", color: "#1a4731", cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: FONT.sans }}>Sign in</button></>
          }
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { localLogin, supabaseEnabled } = useApp();

  return (
    <div style={{ minHeight: "100vh", background: "#f0f7f3", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: FONT.sans }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 4, background: "#1a4731" }} />

      <div style={{ width: "100%", maxWidth: 960 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ display: "inline-block", marginBottom: 16 }}><VMLogo size="lg" /></div>
          <div style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textSoft }}>P&C Claims Diagnostic Assessment Platform</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 32, alignItems: "start" }}>
          {/* Left: access level guide */}
          <div>
            <div style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>Access Levels</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
              {Object.entries(ROLE_DESC).map(([key, r]) => (
                <div key={key} style={{ background: "white", border: "1px solid #d8ebe2", borderRadius: 8, padding: "16px 18px", borderLeft: "4px solid " + r.accent }}>
                  <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 3 }}>{r.label}</div>
                  <div style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textSoft }}>{r.access}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "2px solid #1a4731", paddingTop: 24 }}>
              <blockquote style={{ fontFamily: FONT.serif, fontSize: 17, fontWeight: 600, color: C.text, lineHeight: 1.55, margin: 0 }}>
                "Operational excellence in claims is not an accident — it is the result of consistent measurement."
              </blockquote>
              <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, marginTop: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                ClaimsDx Diagnostic Framework · ValueMomentum
              </div>
            </div>
          </div>

          {/* Right: local picker OR real auth */}
          {supabaseEnabled ? <SupabaseLogin /> : <LocalLogin onLocalLogin={localLogin} />}
        </div>
      </div>
    </div>
  );
}
