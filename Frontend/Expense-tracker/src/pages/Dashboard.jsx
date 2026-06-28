import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTransactions } from "../context/TransactionContext";
import { formatCurrency } from "../utils/formatCurrency";
import Sidebar            from "../components/Sidebar";
import TransactionItem     from "../components/TransactionItem";
import TransactionForm     from "../components/TransactionForm";
import Toast               from "../components/Toast";
import MonthSelector       from "../components/MonthSelector";
import DateRangeSearch     from "../components/DateRangeSearch";
import MonthlyComparison   from "../components/MonthlyComparison";
import YearlySummary       from "../components/YearlySummary";
import BudgetPage          from "../components/BudgetPage";

const CATEGORY_ICONS = {
  Salary:"💼", Freelance:"💻", Investment:"📈", Gift:"🎁", "Other Income":"💰",
  Food:"🍔", Transport:"🚗", Shopping:"🛍️", Entertainment:"🎬",
  Health:"💊", Bills:"📄", Education:"📚", Other:"📦",
};

const ALL_CATS = [
  "Salary","Freelance","Investment","Gift","Other Income",
  "Food","Transport","Shopping","Entertainment","Health","Bills","Education","Other",
];

export default function Dashboard() {
  const { user } = useAuth();
  const {
    transactions, addTransaction, updateTransaction, deleteTransaction,
    totalIncome, totalExpense, balance,
    fetchTransactions,
  } = useTransactions();

  const [page,     setPage]     = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [toast,    setToast]    = useState(null);
  const [delId,    setDelId]    = useState(null);
  const [filter,   setFilter]   = useState({ type: "all", category: "all", search: "" });

  // ── Dashboard Month / Date Range State ────────────────
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear,  setSelectedYear]  = useState(now.getFullYear());
  const [dateRange,     setDateRange]     = useState(null); // { from, to, label }

  // ── Transactions Page Date Range (separate state) ─────
  const [txDateRange, setTxDateRange] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const notify = (message, type = "success") => setToast({ message, type });

  const handleSubmit = async (data) => {
    if (editData) {
      await updateTransaction({ ...data, _id: editData._id });
      notify("Transaction updated!");
    } else {
      await addTransaction(data);
      notify("Transaction added! 🎉");
    }
    setShowForm(false);
    setEditData(null);
  };

  const handleEdit = (t) => {
    setEditData(t);
    setShowForm(true);
    setPage("transactions");
  };

  const handleDelete  = (id) => setDelId(id);
  const confirmDelete = async () => {
    await deleteTransaction(delId);
    setDelId(null);
    notify("Transaction deleted", "error");
  };

  const openForm = () => { setEditData(null); setShowForm(true); };

  // ── Dashboard Month / Date Range Handlers ─────────────
  const handleMonthChange = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setDateRange(null); // clear custom range when picking a month
  };

  const handleDateSearch = (from, to, label) => {
    setDateRange({ from, to, label });
  };

  const handleClearSearch = () => {
    setDateRange(null);
  };

  // ── Transactions Page Date Range Handlers ─────────────
  const handleTxDateSearch = (from, to, label) => {
    setTxDateRange({ from, to, label });
  };

  const handleTxDateClear = () => {
    setTxDateRange(null);
  };

  // ── Filtered by Month or Date Range (for Dashboard page) ──
 const monthFilteredTransactions = dateRange
  ? transactions.filter(t => {
      const txDate = t.date.slice(0, 10); // normalize to YYYY-MM-DD
      return txDate >= dateRange.from && txDate <= dateRange.to;
    })
  : transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

  const monthIncome  = monthFilteredTransactions.filter(t => t.type === "income").reduce((s,t)=>s+t.amount,0);
  const monthExpense = monthFilteredTransactions.filter(t => t.type === "expense").reduce((s,t)=>s+t.amount,0);
  const monthBalance = monthIncome - monthExpense;

  // ── Filtered by search/type/category/date (for Transactions page) ──
 const filtered = transactions
  .filter(t => {
    if (filter.type     !== "all" && t.type     !== filter.type)     return false;
    if (filter.category !== "all" && t.category !== filter.category) return false;
    if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
    if (txDateRange) {
      const txDate = t.date.slice(0, 10);
      if (txDate < txDateRange.from || txDate > txDateRange.to) return false;
    }
    return true;
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));
  const byCategory = ALL_CATS
    .map(cat => ({
      cat,
      amount: transactions.filter(t => t.type === "expense" && t.category === cat)
                          .reduce((s, t) => s + t.amount, 0),
    }))
    .filter(x => x.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const savingsRate = totalIncome ? Math.round((balance / totalIncome) * 100) : 0;
  const maxBar       = Math.max(totalIncome, totalExpense) || 1;

  return (
    <div className="app-layout">
      <Sidebar activePage={page} setActivePage={setPage} />

      <div className="main-content">

        {/* ── HEADER ── */}
        <header className="main-header">
          <h1>
            {page === "dashboard"    && "🏠 Dashboard"}
            {page === "transactions" && "↕️ Transactions"}
            {page === "budget"       && "🎯 Budget Limits"}
            {page === "analytics"    && "📊 Analytics"}
            {page === "yearly"       && "📅 Yearly Summary"}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="header-user">
              <div className="header-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <span>{user?.name}</span>
            </div>
            <button className="btn btn-primary" onClick={openForm}>+ Add</button>
          </div>
        </header>

        {/* ════════════════════════════════
            DASHBOARD PAGE
        ════════════════════════════════ */}
        {page === "dashboard" && (
          <div className="page-content">

            {/* Month Navigation + Custom Date Search */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: 10,
            }}>
              <MonthSelector
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onChange={handleMonthChange}
              />
              <DateRangeSearch
                onSearch={handleDateSearch}
                onClear={handleClearSearch}
                isActive={!!dateRange}
              />
            </div>

            {dateRange && (
              <div style={{
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 10, padding: "8px 14px",
                fontSize: 13, color: "var(--blue)",
              }}>
                📆 Showing: {dateRange.label} ({monthFilteredTransactions.length} transactions)
              </div>
            )}

            {/* Summary Cards — filtered by month/range */}
            <div className="summary-cards">
              <div className="summary-card balance">
                <div className="sc-label">
                  {dateRange ? "Selected Range" : "This Month"} Balance
                </div>
                <div className="sc-amount" style={{ color: monthBalance >= 0 ? "#86efac" : "#fca5a5" }}>
                  {formatCurrency(monthBalance)}
                </div>
                <div className="sc-sub">
                  {monthBalance >= 0 ? "You're doing great 🎉" : "Spending more than earning"}
                </div>
              </div>
              <div className="summary-card income">
                <div className="sc-label">Income</div>
                <div className="sc-amount" style={{ color: "#86efac" }}>{formatCurrency(monthIncome)}</div>
                <div className="sc-sub">
                  {monthFilteredTransactions.filter(t => t.type === "income").length} transactions
                </div>
              </div>
              <div className="summary-card expense">
                <div className="sc-label">Expenses</div>
                <div className="sc-amount" style={{ color: "#fca5a5" }}>{formatCurrency(monthExpense)}</div>
                <div className="sc-sub">
                  {monthFilteredTransactions.filter(t => t.type === "expense").length} transactions
                </div>
              </div>
            </div>

            {/* Monthly Comparison Chart */}
            <div className="section">
              <div className="section-title">📊 Last 6 Months Comparison</div>
              <MonthlyComparison transactions={transactions} monthsToShow={6} />
            </div>

            {/* Transactions for selected month/range */}
            <div className="section">
              <div className="section-header">
                <div className="section-title" style={{ margin: 0 }}>
                  🕐 {dateRange ? "Filtered" : "Month"} Transactions
                </div>
                <button className="link-btn" style={{ margin: 0 }} onClick={() => setPage("transactions")}>
                  View all →
                </button>
              </div>
              <div className="tx-list">
                {monthFilteredTransactions.length === 0
                  ? <div className="empty-state"><span>📭</span>No transactions in this period</div>
                  : monthFilteredTransactions
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 8)
                      .map(t => (
                        <TransactionItem key={t._id} transaction={t} onEdit={handleEdit} onDelete={handleDelete} />
                      ))
                }
              </div>
            </div>

          </div>
        )}

        {/* ════════════════════════════════
            TRANSACTIONS PAGE (all-time, with filters)
        ════════════════════════════════ */}
        {page === "transactions" && (
          <div className="page-content">

            {showForm && (
              <TransactionForm
                editData={editData}
                onSubmit={handleSubmit}
                onCancel={() => { setShowForm(false); setEditData(null); }}
              />
            )}

            {/* Filters */}
            <div className="filters" style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <input className="filter-input" placeholder="🔍 Search title..."
                  style={{ width: 190 }}
                  value={filter.search}
                  onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} />

                <select className="filter-input" value={filter.type}
                  onChange={e => setFilter(f => ({ ...f, type: e.target.value, category: "all" }))}>
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>

                <select className="filter-input" value={filter.category}
                  onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}>
                  <option value="all">All Categories</option>
                  {ALL_CATS.map(c => <option key={c}>{c}</option>)}
                </select>

                {(filter.type !== "all" || filter.category !== "all" || filter.search || txDateRange) && (
                  <button className="clear-btn"
                    onClick={() => { setFilter({ type: "all", category: "all", search: "" }); setTxDateRange(null); }}>
                    ✕ Clear All
                  </button>
                )}
              </div>

              <DateRangeSearch
                onSearch={handleTxDateSearch}
                onClear={handleTxDateClear}
                isActive={!!txDateRange}
              />
            </div>

            {txDateRange && (
              <div style={{
                background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 10, padding: "8px 14px", fontSize: 13, color: "var(--blue)",
              }}>
                📆 Filtering by: {txDateRange.label}
              </div>
            )}

            <div className="result-count">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>

            {/* List */}
            <div className="section">
              <div className="tx-list">
                {filtered.length === 0
                  ? <div className="empty-state"><span>🔍</span>No transactions match your filters</div>
                  : filtered.map(t => (
                      <TransactionItem key={t._id} transaction={t} onEdit={handleEdit} onDelete={handleDelete} />
                    ))
                }
              </div>
            </div>

          </div>
        )}

        {/* ════════════════════════════════
            BUDGET PAGE
        ════════════════════════════════ */}
        {page === "budget" && (
          <div className="page-content">
            <BudgetPage />
          </div>
        )}

        {/* ════════════════════════════════
            ANALYTICS PAGE
        ════════════════════════════════ */}
        {page === "analytics" && (
          <div className="page-content">

            {/* Stat Cards */}
            <div className="stat-cards">
              <div className="stat-card">
                <div className="stat-label">Savings Rate</div>
                <div className="stat-value" style={{ color: savingsRate >= 0 ? "var(--green)" : "var(--red)" }}>
                  {savingsRate}%
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Transactions</div>
                <div className="stat-value">{transactions.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Biggest Expense</div>
                <div className="stat-value" style={{ color: "var(--red)" }}>
                  {formatCurrency(Math.max(0, ...transactions.filter(t => t.type === "expense").map(t => t.amount)))}
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="section">
              <div className="section-title">📊 Income vs Expense (All Time)</div>
              <div className="bar-chart">
                {[
                  { label: "Income",  amount: totalIncome,          color: "var(--green)" },
                  { label: "Expense", amount: totalExpense,         color: "var(--red)"   },
                  { label: "Savings", amount: Math.max(0, balance), color: "#60a5fa"      },
                ].map(({ label, amount, color }) => (
                  <div className="bar-block" key={label}>
                    <div className="bar-outer">
                      <div className="bar-fill"
                        style={{ height: `${Math.round((amount / maxBar) * 100)}%`, background: color }} />
                    </div>
                    <div className="bar-label" style={{ color }}>{label}</div>
                    <div className="bar-amount">{formatCurrency(amount)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="section">
              <div className="section-title">🗂️ Expense by Category (All Time)</div>
              {byCategory.length === 0
                ? <div className="empty-state"><span>📊</span>No expense data yet</div>
                : byCategory.map(({ cat, amount }) => (
                    <div className="cat-row" key={cat}>
                      <div className="cat-left">
                        <span>{CATEGORY_ICONS[cat]}</span>
                        <span className="cat-name">{cat}</span>
                      </div>
                      <div className="cat-bar-wrap">
                        <div className="cat-bar"
                          style={{ width: `${Math.round((amount / totalExpense) * 100)}%` }} />
                      </div>
                      <div className="cat-amt">{formatCurrency(amount)}</div>
                      <div className="cat-pct">{Math.round((amount / totalExpense) * 100)}%</div>
                    </div>
                  ))
              }
            </div>

          </div>
        )}

        {/* ════════════════════════════════
            YEARLY SUMMARY PAGE
        ════════════════════════════════ */}
        {page === "yearly" && (
          <div className="page-content">
            <YearlySummary transactions={transactions} />
          </div>
        )}

      </div>

      {/* ── DELETE CONFIRM ── */}
      {delId && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-title">Delete Transaction?</div>
            <div className="modal-sub">This action cannot be undone.</div>
            <div className="modal-btns">
              <button className="btn btn-secondary" onClick={() => setDelId(null)}>Cancel</button>
              <button className="btn btn-danger"    onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

    </div>
  );
}