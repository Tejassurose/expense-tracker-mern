import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTransactions } from "../context/TransactionContext";
import { formatCurrency } from "../utils/formatCurrency";
import Sidebar         from "../components/Sidebar";
import TransactionItem from "../components/TransactionItem";
import TransactionForm from "../components/TransactionForm";
import Toast           from "../components/Toast";



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
 const { user }   = useAuth();
  const {
    transactions, addTransaction, updateTransaction, deleteTransaction,
    totalIncome, totalExpense, balance,
    fetchTransactions,            // ← ADD ONLY THIS LINE
  } = useTransactions();

  const [page,    setPage]    = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [toast,   setToast]   = useState(null);
  const [delId,   setDelId]   = useState(null);
  const [filter,  setFilter]  = useState({ type: "all", category: "all", search: "" });

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

  const filtered = transactions
    .filter(t => {
      if (filter.type     !== "all" && t.type     !== filter.type)     return false;
      if (filter.category !== "all" && t.category !== filter.category) return false;
      if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
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
  const maxBar      = Math.max(totalIncome, totalExpense) || 1;

  return (
    <div className="app-layout">
      <Sidebar activePage={page} setActivePage={setPage} />

      <div className="main-content">

        {/* ── HEADER ── */}
        <header className="main-header">
          <h1>
            {page === "dashboard"    && "🏠 Dashboard"}
            {page === "transactions" && "↕️ Transactions"}
            {page === "analytics"    && "📊 Analytics"}
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

            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card balance">
                <div className="sc-label">Net Balance</div>
                <div className="sc-amount" style={{ color: balance >= 0 ? "#86efac" : "#fca5a5" }}>
                  {formatCurrency(balance)}
                </div>
                <div className="sc-sub">{balance >= 0 ? "You're doing great 🎉" : "Spending more than earning"}</div>
              </div>
              <div className="summary-card income">
                <div className="sc-label">Total Income</div>
                <div className="sc-amount" style={{ color: "#86efac" }}>{formatCurrency(totalIncome)}</div>
                <div className="sc-sub">{transactions.filter(t => t.type === "income").length} transactions</div>
              </div>
              <div className="summary-card expense">
                <div className="sc-label">Total Expenses</div>
                <div className="sc-amount" style={{ color: "#fca5a5" }}>{formatCurrency(totalExpense)}</div>
                <div className="sc-sub">{transactions.filter(t => t.type === "expense").length} transactions</div>
              </div>
            </div>

            {/* Savings Rate */}
            <div className="section">
              <div className="section-title">💰 Savings Rate</div>
              <div className="progress-outer">
                <div className="progress-bar" style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }} />
              </div>
              <div className="progress-label">
                {totalIncome
                  ? `You are saving ${savingsRate}% of your income`
                  : "Add income transactions to see your savings rate"}
              </div>
            </div>

            {/* Recent 5 Transactions */}
            <div className="section">
              <div className="section-header">
                <div className="section-title" style={{ margin: 0 }}>🕐 Recent Transactions</div>
                <button className="link-btn" style={{ margin: 0 }} onClick={() => setPage("transactions")}>
                  View all →
                </button>
              </div>
              <div className="tx-list">
                {transactions.length === 0
                  ? <div className="empty-state"><span>💸</span>No transactions yet. Hit + Add!</div>
                  : transactions
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 5)
                      .map(t => (
                        <TransactionItem key={t.id} transaction={t} onEdit={handleEdit} onDelete={handleDelete} />
                      ))
                }
              </div>
            </div>

          </div>
        )}

        {/* ════════════════════════════════
            TRANSACTIONS PAGE
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
            <div className="filters">
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

              {(filter.type !== "all" || filter.category !== "all" || filter.search) && (
                <button className="clear-btn"
                  onClick={() => setFilter({ type: "all", category: "all", search: "" })}>
                  ✕ Clear
                </button>
              )}

              <span className="result-count">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            {/* List */}
            <div className="section">
              <div className="tx-list">
                {filtered.length === 0
                  ? <div className="empty-state"><span>🔍</span>No transactions match your filters</div>
                  : filtered.map(t => (
                      <TransactionItem key={t.id} transaction={t} onEdit={handleEdit} onDelete={handleDelete} />
                    ))
                }
              </div>
            </div>

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
              <div className="section-title">📊 Income vs Expense</div>
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
              <div className="section-title">🗂️ Expense by Category</div>
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