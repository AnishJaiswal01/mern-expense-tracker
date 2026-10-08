import { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';

export default function CurrencyConverterCard() {
  const { exchangeRate, lastUpdated, isRateLoading } = useCurrency();
  const [usdVal, setUsdVal] = useState('100');
  const [inrVal, setInrVal] = useState((100 * exchangeRate).toFixed(2));
  const [activeDirection, setActiveDirection] = useState('usd_to_inr');

  const handleUsdChange = (val) => {
    setUsdVal(val);
    setActiveDirection('usd_to_inr');
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setInrVal((num * exchangeRate).toFixed(2));
    } else {
      setInrVal('');
    }
  };

  const handleInrChange = (val) => {
    setInrVal(val);
    setActiveDirection('inr_to_usd');
    const num = parseFloat(val);
    if (!isNaN(num) && exchangeRate > 0) {
      setUsdVal((num / exchangeRate).toFixed(2));
    } else {
      setUsdVal('');
    }
  };

  const setPreset = (usdAmount) => {
    handleUsdChange(usdAmount.toString());
  };

  return (
    <div className="bg-surface-light p-6 rounded-2xl shadow-lg border border-surface-lighter transition-all duration-200">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💱</span>
          <div>
            <h3 className="text-xl font-bold text-slate-200">Currency Converter</h3>
            <p className="text-xs text-slate-400">
              Live Exchange Rate: <span className="font-semibold text-primary-400">1 USD = ₹{exchangeRate}</span>
              {lastUpdated && <span className="ml-1 opacity-70">({lastUpdated})</span>}
            </p>
          </div>
        </div>
        {isRateLoading && (
          <span className="text-xs text-primary-400 animate-pulse font-medium">Updating rate...</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* USD Input */}
        <div className="bg-surface-lighter/60 p-4 rounded-xl border border-slate-700/60 focus-within:border-primary-500 transition-colors">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            US Dollar (USD)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary-400">$</span>
            <input
              type="number"
              step="any"
              min="0"
              value={usdVal}
              onChange={(e) => handleUsdChange(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-xl font-bold text-slate-100 outline-none"
            />
          </div>
        </div>

        {/* INR Input */}
        <div className="bg-surface-lighter/60 p-4 rounded-xl border border-slate-700/60 focus-within:border-primary-500 transition-colors">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Indian Rupee (INR)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-success-400">₹</span>
            <input
              type="number"
              step="any"
              min="0"
              value={inrVal}
              onChange={(e) => handleInrChange(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-xl font-bold text-slate-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-surface-lighter">
        <span className="text-xs text-slate-400 mr-1 font-medium">Quick Convert:</span>
        {[10, 25, 50, 100, 500, 1000].map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => setPreset(amt)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface border border-slate-700 text-slate-300 hover:border-primary-500 hover:text-primary-400 transition-all cursor-pointer"
          >
            ${amt}
          </button>
        ))}
      </div>
    </div>
  );
}
