import { useState } from "react";
import { formatCurrency } from "../utils/formatCurrency";

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

export default function YearlySummary({ transactions }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Build monthly breakdown for selected year
  const monthlyData = MONTHS.map((name, i) => {
    const monthTxns = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === i && d.getFullYear() === year;
    });
    const income  = monthTxns.filter(t => t.type === "income").reduce((s,t)=>s+t.amount,0);
    const expense = monthTxns.filter(t => t.type === "expense").reduce((s,t)=>s+t.amount,0);
    return { name, income, expense, balance: income - expense, count: monthTxns.length };
  });

  const totalIncome  = monthlyData.reduce((s,m) => s + m.income, 0);
  const totalExpense = monthlyData.reduce((s,m) => s + m.expense, 0);
  const totalBalance = totalIncome - totalExpense;

  const activeMonths = monthlyData.filter(m => m.count > 0);
  const bestMonth  = activeMonths.length
    ? activeMonths.reduce((a,b) => a.balance > b.balance ? a : b)
    : null;
  const worstMonth = activeMonths.length
    ? activeMonths.reduce((a,b) => a.balance < b.balance ? a : b)
    : null;
  const avgMonthlyExpense = activeMonths.length
    ? totalExpense / activeMonths.length
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Year Selector */}
      <div style={{ display: "flex", gap: 8 }}>
        {yearOptions.map(y => (
          <button key={y}
            onClick={() => setYear(y)}
            style={{
              padding: "8px 18px", borderRadius: 10,
              border: "1px solid",
              borderColor: y === year ? "var(--blue)" : "var(--border)",
              background: y === year ? "rgba(59,130,246,0.12)" : "var(--surface)",
              color: y === year ? "var(--blue)" : "var(--text)",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit",
            }}>
            {y}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card balance">
          <div className="sc-label">{year} Net Balance</div>
          <div className="sc-amount" style={{ color: totalBalance >= 0 ? "#86efac" : "#fca5a5" }}>
            {formatCurrency(totalBalance)}
          </div>
          <div className="sc-sub">{activeMonths.length} active months</div>
        </div>
        <div className="summary-card income">
          <div className="sc-label">{year} Total Income</div>
          <div className="sc-amount" style={{ color: "#86efac" }}>{formatCurrency(totalIncome)}</div>
          <div className="sc-sub">avg {formatCurrency(totalIncome / (activeMonths.length || 1))}/month</div>
        </div>
        <div className="summary-card expense">
          <div className="sc-label">{year} Total Expense</div>
          <div className="sc-amount" style={{ color: "#fca5a5" }}>{formatCurrency(totalExpense)}</div>
          <div className="sc-sub">avg {formatCurrency(avgMonthlyExpense)}/month</div>
        </div>
      </div>

      {/* Best/Worst Month */}
      {bestMonth && worstMonth && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{
            background: "rgba(74,222,128,0.06)",
            border: "1px solid rgba(74,222,128,0.2)",
            borderRadius: 12, padding: 16,
          }}>
            <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 600, marginBottom: 6 }}>
              🏆 Best Month
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{bestMonth.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
              Saved {formatCurrency(bestMonth.balance)}
            </div>
          </div>
          <div style={{
            background: "rgba(248,113,113,0.06)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 12, padding: 16,
          }}>
            <div style={{ fontSize: 12, color: "var(--red)", fontWeight: 600, marginBottom: 6 }}>
              ⚠️ Needs Attention
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{worstMonth.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
              {worstMonth.balance >= 0 ? "Saved" : "Overspent"} {formatCurrency(Math.abs(worstMonth.balance))}
            </div>
          </div>
        </div>
      )}

      {/* Month by Month Table */}
      <div className="section">
        <div className="section-title">📅 Month-by-Month Breakdown</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Month","Income","Expense","Balance","Transactions"].map(h => (
                  <th key={h} style={{
                    padding: "8px 12px", textAlign: h === "Month" ? "left" : "right",
                    color: "var(--muted)", fontWeight: 600, fontSize: 11,
                    textTransform: "uppercase", letterSpacing: 0.5,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyData.map(m => (
                <tr key={m.name} style={{
                  borderBottom: "1px solid var(--border)",
                  opacity: m.count === 0 ? 0.4 : 1,
                }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{m.name}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--green)" }}>
                    {m.income > 0 ? formatCurrency(m.income) : "—"}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--red)" }}>
                    {m.expense > 0 ? formatCurrency(m.expense) : "—"}
                  </td>
                  <td style={{
                    padding: "10px 12px", textAlign: "right", fontWeight: 700,
                    color: m.balance >= 0 ? "var(--green)" : "var(--red)",
                  }}>
                    {m.count > 0 ? formatCurrency(m.balance) : "—"}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--muted)" }}>
                    {m.count}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid var(--border)" }}>
                <td style={{ padding: "10px 12px", fontWeight: 700 }}>Total</td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "var(--green)" }}>
                  {formatCurrency(totalIncome)}
                </td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "var(--red)" }}>
                  {formatCurrency(totalExpense)}
                </td>
                <td style={{
                  padding: "10px 12px", textAlign: "right", fontWeight: 700,
                  color: totalBalance >= 0 ? "var(--green)" : "var(--red)",
                }}>
                  {formatCurrency(totalBalance)}
                </td>
                <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--muted)" }}>
                  {monthlyData.reduce((s,m)=>s+m.count,0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}