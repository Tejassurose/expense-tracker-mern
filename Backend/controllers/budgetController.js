const Budget      = require("../models/Budget");
const Transaction = require("../models/Transaction");

const currentMonth = () => new Date().toISOString().slice(0, 7); // "2026-06"

// ── GET BUDGETS FOR A MONTH ──────────────────────────
// GET /api/budgets?month=2026-06
const getBudgets = async (req, res) => {
  try {
    const month = req.query.month || currentMonth();

    const budgets = await Budget.find({
      userId: req.user._id,
      month,
    });

    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── SET/UPDATE BUDGET ─────────────────────────────────
// POST /api/budgets
const setBudget = async (req, res) => {
  try {
    const { category, monthlyLimit, month } = req.body;

    if (!category || monthlyLimit == null) {
      return res.status(400).json({ message: "Category and limit are required" });
    }

    const budget = await Budget.findOneAndUpdate(
      { category, month: month || currentMonth(), userId: req.user._id },
      { monthlyLimit },
      { upsert: true, new: true }
    );

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE BUDGET ─────────────────────────────────────
const deleteBudget = async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: "Budget deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET BUDGET STATUS (spent vs limit) ───────────────
// GET /api/budgets/status?month=2026-06
const getBudgetStatus = async (req, res) => {
  try {
    const month = req.query.month || currentMonth();
    const [year, monthNum] = month.split("-").map(Number);

    const budgets = await Budget.find({ userId: req.user._id, month });

    // Get start/end dates for the month
    const startDate = `${month}-01`;
    const lastDay   = new Date(year, monthNum, 0).getDate();
    const endDate   = `${month}-${String(lastDay).padStart(2, "0")}`;

    const transactions = await Transaction.find({
      userId: req.user._id,
      type: "expense",
      date: { $gte: startDate, $lte: endDate },
    });

    const status = budgets.map(b => {
      const spent = transactions
        .filter(t => t.category === b.category)
        .reduce((s, t) => s + t.amount, 0);
      const pct = b.monthlyLimit ? Math.round((spent / b.monthlyLimit) * 100) : 0;

      return {
        _id:          b._id,
        category:     b.category,
        monthlyLimit: b.monthlyLimit,
        spent,
        remaining:    Math.max(0, b.monthlyLimit - spent),
        pct,
        isOverBudget: spent > b.monthlyLimit,
        isNearLimit:  pct >= 80 && pct < 100,
      };
    });

    res.json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBudgets, setBudget, deleteBudget, getBudgetStatus };