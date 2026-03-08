// ─── BCG-inspired Design System ──────────────────────────────────────────────
// Deep forest green · Clean white space · Playfair serif headers · Inter body

export const C = {
  // Primary palette — forest green
  primary:       "#1a4731",   // BCG deep forest green — nav, headers, CTAs
  primaryMid:    "#2d6a4f",   // Hover states, active
  primaryLight:  "#f0f7f3",   // Tinted backgrounds
  primaryBorder: "#c3ddd0",   // Subtle green borders

  // Neutral palette
  bg:       "#f7faf8",        // Page background — very light sage
  bgWhite:  "#ffffff",        // Card / panel backgrounds
  bgAlt:    "#f0f7f3",        // Section alternates

  // Text scale
  text:      "#0f1a13",       // Near-black with green tint
  textMid:   "#2d4a38",       // Secondary text
  textSoft:  "#4a6357",       // Tertiary text
  textMuted: "#7a9688",       // Disabled / placeholder

  // Border scale
  border:      "#d8ebe2",     // Default border
  borderLight: "#edf5f0",     // Very subtle dividers

  // Status / accent colors (sophisticated, not saturated)
  green:        "#166534",    // Success — dark green
  greenLight:   "#dcfce7",
  greenBorder:  "#86efac",
  amber:        "#92400e",    // Warning — deep amber
  amberLight:   "#fef3c7",
  amberBorder:  "#fcd34d",
  red:          "#991b1b",    // Error / critical
  redLight:     "#fee2e2",
  redBorder:    "#fca5a5",
  blue:         "#1e3a5f",    // Info — deep navy
  blueLight:    "#dbeafe",
  blueBorder:   "#93c5fd",

  // Gold accent — used sparingly for CTAs
  gold:        "#92400e",
  goldWarm:    "#b45309",

  // Keep legacy keys for compatibility
  navy:    "#1a4731",
  white:   "#ffffff",
};

// ─── Typography helpers ───────────────────────────────────────────────────────
export const FONT = {
  serif:  "'Playfair Display', Georgia, serif",
  sans:   "'Inter', system-ui, sans-serif",
  mono:   "'JetBrains Mono', 'Courier New', monospace",
};

// ─── Buttons ──────────────────────────────────────────────────────────────────
export const btnPrimary = {
  background: "#1a4731",
  color: "white",
  border: "none",
  padding: "11px 28px",
  borderRadius: 6,
  fontWeight: 600,
  fontSize: 14,
  fontFamily: "'Inter', sans-serif",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  letterSpacing: "0.01em",
  transition: "background 0.15s",
};

export const btnGold = {
  background: "#1a4731",
  color: "white",
  border: "none",
  padding: "11px 28px",
  borderRadius: 6,
  fontWeight: 600,
  fontSize: 14,
  fontFamily: "'Inter', sans-serif",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  letterSpacing: "0.01em",
};

export const btnSecondary = {
  background: "white",
  color: "#1a4731",
  border: "1.5px solid #c3ddd0",
  padding: "11px 24px",
  borderRadius: 6,
  fontWeight: 500,
  fontSize: 14,
  fontFamily: "'Inter', sans-serif",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

export const btnGhost = {
  background: "transparent",
  color: C.textSoft,
  border: "1px solid #d8ebe2",
  padding: "8px 16px",
  borderRadius: 6,
  fontWeight: 500,
  fontSize: 13,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

// ─── Card ─────────────────────────────────────────────────────────────────────
export const card = {
  background: "white",
  border: "1px solid #d8ebe2",
  borderRadius: 8,
  boxShadow: "0 1px 4px rgba(26,71,49,0.06)",
};

export const cardHover = {
  ...card,
  transition: "box-shadow 0.2s, border-color 0.2s",
};

// ─── Section header style ─────────────────────────────────────────────────────
export const sectionTitle = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 26,
  fontWeight: 700,
  color: "#0f1a13",
  lineHeight: 1.2,
};

export const sectionSubtitle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  color: "#4a6357",
  lineHeight: 1.65,
  fontWeight: 400,
};

// ─── Divider line — BCG minimal style ────────────────────────────────────────
export const divider = {
  height: 1,
  background: "#d8ebe2",
  border: "none",
  margin: "0",
};

// ─── Lens system — retained, color keys remapped to BCG palette ───────────────
export const LENSES = [
  { colorKey: "teal",   title: "Process Efficiency",    desc: "FNOL to closure flow, cycle time drivers, decision frameworks",    badge: "Process"   },
  { colorKey: "amber",  title: "Financial Leakage",     desc: "Subrogation recovery, medical bill accuracy, litigation impact",    badge: "Financial"   },
  { colorKey: "forest", title: "Quality & Compliance",  desc: "Documentation standards, regulatory adherence, quality monitoring", badge: "Compliance"  },
  { colorKey: "navy",   title: "Technology Utilization",desc: "Systems, automation, and data to support efficient outcomes",       badge: "Technology" },
  { colorKey: "rose",   title: "Org. Performance",      desc: "People, roles, productivity, skills, and performance management",   badge: "Performance"   },
];

