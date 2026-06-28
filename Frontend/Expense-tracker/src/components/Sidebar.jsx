  import { useAuth } from "../context/AuthContext";
  import { useTransactions } from "../context/TransactionContext";
  import { formatCurrency } from "../utils/formatCurrency";

  export default function Sidebar({ activePage, setActivePage }) {
    const { user, logout }              = useAuth();
    const { balance, totalIncome, totalExpense } = useTransactions();

  const navItems = [
    { id: "dashboard",    icon: "🏠", label: "Dashboard"      },
    { id: "transactions", icon: "↕️", label: "Transactions"   },
    { id: "budget",       icon: "🎯", label: "Budget"         },
    { id: "analytics",    icon: "📊", label: "Analytics"      },
    { id: "yearly",       icon: "📅", label: "Yearly Summary" }, 
  ];
    return (
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">₹</div>
          <span className="sidebar-logo-text">Kharcha</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-btn ${activePage === item.id ? "active" : ""}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Mini Stats */}
          <div className="sidebar-balance">
            <div className="sidebar-balance-label">Net Balance</div>
            <div className="sidebar-balance-amount"
              style={{ color: balance >= 0 ? "var(--green)" : "var(--red)" }}>
              {formatCurrency(balance)}
            </div>
          </div>

          <div className="sidebar-mini-stats">
            <div className="sidebar-mini-stat">
              <span style={{ color: "var(--green)", fontSize: 11 }}>↑ Income</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{formatCurrency(totalIncome)}</span>
            </div>
            <div className="sidebar-mini-stat">
              <span style={{ color: "var(--red)", fontSize: 11 }}>↓ Expense</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{formatCurrency(totalExpense)}</span>
            </div>
          </div>

          {/* Logout */}
          <button className="logout-btn" onClick={logout}>
            <span>🚪</span>
            <span>Logout · {user?.name}</span>
          </button>
        </div>
      </aside>
    );
  }
