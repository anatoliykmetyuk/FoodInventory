import { useState, useEffect } from 'react';
import { getCurrency, setCurrency } from '../services/settingsService';
import { formatPrice } from '../utils/currencyFormatter';
import './CurrencySelector.css';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'PLN', name: 'Polish Zloty' },
  { code: 'RUB', name: 'Russian Ruble' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'ZAR', name: 'South African Rand' },
];

function CurrencySelector() {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(getCurrency());

  useEffect(() => {
    setSelectedCurrency(getCurrency());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setCurrency(newCurrency);
    setSelectedCurrency(newCurrency);
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: newCurrency }));
  };

  return (
    <div className="currency-selector">
      <label htmlFor="currency-select">Currency:</label>
      <select
        id="currency-select"
        value={selectedCurrency}
        onChange={handleChange}
        className="currency-select"
      >
        {CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.name} ({currency.code}) - {formatPrice(100, currency.code)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CurrencySelector;

