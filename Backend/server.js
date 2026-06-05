const express   = require("express");
const dotenv    = require("dotenv");
const cors      = require("cors");
const connectDB = require("./config/database");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// console.log("auth routes:", require("./routes/authRoutes"));
// console.log("transaction routes:", require("./routes/transactionRoutes"));
// ── Routes ──────────────────────────────
app.use("/api/auth",         require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "✅ Kharcha API is running!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
