import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../utils/api';
import { setTransactions, setLoading, setError } from '../features/transactions/transactionSlice';

const COLORS = ['#6366f1', '#4ade80', '#f87171', '#fbbf24', '#38bdf8', '#c084fc', '#f472b6', '#a3e635'];

export default function Dashboard() {
  const dispatch = useDispatch();
  const { transactions, selectedMonth, isLoading, error } = useSelector((state) => state.transactions);


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

  if (isLoading && transactions.length === 0) {
    return <div className="p-8 text-center text-slate-400">Loading dashboard...</div>;
  }

  const selectedMonthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));

  const totalIncome = selectedMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = selectedMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Category breakdown for expenses
  const expensesByCategory = selectedMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    
  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  return (
    <div className="p-6 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-primary-300">Dashboard</h1>
      
      {error && <div className="text-danger-400">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-light p-6 rounded-2xl shadow-lg border border-surface-lighter">
          <h3 className="text-slate-400 text-sm font-medium">Total Balance</h3>
          <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-slate-100' : 'text-danger-400'}`}>
            ${balance.toFixed(2)}
          </p>
        </div>
        <div className="bg-surface-light p-6 rounded-2xl shadow-lg border border-surface-lighter">
          <h3 className="text-slate-400 text-sm font-medium">Total Income</h3>
          <p className="text-3xl font-bold mt-2 text-success-400">
            +${totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="bg-surface-light p-6 rounded-2xl shadow-lg border border-surface-lighter">
          <h3 className="text-slate-400 text-sm font-medium">Total Expenses</h3>
          <p className="text-3xl font-bold mt-2 text-danger-400">
            -${totalExpense.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-light p-6 rounded-2xl shadow-lg border border-surface-lighter">
          <h3 className="text-xl font-bold mb-6 text-slate-200">Expenses by Category</h3>
          {pieData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              No expense data available. Add some transactions!
            </div>
          )}
        </div>
        
        {/* We can add a recent transactions quick-view here */}
        <div className="bg-surface-light p-6 rounded-2xl shadow-lg border border-surface-lighter">
          <h3 className="text-xl font-bold mb-6 text-slate-200">Recent Transactions</h3>
          {selectedMonthTransactions.length > 0 ? (
            <div className="space-y-4">
              {selectedMonthTransactions.slice(0, 5).map(t => (
                <div key={t._id} className="flex justify-between items-center p-3 hover:bg-surface-lighter rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-slate-200">{t.description || t.category}</p>
                    <p className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`font-bold ${t.type === 'income' ? 'text-success-400' : 'text-danger-400'}`}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500">
              No recent transactions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
