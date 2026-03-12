import { useState } from "react";
import { ArrowRight, ArrowLeft, Car, Home, Truck, Building2, Briefcase, Shield, Globe } from "lucide-react";
import { C, FONT, btnPrimary, btnSecondary, card } from "../constants.js";
import { PageWrap, SectionHead, Tag } from "../components.jsx";

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

export default function Page2({ onNext, onBack, onCarrierInfo, initialData }) {
  const [form, setForm] = useState(initialData && initialData.name ? { ...{ name: "", naic: "", tier: "", lobs: [], type: "baseline" }, ...initialData } : { name: "", naic: "", tier: "", lobs: [], type: "baseline" });
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
