import { ChevronRight, TrendingUp, TrendingDown, Settings, LogOut } from "lucide-react";
import { C, FONT, LENS_COLORS } from "./constants.js";

// ─── VM Logo mark ─────────────────────────────────────────────────────────────
export function VMLogo({ size = "md" }) {
  const s = size === "lg" ? { box: 44, font: 18, sub: 10 }
           : size === "sm" ? { box: 30, font: 13, sub: 8 }
           : { box: 36, font: 15, sub: 9 };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {/* Logomark — forest green square with white VM */}
      <div style={{
        width: s.box, height: s.box, borderRadius: 6,
        background: "#1a4731",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: FONT.serif, fontSize: s.font, fontWeight: 800, color: "white", letterSpacing: "-0.5px" }}>VM</span>
      </div>
      {/* Wordmark */}
      <div>
        <div style={{ fontFamily: FONT.serif, fontSize: s.font + 2, fontWeight: 700, color: C.text, lineHeight: 1.1, letterSpacing: "-0.3px" }}>
          Claims<span style={{ color: "#1a4731" }}>Dx</span>
        </div>
        <div style={{ fontFamily: FONT.sans, fontSize: s.sub, fontWeight: 500, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 1 }}>
          ValueMomentum
        </div>
      </div>
    </div>
  );
}

// ─── Tag / badge ──────────────────────────────────────────────────────────────
export function Tag({ children, color = "green" }) {
  const m = {
    green:  { bg: "#f0f7f3", fg: "#1a4731", br: "#c3ddd0" },
    amber:  { bg: "#fef3c7", fg: "#92400e", br: "#fcd34d" },
    red:    { bg: "#fee2e2", fg: "#991b1b", br: "#fca5a5" },
    blue:   { bg: "#dbeafe", fg: "#1e3a5f", br: "#93c5fd" },
    forest: { bg: "#f0f7f3", fg: "#1a4731", br: "#c3ddd0" },
    teal:   { bg: "#f0fdfa", fg: "#0f766e", br: "#99f6e4" },
    muted:  { bg: "#f7faf8", fg: "#4a6357", br: "#d8ebe2" },
  };
  const s = m[color] || m.green;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 4, fontSize: 10,
      fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase",
      fontFamily: FONT.sans,
      background: s.bg, color: s.fg, border: "1px solid " + s.br,
    }}>
      {children}
    </span>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────
const ROLE_COLORS = { sales: "#9f1239", consultant: "#1a4731", admin: "#0f766e" };

