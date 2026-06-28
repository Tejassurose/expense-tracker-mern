import { formatCurrency } from "../utils/formatCurrency";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function MonthlyComparison({ transactions, monthsToShow = 6 }) {
  // Build last N months data
  const now = new Date();
  const months = [];
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ month: d.getMonth(), year: d.getFullYear() });
  }

  const data = months.map(({ month, year }) => {
    const monthTxns = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    const income  = monthTxns.filter(t => t.type === "income").reduce((s,t)=>s+t.amount,0);
    const expense = monthTxns.filter(t => t.type === "expense").reduce((s,t)=>s+t.amount,0);
    return {
      label: `${MONTHS_SHORT[month]} ${String(year).slice(2)}`,
      income, expense,
      isCurrentMonth: month === now.getMonth() && year === now.getFullYear(),
    };
  });

  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1);

  return (
    <div>
      <div style={{
        display: "flex", gap: 16, marginBottom: 16,
        fontSize: 12, color: "var(--muted)",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--green)" }} />
          Income
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--red)" }} />
          Expense
        </span>
      </div>

      <div style={{
        display: "flex", gap: 12, alignItems: "flex-end",
        height: 180, overflowX: "auto", paddingBottom: 4,
      }}>
        {data.map(({ label, income, expense, isCurrentMonth }) => (
          <div key={label} style={{
            flex: 1, minWidth: 60,
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 6,
          }}>
            {/* Bars */}
            <div style={{
              display: "flex", gap: 3, alignItems: "flex-end",
              height: 140, width: "100%", justifyContent: "center",
            }}>
              <div style={{
                width: 14, borderRadius: "4px 4px 0 0",
                height: `${(income / maxVal) * 100}%`,
                background: "var(--green)",
                transition: "height 0.5s",
                minHeight: income > 0 ? 4 : 0,
              }} title={`Income: ${formatCurrency(income)}`} />
              <div style={{
                width: 14, borderRadius: "4px 4px 0 0",
                height: `${(expense / maxVal) * 100}%`,
                background: "var(--red)",
                transition: "height 0.5s",
                minHeight: expense > 0 ? 4 : 0,
              }} title={`Expense: ${formatCurrency(expense)}`} />
            </div>

            {/* Label */}
            <div style={{
              fontSize: 11, fontWeight: isCurrentMonth ? 700 : 500,
              color: isCurrentMonth ? "var(--blue)" : "var(--muted)",
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}