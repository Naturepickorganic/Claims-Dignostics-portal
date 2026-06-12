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
  { colorKey: "teal",   title: "Process Efficiency",    desc: "FNOL to closure flow, cycle time drivers, decision frameworks",    badge: "Cycle Time"   },
  { colorKey: "amber",  title: "Financial Leakage",     desc: "Subrogation recovery, medical bill accuracy, litigation impact",    badge: "Loss Ratio"   },
  { colorKey: "forest", title: "Quality & Compliance",  desc: "Documentation standards, regulatory adherence, quality monitoring", badge: "Audit Score"  },
  { colorKey: "navy",   title: "Technology Utilization",desc: "Systems, automation, and data to support efficient outcomes",       badge: "Automation %" },
  { colorKey: "rose",   title: "Org. Performance",      desc: "People, roles, productivity, skills, and performance management",   badge: "Adj. Ratio"   },
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

// ─── METRICS_DATA — tier-specific benchmarks ──────────────────────────────────
// Format: [name, unit, higherIsBetter, {t1:{indMin,indMax,bicMin,bicMax}, t2:{...}, t3:{...}}, desc]
// T1 = Over $5B DWP | T2 = $1B–$5B DWP | T3 = $500M–$1B DWP
// indMin/indMax = industry standard range | bicMin/bicMax = best-in-class range
export const METRICS_DATA = {
  "Cost Efficiency": [
    ["Avg Claim Cycle Time","days",false,{
      t1:{indMin:20,indMax:30,bicMin:12,bicMax:18},
      t2:{indMin:25,indMax:38,bicMin:16,bicMax:22},
      t3:{indMin:30,indMax:45,bicMin:20,bicMax:28},
    },"End-to-end time FNOL to closure"],
    ["LAE Ratio","%",false,{
      t1:{indMin:8, indMax:11,bicMin:5, bicMax:8 },
      t2:{indMin:9, indMax:13,bicMin:6, bicMax:9 },
      t3:{indMin:10,indMax:15,bicMin:7, bicMax:10},
    },"Loss Adjustment Expense as pct of earned premium"],
    ["Subrogation Recovery","%",true,{
      t1:{indMin:22,indMax:30,bicMin:32,bicMax:42},
      t2:{indMin:16,indMax:24,bicMin:26,bicMax:34},
      t3:{indMin:12,indMax:20,bicMin:20,bicMax:28},
    },"Pct of recoverable subrogation collected"],
    ["Litigation Rate","%",false,{
      t1:{indMin:5, indMax:8, bicMin:2, bicMax:4 },
      t2:{indMin:6, indMax:10,bicMin:3, bicMax:5 },
      t3:{indMin:8, indMax:12,bicMin:4, bicMax:6 },
    },"Pct of claims with legal representation"],
    ["Medical Bill Penetration","%",true,{
      t1:{indMin:75,indMax:88,bicMin:88,bicMax:95},
      t2:{indMin:68,indMax:82,bicMin:82,bicMax:92},
      t3:{indMin:60,indMax:75,bicMin:75,bicMax:88},
    },"Pct of medical bills reviewed or repriced"],
    ["Salvage Recovery Rate","%",true,{
      t1:{indMin:58,indMax:72,bicMin:72,bicMax:82},
      t2:{indMin:52,indMax:66,bicMin:66,bicMax:78},
      t3:{indMin:45,indMax:60,bicMin:60,bicMax:72},
    },"Pct of salvage value recovered"],
    ["Vendor Invoice Leakage","%",false,{
      t1:{indMin:3, indMax:5, bicMin:1,  bicMax:2.5},
      t2:{indMin:4, indMax:6, bicMin:1.5,bicMax:3.5},
      t3:{indMin:5, indMax:8, bicMin:2,  bicMax:4  },
    },"Overbilling rate on vendor invoices"],
    ["Defense Cost per Claim","$K",false,{
      t1:{indMin:8, indMax:13,bicMin:4,bicMax:7 },
      t2:{indMin:10,indMax:15,bicMin:5,bicMax:9 },
      t3:{indMin:12,indMax:18,bicMin:6,bicMax:10},
    },"Avg legal defense spend per litigated claim"],
  ],
  "Claim Effectiveness": [
    ["Reserve Accuracy","%",true,{
      t1:{indMin:87,indMax:94,bicMin:94,bicMax:98},
      t2:{indMin:83,indMax:91,bicMin:91,bicMax:96},
      t3:{indMin:78,indMax:88,bicMin:88,bicMax:94},
    },"Pct of reserves within 10 pct of final settlement"],
    ["Claims Closure Rate","%",true,{
      t1:{indMin:75,indMax:85,bicMin:85,bicMax:92},
      t2:{indMin:70,indMax:82,bicMin:82,bicMax:90},
      t3:{indMin:65,indMax:78,bicMin:78,bicMax:88},
    },"Pct of claims closed within policy period"],
    ["Re-open Rate","%",false,{
      t1:{indMin:3, indMax:6, bicMin:1,  bicMax:2.5},
      t2:{indMin:4, indMax:7, bicMin:1.5,bicMax:3  },
      t3:{indMin:5, indMax:8, bicMin:2,  bicMax:4  },
    },"Pct of closed claims reopened within 90 days"],
    ["Severity Trend YoY","%",false,{
      t1:{indMin:2,indMax:5,bicMin:0,bicMax:2},
      t2:{indMin:3,indMax:6,bicMin:1,bicMax:3},
      t3:{indMin:4,indMax:8,bicMin:1.5,bicMax:4},
    },"Year-over-year change in avg claim cost"],
    ["Early Resolution Rate","%",true,{
      t1:{indMin:40,indMax:55,bicMin:55,bicMax:68},
      t2:{indMin:32,indMax:48,bicMin:48,bicMax:62},
      t3:{indMin:25,indMax:40,bicMin:40,bicMax:55},
    },"Pct of claims settled within 30 days"],
    ["3P Acceptance Rate","%",true,{
      t1:{indMin:72,indMax:82,bicMin:82,bicMax:90},
      t2:{indMin:66,indMax:78,bicMin:78,bicMax:88},
      t3:{indMin:60,indMax:72,bicMin:72,bicMax:84},
    },"Pct of valid 3P claims accepted within SLA"],
    ["BI Closure Rate","%",true,{
      t1:{indMin:58,indMax:70,bicMin:70,bicMax:80},
      t2:{indMin:52,indMax:65,bicMin:65,bicMax:76},
      t3:{indMin:45,indMax:60,bicMin:60,bicMax:72},
    },"Pct of BI claims closed within 12 months"],
    ["SIU Referral Quality","%",true,{
      t1:{indMin:68,indMax:82,bicMin:82,bicMax:90},
      t2:{indMin:62,indMax:78,bicMin:78,bicMax:88},
      t3:{indMin:55,indMax:72,bicMin:72,bicMax:84},
    },"Pct of SIU referrals confirmed fraudulent"],
  ],
  "Customer Experience": [
    ["Claimant CSAT","/10",true,{
      t1:{indMin:8.5,indMax:9.2,bicMin:9.2,bicMax:9.7},
      t2:{indMin:8.0,indMax:8.8,bicMin:8.8,bicMax:9.4},
      t3:{indMin:7.5,indMax:8.5,bicMin:8.5,bicMax:9.2},
    },"Post-claim customer satisfaction score"],
    ["Claimant NPS","pts",true,{
      t1:{indMin:48,indMax:65,bicMin:65,bicMax:75},
      t2:{indMin:42,indMax:58,bicMin:58,bicMax:70},
      t3:{indMin:35,indMax:52,bicMin:52,bicMax:65},
    },"Net Promoter Score from claimant surveys"],
    ["Days to 1st Contact","days",false,{
      t1:{indMin:0.5,indMax:1.5,bicMin:0.25,bicMax:0.5},
      t2:{indMin:1,  indMax:2,  bicMin:0.5, bicMax:1  },
      t3:{indMin:1.5,indMax:3,  bicMin:0.75,bicMax:1.5},
    },"Days from FNOL to first adjuster contact"],
    ["Digital Adoption Rate","%",true,{
      t1:{indMin:65,indMax:80,bicMin:80,bicMax:90},
      t2:{indMin:55,indMax:72,bicMin:72,bicMax:85},
      t3:{indMin:42,indMax:62,bicMin:62,bicMax:78},
    },"Pct of claims with digital touchpoint engagement"],
    ["Complaint Ratio","p1K",false,{
      t1:{indMin:1.5,indMax:2.5,bicMin:0.5,bicMax:1.2},
      t2:{indMin:2,  indMax:3,  bicMin:0.8,bicMax:1.8},
      t3:{indMin:2.5,indMax:4,  bicMin:1,  bicMax:2  },
    },"DoI complaints per 1,000 claims"],
    ["Days to Acknowledgement","days",false,{
      t1:{indMin:0.5,indMax:1.5,bicMin:0.25,bicMax:0.5},
      t2:{indMin:1,  indMax:2,  bicMin:0.5, bicMax:1  },
      t3:{indMin:1.5,indMax:3,  bicMin:0.75,bicMax:1.5},
    },"Days from FNOL to formal acknowledgement"],
    ["Portal Self-Service","%",true,{
      t1:{indMin:42,indMax:62,bicMin:62,bicMax:75},
      t2:{indMin:32,indMax:52,bicMin:52,bicMax:68},
      t3:{indMin:22,indMax:42,bicMin:42,bicMax:60},
    },"Pct of claimants using self-service portal"],
    ["Communication Score","/5",true,{
      t1:{indMin:4.0,indMax:4.6,bicMin:4.6,bicMax:5.0},
      t2:{indMin:3.7,indMax:4.3,bicMin:4.3,bicMax:4.8},
      t3:{indMin:3.4,indMax:4.0,bicMin:4.0,bicMax:4.6},
    },"Claimant rating of proactive communication"],
  ],
  "Adjuster Productivity": [
    ["Open Claims per Adj","#",false,{
      t1:{indMin:55,indMax:75, bicMin:35,bicMax:52},
      t2:{indMin:65,indMax:88, bicMin:45,bicMax:62},
      t3:{indMin:78,indMax:105,bicMin:55,bicMax:75},
    },"Current open inventory per FTE adjuster"],
    ["Touchpoints per Claim","#",false,{
      t1:{indMin:4.5,indMax:6.5,bicMin:2.8,bicMax:4.0},
      t2:{indMin:5.5,indMax:7.5,bicMin:3.5,bicMax:5.0},
      t3:{indMin:6.5,indMax:9.0,bicMin:4.5,bicMax:6.0},
    },"Avg adjuster interactions per claim lifecycle"],
    ["STP Rate","%",true,{
      t1:{indMin:30,indMax:50,bicMin:55,bicMax:72},
      t2:{indMin:20,indMax:38,bicMin:42,bicMax:58},
      t3:{indMin:12,indMax:28,bicMin:30,bicMax:45},
    },"Straight-through processing rate"],
    ["Complex Claim Pct","%",false,{
      t1:{indMin:10,indMax:15,bicMin:5, bicMax:9 },
      t2:{indMin:12,indMax:18,bicMin:6, bicMax:11},
      t3:{indMin:15,indMax:22,bicMin:8, bicMax:13},
    },"Pct of claims requiring supervisor review"],
    ["Avg Handle Time","hrs",false,{
      t1:{indMin:2.2,indMax:3.5,bicMin:1.2,bicMax:2.0},
      t2:{indMin:2.8,indMax:4.2,bicMin:1.5,bicMax:2.5},
      t3:{indMin:3.5,indMax:5.5,bicMin:2.0,bicMax:3.2},
    },"Avg adjuster hours per claim"],
    ["New Claim Setup Time","mins",false,{
      t1:{indMin:12,indMax:20,bicMin:6, bicMax:11},
      t2:{indMin:16,indMax:25,bicMin:8, bicMax:14},
      t3:{indMin:20,indMax:32,bicMin:10,bicMax:18},
    },"Time to complete initial claim setup"],
    ["Diary Compliance Rate","%",true,{
      t1:{indMin:90,indMax:96,bicMin:96,bicMax:99},
      t2:{indMin:86,indMax:93,bicMin:93,bicMax:97},
      t3:{indMin:82,indMax:90,bicMin:90,bicMax:96},
    },"Pct of diary actions completed on time"],
    ["Training Hours/Year","hrs",true,{
      t1:{indMin:32,indMax:48,bicMin:50,bicMax:65},
      t2:{indMin:26,indMax:40,bicMin:42,bicMax:55},
      t3:{indMin:20,indMax:34,bicMin:36,bicMax:48},
    },"Annual CE and skills training per FTE"],
  ],
  "Fraud Prevention": [
    ["SIU Referral Rate","%",true,{
      t1:{indMin:4,indMax:6,bicMin:6,bicMax:8},
      t2:{indMin:3,indMax:5,bicMin:5,bicMax:7},
      t3:{indMin:2,indMax:4,bicMin:4,bicMax:6},
    },"Pct of claims referred to SIU"],
    ["Fraud Detection Rate","%",true,{
      t1:{indMin:15,indMax:22,bicMin:22,bicMax:30},
      t2:{indMin:12,indMax:18,bicMin:18,bicMax:25},
      t3:{indMin:8, indMax:15,bicMin:15,bicMax:22},
    },"Pct of investigated claims confirmed fraudulent"],
    ["Fraud Recovery Rate","%",true,{
      t1:{indMin:68,indMax:80,bicMin:80,bicMax:88},
      t2:{indMin:62,indMax:75,bicMin:75,bicMax:84},
      t3:{indMin:55,indMax:70,bicMin:70,bicMax:80},
    },"Pct of fraud losses recovered"],
    ["Days to Detect Fraud","days",false,{
      t1:{indMin:28,indMax:40,bicMin:15,bicMax:25},
      t2:{indMin:35,indMax:50,bicMin:20,bicMax:32},
      t3:{indMin:45,indMax:65,bicMin:28,bicMax:40},
    },"Avg days from claim open to fraud confirmed"],
    ["AI-Assisted Flag Rate","%",true,{
      t1:{indMin:48,indMax:68,bicMin:68,bicMax:82},
      t2:{indMin:35,indMax:55,bicMin:58,bicMax:75},
      t3:{indMin:22,indMax:42,bicMin:45,bicMax:62},
    },"Pct of SIU referrals from predictive models"],
    ["Soft Fraud Rate","%",false,{
      t1:{indMin:4, indMax:7, bicMin:1.5,bicMax:3.5},
      t2:{indMin:6, indMax:9, bicMin:2,  bicMax:4.5},
      t3:{indMin:8, indMax:12,bicMin:3,  bicMax:6  },
    },"Pct of claims with inflated damages identified"],
    ["Ring Detection Rate","%",true,{
      t1:{indMin:28,indMax:42,bicMin:45,bicMax:58},
      t2:{indMin:20,indMax:35,bicMin:38,bicMax:52},
      t3:{indMin:14,indMax:28,bicMin:30,bicMax:45},
    },"Pct of fraud rings detected via link analysis"],
    ["Cost per Fraud Case","$K",false,{
      t1:{indMin:2.8,indMax:4.5,bicMin:1.5,bicMax:2.5},
      t2:{indMin:3.5,indMax:5.5,bicMin:2.0,bicMax:3.2},
      t3:{indMin:4.5,indMax:7.0,bicMin:2.5,bicMax:4.0},
    },"Avg cost to investigate and resolve fraud case"],
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