export function Nav({ page, setPage, role, profile, onAdmin, onLogout, onDashboard }) {
  const visibleSteps = role === "sales"
    ? [{ label: "Welcome", p: 1 }, { label: "Carrier Info", p: 2 }, { label: "Results", p: 5 }]
    : [
        { label: "Welcome",    p: 1 },
        { label: "Carrier",    p: 2 },
        { label: "Path",       p: 3 },
        { label: "Metrics",    p: 4 },
        { label: "Results",    p: 5 },
        { label: "Process",    p: 6 },
        { label: "Assessment", p: 7 },
      ];

  const roleColor = ROLE_COLORS[role] || "#1a4731";
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "";
  const initials  = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : roleLabel.slice(0, 2).toUpperCase();

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: "white", borderBottom: "2px solid #1a4731" }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 28px",
        height: 62,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 24,
      }}>
        {/* Logo */}
        <div style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => onDashboard ? onDashboard() : setPage(1)}>
          <VMLogo size="md" />
        </div>

        {/* Step nav — centered, minimal */}
        <nav style={{ display: "flex", alignItems: "center", gap: 0, flex: 1, justifyContent: "center" }}>
          {visibleSteps.map((s, i) => {
            const isActive = page === s.p;
            const isDone   = page > s.p;
            return (
              <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
                <button
                  onClick={() => setPage(s.p)}
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#1a4731" : isDone ? "#7a9688" : "#4a6357",
                    background: "transparent",
                    border: "none",
                    padding: "4px 10px",
                    borderRadius: 4,
                    cursor: "pointer",
                    position: "relative",
                    letterSpacing: "0.01em",
                  }}
                >
                  {s.label}
                  {isActive && (
                    <div style={{
                      position: "absolute", bottom: -22, left: 0, right: 0,
                      height: 2, background: "#1a4731", borderRadius: 1,
                    }} />
                  )}
                </button>
                {i < visibleSteps.length - 1 && (
                  <ChevronRight size={11} color="#c3ddd0" strokeWidth={2} />
                )}
              </div>
            );
          })}
        </nav>

        {/* Right — user avatar + role + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {/* Role chip */}
          {role && (
            <span style={{
              fontFamily: FONT.sans, fontSize: 10, fontWeight: 600,
              color: roleColor, background: roleColor + "14",
              border: "1px solid " + roleColor + "33",
              padding: "3px 9px", borderRadius: 4, letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              {roleLabel}
            </span>
          )}

          {/* User avatar */}
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "#1a4731", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, fontFamily: FONT.sans,
            flexShrink: 0,
          }}>
            {initials}
          </div>

          {/* Admin */}
          {onAdmin && (
            <button onClick={onAdmin} title="Admin panel" style={{
              padding: "5px 8px", borderRadius: 5, border: "1px solid #d8ebe2",
              background: "white", color: C.textSoft, cursor: "pointer",
              display: "flex", alignItems: "center",
            }}>
              <Settings size={14} />
            </button>
          )}

          {/* Log out */}
          {onLogout && (
            <button onClick={onLogout} title="Sign out" style={{
              padding: "5px 8px", borderRadius: 5, border: "1px solid #d8ebe2",
              background: "white", color: C.textSoft, cursor: "pointer",
              display: "flex", alignItems: "center",
            }}>
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar — very thin, green */}
      <div style={{ height: 2, background: "#edf5f0", position: "relative" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: ((Math.min(page, 7) - 1) / 6 * 100) + "%",
          background: "#1a4731",
          transition: "width 0.5s ease",
        }} />
      </div>
    </header>
  );
}

// ─── Score ring ───────────────────────────────────────────────────────────────
export function ScoreRing({ score, color, size = 110 }) {
  const r      = (size / 2) * 0.78;
  const circ   = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const sw     = size * 0.08;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#edf5f0" strokeWidth={sw} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

// ─── Gap badge ────────────────────────────────────────────────────────────────
export function GapBadge({ gap }) {
  if (gap > 0) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, color: "#166534", fontSize: 10, fontWeight: 600, fontFamily: FONT.sans }}>
      <TrendingUp size={10} />+{gap}
    </span>
  );
  if (gap < 0) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, color: "#991b1b", fontSize: 10, fontWeight: 600, fontFamily: FONT.sans }}>
      <TrendingDown size={10} />{gap}
    </span>
  );
  return <span style={{ color: "#7a9688", fontSize: 10, fontFamily: FONT.sans }}>at median</span>;
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
export function PageWrap({ children, maxWidth = 1060 }) {
  return (
    <div className="fade-up" style={{ maxWidth, margin: "0 auto", padding: "40px 28px 100px" }}>
      {children}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
export function SectionHead({ tag, title, subtitle, action }) {
  return (
    <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
      <div>
        {tag && <div style={{ marginBottom: 10 }}><Tag color="forest">{tag}</Tag></div>}
        <h1 style={{ fontFamily: FONT.serif, fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1.2, marginBottom: subtitle ? 8 : 0 }}>
          {title}
        </h1>
        {subtitle && <p style={{ fontFamily: FONT.sans, fontSize: 14, color: C.textSoft, lineHeight: 1.65, maxWidth: 580 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent, topBorder }) {
  return (
    <div style={{
      background: "white", border: "1px solid #d8ebe2", borderRadius: 8,
      borderTop: topBorder ? `3px solid ${topBorder}` : undefined,
      padding: "20px 22px",
      boxShadow: "0 1px 4px rgba(26,71,49,0.05)",
    }}>
      <div style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: FONT.mono, fontSize: 28, fontWeight: 700, color: accent || C.text, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: FONT.sans, fontSize: 12, color: C.textSoft, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}
