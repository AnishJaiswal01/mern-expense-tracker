import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { setSelectedMonth } from '../features/transactions/transactionSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { transactions, selectedMonth } = useSelector((state) => state.transactions);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Transactions', path: '/transactions' },
  ];

  // Calculate unique months from transactions (newest to oldest)
  const uniqueMonths = [...new Set(transactions.map(t => t.date.substring(0, 7)))].sort().reverse();
  
  // Ensure current month is always in the list even if no transactions
  const currentMonth = new Date().toISOString().substring(0, 7);
  if (!uniqueMonths.includes(currentMonth)) {
    uniqueMonths.unshift(currentMonth);
    uniqueMonths.sort().reverse();
  }
  
  // Format YYYY-MM to readable (e.g. September 2026)
  const formatMonth = (yyyyMm) => {
    if (!yyyyMm) return '';
    const [year, month] = yyyyMm.split('-');
    const date = new Date(year, month - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <nav className="bg-surface-light border-b border-surface-lighter px-6 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-primary-400">
            KnowYourExpenses
          </Link>
          <div className="hidden md:flex gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-slate-300 hover:bg-surface-lighter hover:text-slate-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          {/* MONTH SELECTOR */}
          <div className="hidden sm:block">
            <select
              value={selectedMonth}
              onChange={(e) => dispatch(setSelectedMonth(e.target.value))}
              className="bg-surface text-slate-200 text-sm rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-primary-500"
            >
              {uniqueMonths.map(m => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
          </div>

          <span className="text-sm text-slate-400 hidden lg:block">
            Welcome, {user?.name}
          </span>
          <button
            onClick={async () => {
              try {
                await import('../utils/api').then(m => m.default.post('/transactions/seed'));
                window.location.reload();
              } catch (e) {
                console.error(e);
              }
            }}
            className="text-sm font-medium text-success-400 hover:text-success-300 transition-colors mr-2"
          >
            Seed Data
          </button>
          <button
            onClick={onLogout}
            className="text-sm font-medium text-danger-400 hover:text-danger-300 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
