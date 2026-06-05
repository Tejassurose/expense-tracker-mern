import { formatCurrency, formatDate } from "../utils/formatCurrency";

const ICONS = {
  Salary: "💼", Freelance: "💻", Investment: "📈", Gift: "🎁",
  "Other Income": "💰", Food: "🍔", Transport: "🚗", Shopping: "🛍️",
  Entertainment: "🎬", Health: "💊", Bills: "📄", Education: "📚",
  Other: "📦",
};

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const { title, amount, type, category, date, description } = transaction;

  return (
    <div className="tx-item">

      {/* Icon */}
      <div className={`tx-icon ${type}`}>
        {ICONS[category] || "📦"}
      </div>

      {/* Info */}
      <div className="tx-info">
        <div className="tx-title">{title}</div>
        <div className="tx-meta">
          {category} · {formatDate(date)}
          {description && ` · ${description}`}
        </div>
      </div>

      {/* Amount */}
      <div className={`tx-amount ${type}`}>
        {type === "income" ? "+" : "-"}{formatCurrency(amount)}
      </div>

      {/* Actions */}
      <div className="tx-actions">
        <button className="icon-btn" onClick={() => onEdit(transaction)} title="Edit">
          ✏️
        </button>
        <button className="icon-btn" onClick={() => onDelete(transaction.id)} title="Delete">
          🗑️
        </button>
      </div>

    </div>
  );
}