import { useState, useEffect } from "react";

const CATEGORIES = {
  income:  ["Salary", "Freelance", "Investment", "Gift", "Other Income"],
  expense: ["Food", "Transport", "Shopping", "Entertainment", "Health", "Bills", "Education", "Other"],
};

const empty = {
  title: "", amount: "", type: "expense",
  category: "Food", date: new Date().toISOString().slice(0, 10), description: "",
};

export default function TransactionForm({ onSubmit, onCancel, editData }) {
  const [form,   setForm]   = useState(empty);
  const [errors, setErrors] = useState({});

useEffect(() => {
  if (editData) {
    setForm({
      title:       editData.title,
      amount:      String(editData.amount),
      type:        editData.type,
      category:    editData.category,
      date:        editData.date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      description: editData.description || "",
    });
  } else {
    setForm(empty);
  }
}, [editData]);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())                         e.title  = "Title is required";
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) e.amount = "Enter a valid amount";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit({ ...form, amount: +form.amount });
    setForm(empty);
  };

  return (
    <div className="form-card">
      <h3 className="form-title">
        {editData ? "✏️ Edit Transaction" : "➕ New Transaction"}
      </h3>

      <div className="form-grid">

        {/* Type */}
        <div className="input-group">
          <label className="input-label">Type</label>
          <div className="type-toggle">
            <button type="button"
              className={`type-btn income ${form.type === "income" ? "active" : ""}`}
              onClick={() => { set("type", "income"); set("category", "Salary"); }}>
              ↑ Income
            </button>
            <button type="button"
              className={`type-btn expense ${form.type === "expense" ? "active" : ""}`}
              onClick={() => { set("type", "expense"); set("category", "Food"); }}>
              ↓ Expense
            </button>
          </div>
        </div>

        {/* Category */}
        <div className="input-group">
          <label className="input-label">Category</label>
          <select className="input" value={form.category} onChange={e => set("category", e.target.value)}>
            {CATEGORIES[form.type].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Title */}
        <div className="input-group">
          <label className="input-label">Title *</label>
          <input className={`input ${errors.title ? "input-error" : ""}`}
            placeholder="e.g. Monthly Salary"
            value={form.title} onChange={e => set("title", e.target.value)} />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        {/* Amount */}
        <div className="input-group">
          <label className="input-label">Amount (₹) *</label>
          <input className={`input ${errors.amount ? "input-error" : ""}`}
            type="number" placeholder="0"
            value={form.amount} onChange={e => set("amount", e.target.value)} />
          {errors.amount && <span className="error-text">{errors.amount}</span>}
        </div>

        {/* Date */}
        <div className="input-group">
          <label className="input-label">Date</label>
          <input className="input" type="date"
            value={form.date} onChange={e => set("date", e.target.value)} />
        </div>

        {/* Description */}
        <div className="input-group">
          <label className="input-label">Note (optional)</label>
          <input className="input" placeholder="Add a note..."
            value={form.description} onChange={e => set("description", e.target.value)} />
        </div>

      </div>

      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary"   onClick={handleSubmit}>
          {editData ? "Update" : "Add Transaction"}
        </button>
      </div>
    </div>
  );
}