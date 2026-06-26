import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../api/axios";

const TransactionContext = createContext(null);

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(false);

  // ── Fetch all transactions ───────────────────────────
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/transactions");
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem("et_token");
    if (token) fetchTransactions();
  }, [fetchTransactions]);

  // ── Add ──────────────────────────────────────────────
  const addTransaction = async (txData) => {
    try {
      const { data } = await API.post("/transactions", txData);
      setTransactions(prev => [data, ...prev]);
      return true;
    } catch (error) {
      console.error("Failed to add:", error);
      return false;
    }
  };

  // ── Update ───────────────────────────────────────────
  const updateTransaction = async (txData) => {
    try {
      const { data } = await API.put(`/transactions/${txData._id}`, txData);
      setTransactions(prev => prev.map(t => t._id === data._id ? data : t));
      return true;
    } catch (error) {
      console.error("Failed to update:", error);
      return false;
    }
  };

  // ── Delete ───────────────────────────────────────────
  const deleteTransaction = async (id) => {
    try {
      await API.delete(`/transactions/${id}`);
      setTransactions(prev => prev.filter(t => t._id !== id));
      return true;
    } catch (error) {
      console.error("Failed to delete:", error);
      return false;
    }
  };

  // Totals
  const totalIncome  = transactions.filter(t => t.type === "income") .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance      = totalIncome - totalExpense;

  return (
    <TransactionContext.Provider value={{
      transactions, loading, fetchTransactions,
      addTransaction, updateTransaction, deleteTransaction,
      totalIncome, totalExpense, balance,
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  return useContext(TransactionContext);
}
