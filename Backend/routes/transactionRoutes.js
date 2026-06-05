const express = require("express");
const router  = express.Router();

const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

const { protect } = require("../middleware/authMiddleware");

router.get("/",       protect, getTransactions);  // ← GET uses getTransactions
router.post("/",      protect, addTransaction);   // ← POST uses addTransaction
router.put("/:id",    protect, updateTransaction);
router.delete("/:id", protect, deleteTransaction);

module.exports = router;