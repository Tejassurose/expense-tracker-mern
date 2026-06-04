# 💸 Expense Tracker — MERN Stack

A full-stack expense tracking web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Users can register, log in, and manage their income and expenses with a clean dashboard, filters, and transaction history.

---

## 🚀 Live Demo



---

## 📸 Screenshots


---

## ✨ Features

- 🔐 User Registration & Login (JWT Authentication)
- 🔒 Protected Routes — only logged-in users can access the dashboard
- ➕ Add Income & Expense transactions
- ✏️ Edit existing transactions
- 🗑️ Delete transactions
- 🔍 Filter transactions by type and category
- 📊 View total Balance, Income, and Expense summary
- 📅 Transaction history sorted by date
- 📱 Responsive UI

---

## 🛠️ Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React.js (Vite) | UI Framework |
| React Router | Client-side routing |
| Axios | HTTP requests |
| Context API | Global state management |
| CSS / Tailwind | Styling |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| dotenv | Environment variables |

### Database
| Tool | Purpose |
|------|---------|
| MongoDB Atlas | Cloud database |
| Mongoose | ODM for MongoDB |

---

## 📁 Folder Structure

```
expense-tracker-mern/
│
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Register, Login logic
│   │   └── transactionController.js
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verification
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── Transaction.js       # Transaction schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── transactionRoutes.js
│   ├── .env                     # ⚠️ Never commit this!
│   ├── .env.example             # Safe env template
│   └── server.js                # Entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js         # Axios instance
│   │   ├── components/          # Reusable components
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
├── .gitignore
├── .env.example
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/expense-tracker-mern.git
cd expense-tracker-mern
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `/backend`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_key
```

Start the backend server:

```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔌 API Endpoints

### Auth Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user, get token | ❌ |

### Transaction Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/transactions` | Get all user transactions | ✅ |
| POST | `/api/transactions` | Add new transaction | ✅ |
| PUT | `/api/transactions/:id` | Update transaction | ✅ |
| DELETE | `/api/transactions/:id` | Delete transaction | ✅ |

---

## 🗄️ Database Design

### User Collection
```json
{
  "name": "String (required)",
  "email": "String (required, unique)",
  "password": "String (hashed with bcrypt)",
  "createdAt": "Date (auto)"
}
```

### Transaction Collection
```json
{
  "title": "String (required)",
  "amount": "Number (required)",
  "type": "String (income | expense)",
  "category": "String",
  "date": "Date",
  "description": "String",
  "userId": "ObjectId → ref: User"
}
```

---

## 🌿 Git Branch Strategy

```
main          → production-ready code only
dev           → active development branch
feature/auth  → authentication feature
feature/transactions → transaction CRUD
feature/dashboard    → frontend dashboard
```

---

## 🚢 Deployment

| Part | Platform |
|------|----------|
| Database | MongoDB Atlas |
| Backend | Render / Railway |
| Frontend | Vercel / Netlify |

---

## 📝 Environment Variables

Create a `.env` file (never commit it). Use `.env.example` as a template:

```env
PORT=5000
MONGO_URI=
JWT_SECRET=
```

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@your_username](https://github.com/Tejassurose)


