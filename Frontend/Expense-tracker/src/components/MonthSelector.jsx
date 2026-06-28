import { useState } from "react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function MonthSelector({ selectedMonth, selectedYear, onChange }) {
  const [showPicker, setShowPicker] = useState(false);

  const goPrev = () => {
    let m = selectedMonth - 1;
    let y = selectedYear;
    if (m < 0) { m = 11; y -= 1; }
    onChange(m, y);
  };

  const goNext = () => {
    let m = selectedMonth + 1;
    let y = selectedYear;
    if (m > 11) { m = 0; y += 1; }
    onChange(m, y);
  };

  const goToday = () => {
    const now = new Date();
    onChange(now.getMonth(), now.getFullYear());
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
  };

  const isFuture = () => {
    const now = new Date();
    return selectedYear > now.getFullYear() ||
      (selectedYear === now.getFullYear() && selectedMonth > now.getMonth());
  };

  // Generate year options (current year - 5 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "8px 10px",
      }}>
        <button
          onClick={goPrev}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 16, color: "var(--muted)", padding: "4px 8px",
            borderRadius: 6, transition: "background 0.15s",
          }}
          onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.05)"}
          onMouseLeave={e => e.target.style.background = "none"}
        >
          ←
        </button>

        <button
          onClick={() => setShowPicker(!showPicker)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 700, color: "var(--text)",
            padding: "4px 12px", minWidth: 140, textAlign: "center",
            fontFamily: "inherit",
          }}
        >
          📅 {MONTHS[selectedMonth]} {selectedYear}
        </button>

        <button
          onClick={goNext}
          disabled={isFuture()}
          style={{
            background: "none", border: "none",
            cursor: isFuture() ? "not-allowed" : "pointer",
            fontSize: 16, color: isFuture() ? "var(--border)" : "var(--muted)",
            padding: "4px 8px", borderRadius: 6, transition: "background 0.15s",
          }}
          onMouseEnter={e => !isFuture() && (e.target.style.background = "rgba(255,255,255,0.05)")}
          onMouseLeave={e => e.target.style.background = "none"}
        >
          →
        </button>

        {!isCurrentMonth() && (
          <button
            onClick={goToday}
            style={{
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: 7, padding: "5px 10px",
              fontSize: 11, fontWeight: 600, color: "var(--blue)",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Today
          </button>
        )}
      </div>

      {/* Quick Month/Year Picker Dropdown */}
      {showPicker && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 10, padding: 14, zIndex: 50,
          boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
          minWidth: 280,
        }}>
          {/* Year Selector */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {yearOptions.map(y => (
              <button key={y}
                onClick={() => onChange(selectedMonth, y)}
                style={{
                  padding: "5px 12px", borderRadius: 7,
                  border: "1px solid",
                  borderColor: y === selectedYear ? "var(--blue)" : "var(--border)",
                  background: y === selectedYear ? "rgba(59,130,246,0.12)" : "transparent",
                  color: y === selectedYear ? "var(--blue)" : "var(--muted)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit",
                }}>
                {y}
              </button>
            ))}
          </div>

          {/* Month Grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6,
          }}>
            {MONTHS.map((m, i) => {
              const isSelected = i === selectedMonth;
              const isFutureMonth = selectedYear === currentYear && i > new Date().getMonth();
              return (
                <button key={m}
                  disabled={isFutureMonth}
                  onClick={() => { onChange(i, selectedYear); setShowPicker(false); }}
                  style={{
                    padding: "8px 4px", borderRadius: 7,
                    border: "1px solid",
                    borderColor: isSelected ? "var(--blue)" : "var(--border)",
                    background: isSelected ? "rgba(59,130,246,0.12)" : "transparent",
                    color: isFutureMonth ? "var(--border)" : isSelected ? "var(--blue)" : "var(--text)",
                    fontSize: 12, fontWeight: 600,
                    cursor: isFutureMonth ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}>
                  {m.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}