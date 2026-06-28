
import { useState } from "react";

const PRESETS = [
  { label: "Today",       getDates: () => {
    const d = new Date().toISOString().slice(0,10);
    return { from: d, to: d };
  }},
  { label: "Last 7 Days", getDates: () => {
    const to = new Date();
    const from = new Date(); from.setDate(from.getDate() - 6);
    return { from: from.toISOString().slice(0,10), to: to.toISOString().slice(0,10) };
  }},
  { label: "Last 30 Days", getDates: () => {
    const to = new Date();
    const from = new Date(); from.setDate(from.getDate() - 29);
    return { from: from.toISOString().slice(0,10), to: to.toISOString().slice(0,10) };
  }},
  { label: "This Month", getDates: () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: from.toISOString().slice(0,10), to: to.toISOString().slice(0,10) };
  }},
  { label: "Last Month", getDates: () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to   = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: from.toISOString().slice(0,10), to: to.toISOString().slice(0,10) };
  }},
  { label: "This Year", getDates: () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), 0, 1);
    const to   = new Date(now.getFullYear(), 11, 31);
    return { from: from.toISOString().slice(0,10), to: to.toISOString().slice(0,10) };
  }},
];

export default function DateRangeSearch({ onSearch, onClear, isActive }) {
  const [showPanel, setShowPanel] = useState(false);
  const [from, setFrom] = useState("");
  const [to,   setTo]   = useState("");
  const [activePreset, setActivePreset] = useState(null);

  const applyPreset = (preset) => {
    const { from: f, to: t } = preset.getDates();
    setFrom(f); setTo(t);
    setActivePreset(preset.label);
    onSearch(f, t, preset.label);
    setShowPanel(false);
  };

  const applyCustom = () => {
    if (!from || !to) return;
    if (from > to) {
      alert("'From' date must be before 'To' date");
      return;
    }
    setActivePreset(null);
    onSearch(from, to, `${from} to ${to}`);
    setShowPanel(false);
  };

  const handleClear = () => {
    setFrom(""); setTo(""); setActivePreset(null);
    onClear();
    setShowPanel(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowPanel(!showPanel)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: 10,
          border: `1px solid ${isActive ? "var(--blue)" : "var(--border)"}`,
          background: isActive ? "rgba(59,130,246,0.1)" : "var(--surface)",
          color: isActive ? "var(--blue)" : "var(--text)",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          fontFamily: "inherit",
        }}>
        📆 {isActive ? "Custom Range Active" : "Date Range Search"}
      </button>

      {showPanel && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 16, zIndex: 50,
          boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
          minWidth: 300,
        }}>
          {/* Quick Presets */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase",
              letterSpacing: 0.6, marginBottom: 8, fontWeight: 600 }}>
              Quick Select
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PRESETS.map(p => (
                <button key={p.label}
                  onClick={() => applyPreset(p)}
                  style={{
                    padding: "6px 12px", borderRadius: 8,
                    border: "1px solid",
                    borderColor: activePreset === p.label ? "var(--blue)" : "var(--border)",
                    background: activePreset === p.label ? "rgba(59,130,246,0.12)" : "var(--bg)",
                    color: activePreset === p.label ? "var(--blue)" : "var(--text)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit",
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Range */}
          <div style={{
            borderTop: "1px solid var(--border)", paddingTop: 14,
          }}>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase",
              letterSpacing: 0.6, marginBottom: 8, fontWeight: 600 }}>
              Custom Range
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">From</label>
                <input className="input" type="date"
                  value={from} onChange={e => setFrom(e.target.value)} />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">To</label>
                <input className="input" type="date"
                  value={to} onChange={e => setTo(e.target.value)} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary"
                style={{ flex: 1, padding: "8px", fontSize: 12 }}
                onClick={handleClear}>
                Clear
              </button>
              <button className="btn btn-primary"
                style={{ flex: 1, padding: "8px", fontSize: 12 }}
                disabled={!from || !to}
                onClick={applyCustom}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}