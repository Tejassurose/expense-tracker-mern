const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    monthlyLimit: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: String, // format: "2026-06"
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// One budget per category per month per user
budgetSchema.index({ category: 1, month: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);