import { useState } from "react";
import {
  ChevronRight, TrendingUp, TrendingDown, Settings, LogOut,
  HelpCircle, X, Send, Check,
  Home, Building2, GitBranch, BarChart2, ClipboardCheck,
  List, ClipboardList, Award,
  LayoutDashboard, FilePlus, ShieldCheck, LifeBuoy,
} from "lucide-react";
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

// ─── Support Button + Modal (#17) ─────────────────────────────────────────────
// Allows consultants/admins to submit queries to Claims Vertical Group
function SupportButton() {
  const [open, setOpen]       = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent]       = useState(false);

  const handleSend = () => {
    const to      = "claims.vertical@valuemomentum.com";
    const sub     = encodeURIComponent(subject || "ClaimsDx Portal Query");
    const body    = encodeURIComponent(message || "");
    window.open(`mailto:${to}?subject=${sub}&body=${body}`, "_blank");
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); setSubject(""); setMessage(""); }, 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Contact Claims Vertical Group"
        style={{
          padding: "5px 10px", borderRadius: 5, border: "1px solid #d8ebe2",
          background: "white", color: C.textSoft, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
          fontSize: 12, fontFamily: FONT.sans,
        }}
      >
        <HelpCircle size={14} /> Support
      </button>

      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.4)", display: "flex",
          alignItems: "center", justifyContent: "center",
        }} onClick={() => setOpen(false)}>
          <div style={{
            background: "white", borderRadius: 12, padding: "28px 32px",
            width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            borderTop: "4px solid #1a4731",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: FONT.serif, fontSize: 18, fontWeight: 700, color: "#1a4731", marginBottom: 3 }}>
                  Contact Claims Vertical Group
                </div>
                <div style={{ fontFamily: FONT.sans, fontSize: 12, color: C.textSoft }}>
                  Submit a query or feedback — we'll respond via email.
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Subject</div>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Question about benchmark data"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #d8ebe2", borderRadius: 6, fontFamily: FONT.sans, fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Message</div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe your query or feedback in detail…"
                rows={4}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #d8ebe2", borderRadius: 6, fontFamily: FONT.sans, fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setOpen(false)} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #d8ebe2", background: "white", color: C.textSoft, fontSize: 13, cursor: "pointer", fontFamily: FONT.sans }}>
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                style={{
                  padding: "8px 18px", borderRadius: 6, border: "none",
                  background: sent ? "#166534" : (message.trim() ? "#1a4731" : "#94a3b8"),
                  color: "white", fontSize: 13, cursor: message.trim() ? "pointer" : "not-allowed",
                  fontFamily: FONT.sans, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <Send size={13} /> {sent ? "Opening email…" : "Send via Email"}
              </button>
            </div>
            <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, marginTop: 10, textAlign: "center" }}>
              Opens your email client to claims.vertical@valuemomentum.com
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────────────
export function Nav({ page, setPage, role, profile, onAdmin, onLogout, onDashboard }) {
  const visibleSteps = role === "sales"
    ? [
        { label: "Welcome",        short: "Welcome",  p: 1, Icon: Home          },
        { label: "Carrier",        short: "Carrier",  p: 2, Icon: Building2     },
        { label: "Metrics Results",short: "M.Results",p: 5, Icon: ClipboardCheck},
      ]
    : [
        { label: "Welcome",            short: "Welcome", p: 1, Icon: Home          },
        { label: "Carrier",            short: "Carrier", p: 2, Icon: Building2     },
        { label: "Path",               short: "Path",    p: 3, Icon: GitBranch     },
        { label: "Metrics",            short: "Metrics", p: 4, Icon: BarChart2     },
        { label: "Metrics Results",    short: "Metrics", p: 5, Icon: ClipboardCheck},
        { label: "Process",            short: "Process", p: 6, Icon: List          },
        { label: "Process Assessment", short: "Assess.", p: 7, Icon: ClipboardList  },
        { label: "Process Results",    short: "Results", p: 8, Icon: Award         },
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

        {/* Step nav — numbered circles with icons */}
        <nav style={{ display: "flex", alignItems: "center", gap: 0, flex: 1, justifyContent: "center" }}>
          {visibleSteps.map((s, i) => {
            const isActive  = page === s.p;
            const isDone    = page > s.p;
            const isFuture  = page < s.p;
            const StepIcon  = s.Icon;

            return (
              <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
                <button
                  onClick={() => setPage(s.p)}
                  title={s.label}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: "transparent", border: "none",
                    padding: "4px 6px", borderRadius: 6,
                    cursor: "pointer", position: "relative",
                    opacity: isFuture ? 0.45 : 1,
                    transition: "opacity 0.15s",
                  }}
                >
                  {/* Circle indicator */}
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isDone ? "#1a4731" : isActive ? "#1a4731" : "transparent",
                    border: isDone ? "2px solid #1a4731" : isActive ? "2px solid #1a4731" : "2px solid #c3ddd0",
                    transition: "all 0.2s",
                  }}>
                    {isDone
                      ? <Check size={11} color="white" strokeWidth={3}/>
                      : <StepIcon size={11}
                          color={isActive ? "white" : isFuture ? "#94a3b8" : "#4a6357"}
                          strokeWidth={isActive ? 2.5 : 1.8}/>
                    }
                  </div>
                  {/* Label — always show, truncated */}
                  <span style={{
                    fontFamily: FONT.sans,
                    fontSize: 11,
                    fontWeight: isActive ? 700 : isDone ? 500 : 400,
                    color: isActive ? "#1a4731" : isDone ? "#4a6357" : "#94a3b8",
                    whiteSpace: "nowrap",
                    maxWidth: isActive ? 90 : 72,
                    overflow: "hidden", textOverflow: "ellipsis",
                    letterSpacing: "0.01em",
                  }}>
                    {isActive ? s.label : s.short}
                  </span>
                  {/* Active underline */}
                  {isActive && (
                    <div style={{
                      position: "absolute", bottom: -18, left: 0, right: 0,
                      height: 2, background: "#1a4731", borderRadius: 1,
                    }}/>
                  )}
                </button>
                {i < visibleSteps.length - 1 && (
                  <ChevronRight size={10} color="#d8ebe2" strokeWidth={2.5} style={{ flexShrink: 0 }}/>
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

          {/* Support button — contact Claims Vertical Group (#17 fix) */}
          <SupportButton />

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

// ─── Sidebar (app destinations — persistent left nav) ─────────────────────────
export function Sidebar({ active, role, profile, onNavigate, onLogout, collapsed, onToggle }) {
  const items = [
    { id: "dashboard",  label: "Dashboard",      Icon: LayoutDashboard, roles: ["admin","consultant","sales"] },
    { id: "new",        label: "New Assessment", Icon: FilePlus,       roles: ["admin","consultant"] },
    { id: "admin",      label: "Admin Panel",    Icon: ShieldCheck,     roles: ["admin"] },
    { id: "help",       label: "Help & Support", Icon: LifeBuoy,        roles: ["admin","consultant","sales"] },
  ];
  const visible = items.filter(it => it.roles.includes(role));

  const W = collapsed ? 64 : 224;
  const initial = (profile?.full_name || profile?.email || "U").charAt(0).toUpperCase();

  return (
    <aside style={{
      width: W, minWidth: W, height: "100vh", position: "sticky", top: 0,
      background: "#13301f", color: "white", display: "flex", flexDirection: "column",
      transition: "width 0.18s ease", flexShrink: 0, zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "18px 0" : "18px 20px", justifyContent: collapsed ? "center" : "flex-start", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ width: 32, height: 32, borderRadius: 7, background: "#1a4731", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.serif, fontWeight: 800, fontSize: 14, color: "white", flexShrink: 0, border: "1px solid rgba(255,255,255,0.15)" }}>VM</div>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: FONT.serif, fontSize: 15, fontWeight: 700, lineHeight: 1 }}>ClaimsDx</div>
            <div style={{ fontFamily: FONT.sans, fontSize: 8, letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", marginTop: 2 }}>VALUEMOMENTUM</div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
        {visible.map(it => {
          const isActive = active === it.id;
          return (
            <button key={it.id} onClick={() => onNavigate(it.id)} title={it.label}
              style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: collapsed ? "11px 0" : "11px 13px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 8, border: "none", cursor: "pointer", width: "100%",
                background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                color: isActive ? "white" : "rgba(255,255,255,0.65)",
                fontFamily: FONT.sans, fontSize: 13, fontWeight: isActive ? 600 : 400,
                transition: "background 0.12s, color 0.12s", position: "relative",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
              {isActive && <div style={{ position: "absolute", left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2, background: "#7dd3a8" }} />}
              <it.Icon size={17} strokeWidth={isActive ? 2.4 : 1.9} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{it.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button onClick={onToggle} title={collapsed ? "Expand" : "Collapse"}
        style={{ margin: "0 10px 8px", padding: "8px", borderRadius: 8, border: "none", background: "transparent", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        {collapsed ? "»" : "«"}
      </button>

      {/* User + logout */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: collapsed ? "12px 0" : "12px 14px", display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1a4731", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{initial}</div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 110 }}>{profile?.full_name || "User"}</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "capitalize" }}>{role}</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button onClick={onLogout} title="Sign out"
            style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", padding: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = "white"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}

// ─── AppShell — sidebar + content wrapper ─────────────────────────────────────
export function AppShell({ active, role, profile, onNavigate, onLogout, sidebarCollapsed, onToggleSidebar, children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg }}>
      <Sidebar
        active={active}
        role={role}
        profile={profile}
        onNavigate={onNavigate}
        onLogout={onLogout}
        collapsed={sidebarCollapsed}
        onToggle={onToggleSidebar}
      />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}
