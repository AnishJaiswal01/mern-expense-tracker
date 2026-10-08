import { useCurrency } from '../context/CurrencyContext';

export default function CurrencySelector({ className = '' }) {
  const { currency, setCurrency, exchangeRate } = useCurrency();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="bg-surface rounded-xl p-0.5 border border-slate-700 flex items-center shadow-inner">
        <button
          type="button"
          onClick={() => setCurrency('USD')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1 ${
            currency === 'USD'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Switch currency to US Dollar ($)"
          aria-label="Switch to USD"
        >
          <span>$</span> USD
        </button>
        <button
          type="button"
          onClick={() => setCurrency('INR')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1 ${
            currency === 'INR'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title={`Switch currency to Indian Rupee (₹) • 1 USD ≈ ₹${exchangeRate}`}
          aria-label="Switch to INR"
        >
          <span>₹</span> INR
        </button>
      </div>
    </div>
  );
}
