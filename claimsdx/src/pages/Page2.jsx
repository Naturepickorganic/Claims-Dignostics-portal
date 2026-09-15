import { useState, useEffect, useRef } from "react";
import { ArrowRight, ArrowLeft, Car, Home, Truck, Building2, Briefcase, Shield, Globe, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { C, FONT, btnPrimary, btnSecondary, card } from "../constants.js";
import { PageWrap, SectionHead, Tag } from "../components.jsx";
import { getCarrierEconomics } from "../lib/progressDB.js";

const LOBS = [
  { id: "pa",  label: "Personal Auto",     icon: Car,       accent: "#1e3a5f" },
  { id: "ph",  label: "Personal Home",     icon: Home,      accent: "#3730a3" },
  { id: "ca",  label: "Comm. Auto",        icon: Truck,     accent: "#0f766e" },
  { id: "cp",  label: "Comm. Property",    icon: Building2, accent: "#1a4731" },
  { id: "bop", label: "BOP / BIP",         icon: Briefcase, accent: "#92400e" },
  { id: "wc",  label: "Workers Comp",      icon: Shield,    accent: "#9f1239" },
  { id: "gl",  label: "General Liability", icon: Globe,     accent: "#1e3a5f" },
];
const TIERS = [
  { id: 1, label: "Tier 1", desc: "Over $5B DWP"     },
  { id: 2, label: "Tier 2", desc: "$1B – $5B DWP"    },
  { id: 3, label: "Tier 3", desc: "$500M – $1B DWP"  },
];
const ASSESS_TYPES = [
  { id: "baseline", label: "Baseline Assessment", desc: "Full diagnostic across all 5 lenses"  },
  { id: "deepdive", label: "Deep Dive",           desc: "Focused analysis on priority areas"    },
  { id: "targeted", label: "Targeted Review",     desc: "Single lens or LOB deep-dive"         },
];

// ─── Carrier Economics: powers dollar sizing of every recommendation ─────────
const ECO_DEFAULTS = { productiveHours: "1700", loadedFteCost: "85000", rentalCostDay: "45", aleCostDay: "150", costPerCall: "6.50" };
const ECO_GROUPS = [
  { name: "Premium & Portfolio", fields: [
    { id: "dwp",             label: "Direct Written Premium (DWP)", unit: "$M" },
    { id: "nwp",             label: "Net Written Premium (NWP)",    unit: "$M" },
    { id: "dep",             label: "Direct Earned Premium (DEP)",  unit: "$M", priority: true, help: "Drives loss ratio economics" },
    { id: "nep",             label: "Net Earned Premium (NEP)",     unit: "$M" },
    { id: "policiesInForce", label: "Policies in Force",            unit: "count" },
    { id: "policyRetention", label: "Policy Retention Rate",        unit: "%" },
  ]},
  { name: "Claims Volume", fields: [
    { id: "annualClaims",  label: "Annual Claims Volume",  unit: "count", priority: true, help: "The multiplier in every per claim formula" },
    { id: "openInventory", label: "Open Claim Inventory",  unit: "count" },
  ]},
  { name: "Loss & LAE Dollars", fields: [
    { id: "incurredLoss", label: "Incurred Losses (latest year)", unit: "$M" },
    { id: "paidAlae",     label: "ALAE Paid",                     unit: "$M", priority: true, help: "Sizes the DCC value pool" },
    { id: "paidUlae",     label: "ULAE Paid",                     unit: "$M", priority: true, help: "Sizes the handling capacity pool" },
  ]},
  { name: "Recovery Base", fields: [
    { id: "subroRecoverable", label: "Subrogation Recoverable Base", unit: "$M", priority: true, help: "Base for recovery uplift math" },
    { id: "salvageEligible",  label: "Salvage Eligible Base",        unit: "$M" },
  ]},
  { name: "Workforce", fields: [
    { id: "adjusterCount",   label: "Adjuster Headcount",         unit: "FTE", priority: true, help: "Converts hours released to capacity" },
    { id: "loadedFteCost",   label: "Loaded Cost per Adjuster",   unit: "$/yr",   isDefault: true },
    { id: "productiveHours", label: "Productive Hours per FTE",   unit: "hrs/yr", isDefault: true },
  ]},
  { name: "Economic Bridges", fields: [
    { id: "rentalCostDay", label: "Avg Rental Cost per Day",  unit: "$", isDefault: true },
    { id: "aleCostDay",    label: "Avg ALE Cost per Day",     unit: "$", isDefault: true },
    { id: "costPerCall",   label: "Cost per Status Call",     unit: "$", isDefault: true },
  ]},
];
const ECO_ALL = ECO_GROUPS.flatMap(g => g.fields);

export default function Page2({ onNext, onBack, onCarrierInfo, initialData }) {
  const blank = { name: "", naic: "", tier: "", lobs: [], type: "baseline", economics: { ...ECO_DEFAULTS } };
  const [form, setForm] = useState(initialData && initialData.name
    ? { ...blank, ...initialData, economics: { ...ECO_DEFAULTS, ...(initialData.economics || {}) } }
    : blank);
  const [ecoOpen, setEcoOpen] = useState(false);
  const setEco = (id, val) => setForm(f => ({ ...f, economics: { ...f.economics, [id]: val } }));
  const ecoFetched = useRef({});
  const [ecoLoadedFor, setEcoLoadedFor] = useState(null);
  useEffect(() => {
    const naic = form.naic;
    if (!/^\d{5}$/.test(naic) || ecoFetched.current[naic]) return;
    ecoFetched.current[naic] = true;
    getCarrierEconomics(naic).then(({ economics }) => {
      if (!economics) return;
      const hasSaved = Object.values(economics).some(v => String(v).trim() !== "");
      if (!hasSaved) return;
      // Merge saved values over untouched fields only, so typed values are never overwritten
      setForm(f => {
        const merged = { ...f.economics };
        Object.entries(economics).forEach(([k, v]) => {
          const cur = String(merged[k] ?? "").trim();
          const isDefault = cur === "" || cur === (ECO_DEFAULTS[k] ?? "__none__");
          if (String(v).trim() !== "" && isDefault) merged[k] = v;
        });
        return { ...f, economics: merged };
      });
      setEcoLoadedFor(naic);
    }).catch(() => {});
  }, [form.naic]);

  const ecoFilled = ECO_ALL.filter(fd => String(form.economics?.[fd.id] ?? "").trim() !== "").length;
  const prioFilled = ECO_ALL.filter(fd => fd.priority && String(form.economics?.[fd.id] ?? "").trim() !== "").length;
  const prioTotal  = ECO_ALL.filter(fd => fd.priority).length;
  const [errors, setErrors] = useState({});

  const toggle = id => setForm(f => ({
    ...f, lobs: f.lobs.includes(id) ? f.lobs.filter(x => x !== id) : [...f.lobs, id],
  }));

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 3) e.name = "Carrier name must be at least 3 characters";
    if (!/^\d{5}$/.test(form.naic)) e.naic = "NAIC code must be exactly 5 digits";
    if (!form.tier) e.tier = "Please select a tier";
    if (!form.lobs.length) e.lobs = "Select at least one line of business";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleNext = () => {
    if (!validate()) return;
    onCarrierInfo?.(form);
    onNext();
  };

  const inp = hasErr => ({
    width: "100%", padding: "10px 14px",
    border: "1.5px solid " + (hasErr ? "#fca5a5" : "#d8ebe2"),
    borderRadius: 6, fontSize: 14, fontFamily: FONT.sans,
    color: C.text, background: "white", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s",
  });

  const errMsg = msg => (
    <div style={{ fontSize: 12, color: "#991b1b", marginTop: 5, fontFamily: FONT.sans }}>{msg}</div>
  );

  return (
    <PageWrap maxWidth={740}>
      <SectionHead tag="Step 1 of 4" title="P&C Insurer Details"
        subtitle="Tell us about your organisation to personalise the assessment benchmarks." />

      {/* Organisation details */}
      <div style={{ ...card, padding: "32px 32px", marginBottom: 20 }}>
        <div style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>Organisation Details</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <label style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 6 }}>Carrier Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Acme Insurance Company" style={inp(errors.name)} />
            {errors.name && errMsg(errors.name)}
          </div>
          <div>
            <label style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 6 }}>NAIC Code *</label>
            <input value={form.naic} onChange={e => setForm({ ...form, naic: e.target.value })}
              placeholder="12345" maxLength={5} style={inp(errors.naic)} />
            {errors.naic && errMsg(errors.naic)}
          </div>
        </div>
      </div>

      {/* Tier */}
      <div style={{ ...card, padding: "28px 32px", marginBottom: 20 }}>
        <div style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Premium Tier *</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {TIERS.map(t => (
            <button key={t.id} onClick={() => setForm({ ...form, tier: t.id })} style={{
              padding: "16px 14px", borderRadius: 6, cursor: "pointer", textAlign: "left",
              border: "1.5px solid " + (form.tier === t.id ? "#1a4731" : "#d8ebe2"),
              background: form.tier === t.id ? "#f0f7f3" : "white",
              transition: "all 0.15s",
            }}>
              <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 14, color: form.tier === t.id ? "#1a4731" : C.text, marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: C.textSoft }}>{t.desc}</div>
            </button>
          ))}
        </div>
        {errors.tier && errMsg(errors.tier)}
      </div>

      {/* LOBs */}
      <div style={{ ...card, padding: "28px 32px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Lines of Business *</div>
          {form.lobs.length > 0 && <span style={{ fontSize: 12, color: "#1a4731", fontWeight: 600 }}>{form.lobs.length} selected</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px,1fr))", gap: 8 }}>
          {LOBS.map(l => {
            const sel = form.lobs.includes(l.id);
            const Icon = l.icon;
            return (
              <button key={l.id} onClick={() => toggle(l.id)} style={{
                padding: "12px 14px", borderRadius: 6, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
                border: "1.5px solid " + (sel ? l.accent : "#d8ebe2"),
                background: sel ? l.accent + "0d" : "white",
                transition: "all 0.15s",
              }}>
                <Icon size={16} color={sel ? l.accent : C.textMuted} strokeWidth={1.5} />
                <span style={{ fontSize: 13, fontWeight: sel ? 600 : 400, color: sel ? l.accent : C.textMid, fontFamily: FONT.sans }}>{l.label}</span>
              </button>
            );
          })}
        </div>
        {errors.lobs && errMsg(errors.lobs)}
      </div>

      {/* Assessment type */}
      <div style={{ ...card, padding: "28px 32px", marginBottom: 36 }}>
        <div style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Assessment Type</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {ASSESS_TYPES.map(t => (
            <button key={t.id} onClick={() => setForm({ ...form, type: t.id })} style={{
              padding: "16px 14px", borderRadius: 6, cursor: "pointer", textAlign: "left",
              border: "1.5px solid " + (form.type === t.id ? "#1a4731" : "#d8ebe2"),
              background: form.type === t.id ? "#f0f7f3" : "white",
              transition: "all 0.15s",
            }}>
              <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 13, color: form.type === t.id ? "#1a4731" : C.text, marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.5 }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Carrier Economics — optional, powers dollar sizing */}
      <div style={{ ...card, padding: 0, marginBottom: 22, overflow: "hidden" }}>
        <button onClick={() => setEcoOpen(o => !o)} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", background: ecoOpen ? "#f0f7f3" : "white", border: "none", cursor: "pointer",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 6, background: "#1a4731", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign size={15} color="white" />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: FONT.sans, fontSize: 13.5, fontWeight: 700, color: C.text }}>Carrier Economics <span style={{ fontWeight: 400, color: C.textMuted, fontSize: 11.5 }}>(optional, unlocks dollar sizing of recommendations)</span></div>
              <div style={{ fontFamily: FONT.sans, fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                {ecoFilled} of {ECO_ALL.length} provided · Priority fields {prioFilled} of {prioTotal}{ecoLoadedFor ? ` · saved values loaded for NAIC ${ecoLoadedFor}` : " · every blank lowers sizing confidence"}
              </div>
            </div>
          </div>
          {ecoOpen ? <ChevronUp size={16} color={C.textMuted} /> : <ChevronDown size={16} color={C.textMuted} />}
        </button>
        {ecoOpen && (
          <div style={{ padding: "4px 18px 16px" }}>
            {ECO_GROUPS.map(g => (
              <div key={g.name} style={{ marginTop: 12 }}>
                <div style={{ fontFamily: FONT.sans, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#2d6a4f", marginBottom: 8 }}>{g.name}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(215px, 1fr))", gap: 10 }}>
                  {g.fields.map(fd => (
                    <div key={fd.id}>
                      <label style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: C.textMid, display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                        {fd.label}
                        {fd.priority && <span style={{ fontSize: 8.5, fontWeight: 800, color: "#92400e", background: "#fef3c7", borderRadius: 3, padding: "1px 5px", letterSpacing: "0.04em" }}>PRIORITY</span>}
                      </label>
                      <div style={{ position: "relative" }}>
                        <input value={form.economics?.[fd.id] ?? ""} onChange={e => setEco(fd.id, e.target.value)}
                          inputMode="decimal" placeholder="—"
                          style={{ width: "100%", padding: "8px 44px 8px 10px", border: "1.5px solid " + (String(form.economics?.[fd.id] ?? "").trim() ? "#c3ddd0" : "#e2e8f0"), borderRadius: 6, fontSize: 12.5, fontFamily: FONT.sans, boxSizing: "border-box" }} />
                        <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: C.textMuted, fontFamily: FONT.sans }}>{fd.unit}</span>
                      </div>
                      {(fd.help || fd.isDefault) && (
                        <div style={{ fontFamily: FONT.sans, fontSize: 9.5, color: fd.isDefault ? "#92400e" : C.textMuted, marginTop: 3 }}>
                          {fd.isDefault ? "Industry default, edit to your actuals" : fd.help}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onBack} style={{ ...btnSecondary, borderRadius: 6 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={handleNext} style={{ ...btnPrimary, borderRadius: 6 }}>
          Continue <ArrowRight size={14} />
        </button>
      </div>
    </PageWrap>
  );
}
