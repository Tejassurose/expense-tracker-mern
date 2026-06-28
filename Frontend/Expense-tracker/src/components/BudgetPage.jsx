import { useState, useEffect } from "react";
import API from "../api/axios";
import { formatCurrency } from "../utils/formatCurrency";
import Toast from "./Toast";

const ALL_CATS = [
  "Food","Transport","Shopping","Entertainment","Health","Bills","Education","Other",
];

const CATEGORY_ICONS = {
  Food:"🍔", Transport:"🚗", Shopping:"🛍️", Entertainment:"🎬",
  Health:"💊", Bills:"📄", Education:"📚", Other:"📦",
};

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

export default function BudgetPage() {
  const now = new Date();
  const [month, setMonth]       = useState(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`);
  const [status, setStatus]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ category: "Food", monthlyLimit: "" });
  const [toast, setToast]       = useState(null);

  const notify = (msg, type = "success") => setToast({ message: msg, type });

  useEffect(() => {
    fetchStatus();
  }, [month]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/budgets/status?month=${month}`);
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetBudget = async () => {
    if (!form.monthlyLimit || +form.monthlyLimit <= 0) {
      notify("Please enter a valid amount", "error");
      return;
    }
    try {
      await API.post("/budgets", {
        category: form.category,
        monthlyLimit: +form.monthlyLimit,
        month,
      });
      notify(`Budget set for ${form.category}! 🎯`);
      setShowForm(false);
      setForm({ category: "Food", monthlyLimit: "" });
      fetchStatus();
    } catch (err) {
      notify("Failed to set budget", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/budgets/${id}`);
      notify("Budget removed", "error");
      fetchStatus();
    } catch (err) {
      console.error(err);
    }
  };

  // Month navigation
  const changeMonth = (delta) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
  };

  const [year, monthNum] = month.split("-").map(Number);
  const monthLabel = `${MONTHS[monthNum - 1]} ${year}`;

  const budgetedCategories = status.map(s => s.category);
  const availableCategories = ALL_CATS.filter(c => !budgetedCategories.includes(c));

  const totalLimit = status.reduce((s, b) => s + b.monthlyLimit, 0);
  const totalSpent = status.reduce((s, b) => s + b.spent, 0);
  const overBudgetCount = status.filter(b => b.isOverBudget).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>🎯 Budget Limits</h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", marginTop: 3 }}>
            Set spending limits per category
          </p>
        </div>

        {/* Month Nav */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "8px 10px",
        }}>
          <button onClick={() => changeMonth(-1)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--muted)" }}>←</button>
          <span style={{ fontSize: 14, fontWeight: 700, minWidth: 140, textAlign: "center" }}>
            📅 {monthLabel}
          </span>
          <button onClick={() => changeMonth(1)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--muted)" }}>→</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card total" style={{ background: "linear-gradient(135deg,#1e3a5f,#1a2f4e)" }}>
          <div className="sc-label">Total Budget</div>
          <div className="sc-amount" style={{ color: "#93c5fd" }}>{formatCurrency(totalLimit)}</div>
          <div className="sc-sub">{status.length} categories budgeted</div>
        </div>
        <div className="summary-card" style={{ background: "linear-gradient(135deg,#7f1d1d,#991b1b)" }}>
          <div className="sc-label">Total Spent</div>
          <div className="sc-amount" style={{ color: "#fca5a5" }}>{formatCurrency(totalSpent)}</div>
          <div className="sc-sub">
            {totalLimit ? Math.round((totalSpent/totalLimit)*100) : 0}% of total budget used
          </div>
        </div>
        <div className="summary-card" style={{
          background: overBudgetCount > 0
            ? "linear-gradient(135deg,#7f1d1d,#991b1b)"
            : "linear-gradient(135deg,#14532d,#166534)",
        }}>
          <div className="sc-label">Over Budget</div>
          <div className="sc-amount" style={{ color: overBudgetCount > 0 ? "#fca5a5" : "#86efac" }}>
            {overBudgetCount}
          </div>
          <div className="sc-sub">
            {overBudgetCount > 0 ? "categories need attention" : "all on track! 🎉"}
          </div>
        </div>
      </div>

      {/* Add Budget Form */}
      {showForm ? (
        <div className="form-card">
          <h3 className="form-title">🎯 Set New Budget</h3>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">Category</label>
              <select className="input" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {availableCategories.length === 0
                  ? <option>All categories budgeted</option>
                  : availableCategories.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Monthly Limit (₹)</label>
              <input className="input" type="number" min="1" placeholder="e.g. 5000"
                value={form.monthlyLimit}
                onChange={e => setForm(f => ({ ...f, monthlyLimit: e.target.value }))} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary"
              disabled={availableCategories.length === 0}
              onClick={handleSetBudget}>
              Set Budget
            </button>
          </div>
        </div>
      ) : (
        <button className="btn btn-primary" style={{ alignSelf: "flex-start" }}
          onClick={() => setShowForm(true)}
          disabled={availableCategories.length === 0}>
          + Set New Budget
        </button>
      )}

      {/* Budget Cards */}
      <div className="section">
        <div className="section-title">📊 Category Budgets — {monthLabel}</div>

        {loading ? (
          <div className="empty-state"><span className="spinner" /></div>
        ) : status.length === 0 ? (
          <div className="empty-state">
            <span>🎯</span>
            No budgets set for this month. Click "+ Set New Budget" to start!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {status.map(b => {
              const barColor = b.isOverBudget ? "var(--red)" : b.isNearLimit ? "var(--yellow)" : "var(--green)";
              return (
                <div key={b._id} style={{
                  background: "var(--card)",
                  border: `1px solid ${b.isOverBudget ? "rgba(248,113,113,0.3)" : "var(--border)"}`,
                  borderRadius: 12, padding: 16,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{CATEGORY_ICONS[b.category]}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{b.category}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          {formatCurrency(b.spent)} of {formatCurrency(b.monthlyLimit)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {b.isOverBudget && (
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: "var(--red)",
                          background: "rgba(248,113,113,0.1)",
                          border: "1px solid rgba(248,113,113,0.25)",
                          borderRadius: 99, padding: "3px 10px",
                        }}>
                          ⚠️ Over by {formatCurrency(b.spent - b.monthlyLimit)}
                        </span>
                      )}
                      {!b.isOverBudget && b.isNearLimit && (
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: "var(--yellow)",
                          background: "rgba(251,191,36,0.1)",
                          border: "1px solid rgba(251,191,36,0.25)",
                          borderRadius: 99, padding: "3px 10px",
                        }}>
                          ⚡ Near limit
                        </span>
                      )}
                      {!b.isOverBudget && !b.isNearLimit && (
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: "var(--green)",
                          background: "rgba(74,222,128,0.1)",
                          border: "1px solid rgba(74,222,128,0.25)",
                          borderRadius: 99, padding: "3px 10px",
                        }}>
                          ✅ On track
                        </span>
                      )}
                      <button onClick={() => handleDelete(b._id)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--muted)" }}>
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="progress-outer">
                    <div className="progress-bar" style={{
                      width: `${Math.min(100, b.pct)}%`,
                      background: barColor,
                    }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{b.pct}% used</span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>
                      {formatCurrency(b.remaining)} remaining
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

    </div>
  );
}