export const LENS_COLORS = {
  teal:   { color: "#0f766e", bg: "#f0fdfa", border: "#99f6e4" },
  amber:  { color: "#92400e", bg: "#fef3c7", border: "#fcd34d" },
  forest: { color: "#1a4731", bg: "#f0f7f3", border: "#c3ddd0" },
  navy:   { color: "#1e3a5f", bg: "#dbeafe", border: "#93c5fd" },
  rose:   { color: "#9f1239", bg: "#fff1f2", border: "#fda4af" },
  // Legacy keys
  blue:   { color: "#1e3a5f", bg: "#dbeafe", border: "#93c5fd" },
  gold:   { color: "#92400e", bg: "#fef3c7", border: "#fcd34d" },
  green:  { color: "#1a4731", bg: "#f0f7f3", border: "#c3ddd0" },
  purple: { color: "#3730a3", bg: "#eef2ff", border: "#a5b4fc" },
  pink:   { color: "#9f1239", bg: "#fff1f2", border: "#fda4af" },
};

// ─── METRICS_DATA — unchanged ─────────────────────────────────────────────────
export const METRICS_DATA = {
  "Cost Efficiency": [
    ["Avg Claim Cycle Time",    "days", false, 28,   18,  "End-to-end time FNOL to closure"],
    ["LAE Ratio",               "%",    false, 12,    9,  "Loss Adjustment Expense as pct of earned premium"],
    ["Subrogation Recovery",    "%",    true,  18,   28,  "Pct of recoverable subrogation collected"],
    ["Litigation Rate",         "%",    false, 8,     4,  "Pct of claims with legal representation"],
    ["Medical Bill Penetration","%",    true,  72,   85,  "Pct of medical bills reviewed or repriced"],
    ["Salvage Recovery Rate",   "%",    true,  55,   68,  "Pct of salvage value recovered"],
    ["Vendor Invoice Leakage",  "%",    false, 5,     2,  "Overbilling rate on vendor invoices"],
    ["Defense Cost per Claim",  "$K",   false, 12,    7,  "Avg legal defense spend per litigated claim"],
  ],
  "Claim Effectiveness": [
    ["Reserve Accuracy",      "%",  true,  85, 93, "Pct of reserves within 10 pct of final settlement"],
    ["Claims Closure Rate",   "%",  true,  72, 82, "Pct of claims closed within policy period"],
    ["Re-open Rate",          "%",  false, 5,   2, "Pct of closed claims reopened within 90 days"],
    ["Severity Trend YoY",    "%",  false, 4,   1, "Year-over-year change in avg claim cost"],
    ["Early Resolution Rate", "%",  true,  35, 52, "Pct of claims settled within 30 days"],
    ["3P Acceptance Rate",    "%",  true,  68, 78, "Pct of valid 3P claims accepted within SLA"],
    ["BI Closure Rate",       "%",  true,  55, 68, "Pct of BI claims closed within 12 months"],
    ["SIU Referral Quality",  "%",  true,  65, 82, "Pct of SIU referrals confirmed fraudulent"],
  ],
  "Customer Experience": [
    ["Claimant CSAT",          "/10", true,  8.2, 9.1, "Post-claim customer satisfaction score"],
    ["Claimant NPS",           "pts", true,  45,  62,  "Net Promoter Score from claimant surveys"],
    ["Days to 1st Contact",    "days",false, 1.5, 0.5, "Days from FNOL to first adjuster contact"],
    ["Digital Adoption Rate",  "%",   true,  60,  78,  "Pct of claims with digital touchpoint engagement"],
    ["Complaint Ratio",        "p1K", false, 2.8, 1.2, "DoI complaints per 1,000 claims"],
    ["Days to Acknowledgement","days",false, 2,   0.5, "Days from FNOL to formal acknowledgement"],
    ["Portal Self-Service",    "%",   true,  35,  58,  "Pct of claimants using self-service portal"],
    ["Communication Score",    "/5",  true,  3.8, 4.5, "Claimant rating of proactive communication"],
  ],
  "Adjuster Productivity": [
    ["Open Claims per Adj",   "#",    false, 85,  60,  "Current open inventory per FTE adjuster"],
    ["Touchpoints per Claim", "#",    false, 6.2, 4.1, "Avg adjuster interactions per claim lifecycle"],
    ["STP Rate",              "%",    true,  22,  38,  "Straight-through processing rate"],
    ["Complex Claim Pct",     "%",    false, 15,  10,  "Pct of claims requiring supervisor review"],
    ["Avg Handle Time",       "hrs",  false, 3.2, 2.1, "Avg adjuster hours per claim"],
    ["New Claim Setup Time",  "mins", false, 22,  12,  "Time to complete initial setup"],
    ["Diary Compliance Rate", "%",    true,  88,  96,  "Pct of diary actions completed on time"],
    ["Training Hours/Year",   "hrs",  true,  28,  45,  "Annual CE and skills training per FTE"],
  ],
  "Fraud Prevention": [
    ["SIU Referral Rate",    "%",   true,  3,    5,   "Pct of claims referred to SIU"],
    ["Fraud Detection Rate", "%",   true,  12,   19,  "Pct of investigated claims confirmed fraudulent"],
    ["Fraud Recovery Rate",  "%",   true,  65,   78,  "Pct of fraud losses recovered"],
    ["Days to Detect Fraud", "days",false, 45,   28,  "Avg days from claim open to fraud confirmed"],
    ["AI-Assisted Flag Rate","%",   true,  40,   68,  "Pct of SIU referrals from predictive models"],
    ["Soft Fraud Rate",      "%",   false, 8,    3,   "Pct of claims with inflated damages identified"],
    ["Ring Detection Rate",  "%",   true,  22,   38,  "Pct of fraud rings detected via link analysis"],
    ["Cost per Fraud Case",  "$K",  false, 4.2,  2.8, "Avg cost to investigate and resolve fraud case"],
  ],
};

