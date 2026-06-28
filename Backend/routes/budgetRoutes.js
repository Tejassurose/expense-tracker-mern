const express = require("express");
const router  = express.Router();
const {
  getBudgets, setBudget, deleteBudget, getBudgetStatus
} = require("../controllers/budgetController");
const { protect } = require("../middleware/authMiddleware");

router.get("/",        protect, getBudgets);
router.post("/",       protect, setBudget);
router.get("/status",  protect, getBudgetStatus);
router.delete("/:id",  protect, deleteBudget);

module.exports = router;