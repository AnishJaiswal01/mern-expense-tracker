import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../utils/api';
import {
  setTransactions,
  addTransaction,
  removeTransaction,
  setLoading,
  setError,
} from '../features/transactions/transactionSlice';

const CATEGORIES = [
  'salary', 'freelance', 'investments', 'food', 'transport',
  'housing', 'utilities', 'entertainment', 'healthcare',
  'education', 'shopping', 'other'
];

export default function Transactions() {
  const dispatch = useDispatch();
  const { transactions, selectedMonth, isLoading, error } = useSelector((state) => state.transactions);

  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'food',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const selectedMonthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));

  useEffect(() => {
    // We can fetch on mount to ensure fresh data
    const fetchTrans = async () => {
      dispatch(setLoading(true));
      try {
        const res = await api.get('/transactions');
        dispatch(setTransactions(res.data));
      } catch (err) {
        dispatch(setError('Failed to fetch transactions'));
      }
    };
    fetchTrans();
  }, [dispatch]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(setError(null));
    try {
      const res = await api.post('/transactions', formData);
      dispatch(addTransaction(res.data));
      setFormData({
        ...formData,
        amount: '',
        description: '',
      });
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to add transaction'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        dispatch(removeTransaction(id));
      } catch (err) {
        dispatch(setError('Failed to delete transaction'));
      }
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-primary-300">Transactions</h1>

      {error && (
        <div className="bg-danger-500/10 text-danger-500 p-3 rounded-md border border-danger-500/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ADD TRANSACTION FORM */}
        <div className="bg-surface-light p-6 rounded-2xl shadow-lg border border-surface-lighter lg:col-span-1 h-fit">
          <h3 className="text-xl font-bold mb-6 text-slate-200">Add Transaction</h3>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={onChange}
                className="w-full bg-surface-lighter text-slate-100 rounded-lg px-4 py-2 border border-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={onChange}
                className="w-full bg-surface-lighter text-slate-100 rounded-lg px-4 py-2 border border-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 capitalize"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={onChange}
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                className="w-full bg-surface-lighter text-slate-100 rounded-lg px-4 py-2 border border-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={onChange}
                required
                className="w-full bg-surface-lighter text-slate-100 rounded-lg px-4 py-2 border border-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description (Optional)</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={onChange}
                placeholder="E.g., Groceries"
                className="w-full bg-surface-lighter text-slate-100 rounded-lg px-4 py-2 border border-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg px-4 py-2.5 transition-colors mt-2"
            >
              Add Transaction
            </button>
          </form>
        </div>

        {/* TRANSACTIONS LIST */}
        <div className="bg-surface-light p-6 rounded-2xl shadow-lg border border-surface-lighter lg:col-span-2">
          <h3 className="text-xl font-bold mb-6 text-slate-200">History</h3>
          
          {isLoading && transactions.length === 0 ? (
            <div className="text-slate-400 text-center py-8">Loading...</div>
          ) : selectedMonthTransactions.length === 0 ? (
            <div className="text-slate-500 text-center py-8">No transactions found for this month.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-surface-lighter text-slate-400 text-sm">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium text-right">Amount</th>
                    <th className="pb-3 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-lighter">
                  {selectedMonthTransactions.map(t => (
                    <tr key={t._id} className="hover:bg-surface-lighter/50 transition-colors">
                      <td className="py-4 text-sm text-slate-300 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-slate-200">
                        {t.description || '-'}
                      </td>
                      <td className="py-4 text-sm text-slate-400 capitalize">
                        {t.category}
                      </td>
                      <td className={`py-4 text-right font-bold whitespace-nowrap ${t.type === 'income' ? 'text-success-400' : 'text-danger-400'}`}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                      </td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="text-slate-500 hover:text-danger-400 transition-colors text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
