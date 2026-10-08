import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

// Default fallback exchange rate (1 USD = 86.5 INR)
const DEFAULT_USD_TO_INR = 86.5;

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('expense_currency') || 'USD';
  });

  const [exchangeRate, setExchangeRate] = useState(DEFAULT_USD_TO_INR);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRateLoading, setIsRateLoading] = useState(false);

  // Fetch live exchange rate on mount
  useEffect(() => {
    let isMounted = true;
    const fetchLiveRate = async () => {
      setIsRateLoading(true);
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates && data.rates.INR && isMounted) {
            setExchangeRate(Number(data.rates.INR.toFixed(2)));
            setLastUpdated(new Date().toLocaleTimeString());
          }
        }
      } catch (err) {
        console.warn('Using default exchange rate (1 USD = 86.5 INR):', err.message);
      } finally {
        if (isMounted) setIsRateLoading(false);
      }
    };

    fetchLiveRate();
    return () => {
      isMounted = false;
    };
  }, []);

  const setCurrency = (curr) => {
    setCurrencyState(curr);
    localStorage.setItem('expense_currency', curr);
  };

  const toggleCurrency = () => {
    const next = currency === 'USD' ? 'INR' : 'USD';
    setCurrency(next);
  };

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  // Convert USD base amount to current active currency
  const convertAmount = (amountInUSD) => {
    if (typeof amountInUSD !== 'number' || isNaN(amountInUSD)) return 0;
    if (currency === 'INR') {
      return amountInUSD * exchangeRate;
    }
    return amountInUSD;
  };

  // Convert custom amount between currencies
  const convertBetween = (amount, fromCurrency, toCurrency) => {
    const num = parseFloat(amount) || 0;
    if (fromCurrency === toCurrency) return num;
    if (fromCurrency === 'USD' && toCurrency === 'INR') {
      return num * exchangeRate;
    }
    if (fromCurrency === 'INR' && toCurrency === 'USD') {
      return num / exchangeRate;
    }
    return num;
  };

  // Format amount with currency symbol and localized number formatting
  const formatAmount = (amountInUSD, showSign = true) => {
    const val = convertAmount(amountInUSD);
    const absVal = Math.abs(val);
    const formattedNum = absVal.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const prefix = amountInUSD < 0 && showSign ? '-' : '';
    return `${prefix}${currencySymbol}${formattedNum}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        currencySymbol,
        exchangeRate,
        setExchangeRate,
        lastUpdated,
        isRateLoading,
        convertAmount,
        convertBetween,
        formatAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
