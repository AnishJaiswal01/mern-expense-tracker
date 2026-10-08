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
import BillScanModal from '../components/BillScanModal';
import { useCurrency } from '../context/CurrencyContext';

const CATEGORIES = [
  'salary', 'freelance', 'investments', 'food', 'transport',
  'housing', 'utilities', 'entertainment', 'healthcare',
  'education', 'shopping', 'other'
];

export default function Transactions() {
  const dispatch = useDispatch();
  const { currency, currencySymbol, formatAmount, convertBetween } = useCurrency();
  const { transactions, selectedMonth, isLoading, error } = useSelector((state) => state.transactions);

  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'food',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [showScanModal, setShowScanModal] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const selectedMonthTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));

  useEffect(() => {
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
      // If user is viewing in INR, convert input INR to base USD before saving so storage remains consistent
      const inputAmount = parseFloat(formData.amount);
      const amountToSave = currency === 'INR' ? convertBetween(inputAmount, 'INR', 'USD') : inputAmount;

      const payload = {
        ...formData,
        amount: parseFloat(amountToSave.toFixed(2)),
      };

      const res = await api.post('/transactions', payload);
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

  // Called when user confirms the scanned bill data - throws on error so modal can show it inline
  const handleBillConfirm = async (scannedData) => {
    dispatch(setError(null));
    setScanSuccess(false);
    const res = await api.post('/transactions', scannedData);
    dispatch(addTransaction(res.data));
    setScanSuccess(true);
    setTimeout(() => setScanSuccess(false), 4000);
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary-400">Transactions</h1>
        <span className="text-xs font-semibold px-3 py-1 bg-surface-light border border-surface-lighter rounded-full text-slate-400">
          Viewing in: <strong className="text-primary-400">{currency} ({currencySymbol})</strong>
        </span>
      </div>

      {error && (
        <div className="bg-danger-500/10 text-danger-500 p-3.5 rounded-xl border border-danger-500/20 font-medium text-sm">
          {error}
        </div>
      )}

      {scanSuccess && (
        <div className="bg-success-500/10 text-success-500 p-3.5 rounded-xl border border-success-500/20 flex items-center gap-2 font-medium text-sm">
          <span>✅</span> Bill scanned and transaction saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ADD TRANSACTION FORM */}
        <div className="bg-surface-light p-6 rounded-2xl shadow-lg border border-surface-lighter lg:col-span-1 h-fit transition-all duration-200">
          <h3 className="text-xl font-bold mb-4 text-slate-200">Add Transaction</h3>

          {/* Scan Bill Button */}
          <button
            type="button"
            className="scan-bill-trigger"
            onClick={() => setShowScanModal(true)}
            id="scan-bill-btn"
          >
            <span>📸</span> Scan Bill with AI
          </button>
          <div className="scan-bill-divider">or enter manually</div>

          <form onSubmit={onSubmit} className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={onChange}
                className="w-full bg-surface-lighter text-slate-100 rounded-lg px-4 py-2 border border-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 cursor-pointer"
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
                className="w-full bg-surface-lighter text-slate-100 rounded-lg px-4 py-2 border border-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 capitalize cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Amount ({currencySymbol} {currency})
              </label>
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
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg px-4 py-2.5 transition-colors mt-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              Add Transaction
            </button>
          </form>
        </div>

        {/* TRANSACTIONS LIST */}
        <div className="bg-surface-light p-6 rounded-2xl shadow-lg border border-surface-lighter lg:col-span-2 transition-all duration-200">
          <h3 className="text-xl font-bold mb-6 text-slate-200">History</h3>

          {isLoading && transactions.length === 0 ? (
            <div className="text-slate-400 text-center py-8">Loading...</div>
          ) : selectedMonthTransactions.length === 0 ? (
            <div className="text-slate-400 text-center py-8">No transactions found for this month.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-surface-lighter text-slate-400 text-sm">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium text-right">Amount ({currencySymbol})</th>
                    <th className="pb-3 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-lighter">
                  {selectedMonthTransactions.map((t) => (
                    <tr key={t._id} className="hover:bg-surface-lighter/50 transition-colors">
                      <td className="py-4 text-sm text-slate-300 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-slate-200 font-medium">{t.description || '-'}</td>
                      <td className="py-4 text-sm text-slate-400 capitalize">{t.category}</td>
                      <td
                        className={`py-4 text-right font-bold whitespace-nowrap ${
                          t.type === 'income' ? 'text-success-400' : 'text-danger-400'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}
                      </td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="text-slate-400 hover:text-danger-400 transition-colors text-sm font-medium cursor-pointer p-1.5 rounded-md hover:bg-danger-500/10"
                          title="Delete transaction"
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

      {/* Bill Scan Modal */}
      {showScanModal && (
        <BillScanModal
          onClose={() => setShowScanModal(false)}
          onConfirm={handleBillConfirm}
        />
      )}
    </div>
  );
}