export const SAMPLE_SCORES = [
  { label: "Process Efficiency",    colorKey: "teal",   score: 71, gap: -9,  kpis: [
    { n: "Avg Cycle Time",       y: "32d",   b: "28d",  t: "18d",  s: "amber" },
    { n: "LAE Ratio",            y: "11.2%", b: "12%",  t: "9%",   s: "green" },
    { n: "Subrogation Recovery", y: "12%",   b: "18%",  t: "28%",  s: "red"   },
    { n: "Litigation Rate",      y: "9.1%",  b: "8%",   t: "4%",   s: "amber" },
  ], insight: "Subrogation recovery is the primary drag. LAE ratio is a relative strength." },
  { label: "Financial Leakage",     colorKey: "amber",  score: 58, gap: -15, kpis: [
    { n: "Reserve Accuracy",  y: "79%",  b: "85%", t: "93%", s: "red"   },
    { n: "Closure Rate",      y: "68%",  b: "72%", t: "82%", s: "amber" },
    { n: "Reopen Rate",       y: "7.2%", b: "5%",  t: "2%",  s: "red"   },
    { n: "Early Resolution",  y: "28%",  b: "35%", t: "52%", s: "red"   },
  ], insight: "Reserve accuracy and early resolution are major leakage sources. ~$2.1M estimated opportunity." },
  { label: "Quality & Compliance",  colorKey: "forest", score: 83, gap: +6,  kpis: [
    { n: "Audit Score",           y: "87%", b: "82%", t: "93%", s: "green" },
    { n: "SLA Compliance",        y: "91%", b: "85%", t: "96%", s: "green" },
    { n: "Regulatory Violations", y: "0",   b: "2",   t: "0",   s: "green" },
    { n: "Documentation",         y: "88%", b: "84%", t: "95%", s: "green" },
  ], insight: "Clear organisational strength — above benchmark on all four dimensions." },
  { label: "Technology Utilization",colorKey: "navy",   score: 47, gap: -22, kpis: [
    { n: "STP Rate",           y: "14%", b: "22%", t: "38%", s: "red" },
    { n: "Digital Adoption",   y: "42%", b: "60%", t: "78%", s: "red" },
    { n: "AI-Assisted Flags",  y: "18%", b: "40%", t: "68%", s: "red" },
    { n: "Portal Self-Service",y: "22%", b: "35%", t: "58%", s: "red" },
  ], insight: "Largest gap area. Automation lags peers by 15–20pp. Highest ROI modernisation target." },
  { label: "Org. Performance",      colorKey: "rose",   score: 65, gap: -4,  kpis: [
    { n: "Claims/Adjuster",  y: "92",    b: "85",    t: "60",    s: "red"   },
    { n: "Diary Compliance", y: "84%",   b: "88%",   t: "96%",   s: "amber" },
    { n: "Training Hrs/Yr",  y: "24",    b: "28",    t: "45",    s: "amber" },
    { n: "Handle Time",      y: "3.8hr", b: "3.2hr", t: "2.1hr", s: "red"   },
  ], insight: "Adjuster workload above benchmark. Training investment below peers." },
];
