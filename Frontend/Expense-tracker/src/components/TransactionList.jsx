import { formatCurrency, formatDate } from "../utils/formatCurrency";

const ICONS = {
  Salary: "💼", Freelance: "💻", Investment: "📈", Gift: "🎁", "Other Income": "💰",
  Food: "🍔", Transport: "🚗", Shopping: "🛍️", Entertainment: "🎬",
  Health: "💊", Bills: "📄", Education: "📚", Other: "📦",
};

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const { title, amount, type, category, date, description } = transaction;

  return (
    <div className="tx-item">
      <div className={`tx-icon ${type}`}>
        {ICONS[category] || "📦"}
      </div>
      <div className="tx-info">
        <div className="tx-title">{title}</div>
        <div className="tx-meta">
          <span className={`badge badge-${type}`}>{category}</span>
          &nbsp;· {formatDate(date)}
          {description && <> · <span style={{ fontStyle: "italic" }}>{description}</span></>}
        </div>
      </div>
      <div className={`tx-amount ${type}`}>
        {type === "income" ? "+" : "−"}{formatCurrency(amount)}
      </div>
      <div className="tx-actions">
        <button className="icon-btn" onClick={() => onEdit(transaction)} title="Edit">✏️</button>
        <button className="icon-btn" onClick={() => onDelete(transaction.id)} title="Delete">🗑️</button>
      </div>
    </div>
  );
}