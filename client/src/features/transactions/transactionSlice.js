import { createSlice } from '@reduxjs/toolkit';

const currentDate = new Date();
const currentMonthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

const initialState = {
  transactions: [],
  selectedMonth: currentMonthString, // e.g., '2026-09'
  isLoading: false,
  error: null,
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions(state, action) {
      state.transactions = action.payload;
      state.error = null;
    },
    addTransaction(state, action) {
      state.transactions.unshift(action.payload);
    },
    updateTransaction(state, action) {
      const idx = state.transactions.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) state.transactions[idx] = action.payload;
    },
    removeTransaction(state, action) {
      state.transactions = state.transactions.filter((t) => t._id !== action.payload);
    },
    setSelectedMonth(state, action) {
      state.selectedMonth = action.payload;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setTransactions,
  addTransaction,
  updateTransaction,
  removeTransaction,
  setSelectedMonth,
  setLoading,
  setError,
} = transactionSlice.actions;
export default transactionSlice.reducer;
