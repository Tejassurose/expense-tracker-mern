const express   = require("express");
const dotenv    = require("dotenv");
const cors      = require("cors");
const connectDB = require("./config/database");

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "kharcha-frontend-git-main-tejas-surose.vercel.app",  // ← your actual Vercel URL
  ],
  credentials: true,
}));
app.use(express.json());

// ── Routes ──────────────────────────────
app.use("/api/auth",         require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "✅ Kharcha API is running!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});