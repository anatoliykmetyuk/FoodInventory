import { useState, useEffect } from 'react';
import { 
  getOpenAIApiKey, 
  setOpenAIApiKey, 
  getExpirationWarningDays, 
  setExpirationWarningDays,
  getSavingsMode,
  setSavingsMode,
  getMealTypeCost,
  setMealTypeCost,
  getCurrency
} from '../services/settingsService';
import { formatPrice } from '../utils/currencyFormatter';
import CurrencySelector from '../components/CurrencySelector';
import ExportData from '../components/ExportData';
import ImportData from '../components/ImportData';
import WipeData from '../components/WipeData';
import InstallApp from '../components/InstallApp';
import './Settings.css';

function Settings() {
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [warningDays, setWarningDays] = useState<number>(7);
  const [savingsModeEnabled, setSavingsModeEnabled] = useState<boolean>(false);
  const [breakfastCost, setBreakfastCost] = useState<number>(0);
  const [lunchCost, setLunchCost] = useState<number>(0);
  const [dinnerCost, setDinnerCost] = useState<number>(0);
  const currency = getCurrency();

  useEffect(() => {
    const savedKey = getOpenAIApiKey();
    if (savedKey) {
      setApiKey(savedKey);
    }
    setWarningDays(getExpirationWarningDays());
    setSavingsModeEnabled(getSavingsMode());
    setBreakfastCost(getMealTypeCost('breakfast'));
    setLunchCost(getMealTypeCost('lunch'));
    setDinnerCost(getMealTypeCost('dinner'));
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    setOpenAIApiKey(newKey);
  };

  const handleWarningDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const days = parseInt(e.target.value, 10);
    if (!isNaN(days) && days >= 0) {
      setWarningDays(days);
      setExpirationWarningDays(days);
    }
  };

  const handleSavingsModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setSavingsModeEnabled(enabled);
    setSavingsMode(enabled);
  };

  const handleMealTypeCostChange = (mealType: 'breakfast' | 'lunch' | 'dinner', value: string) => {
    const cost = parseFloat(value) || 0;
    setMealTypeCost(mealType, cost);
    switch (mealType) {
      case 'breakfast':
        setBreakfastCost(cost);
        break;
      case 'lunch':
        setLunchCost(cost);
        break;
      case 'dinner':
        setDinnerCost(cost);
        break;
    }
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <section className="settings-section">
        <h2>OpenAI API Key</h2>
        <p className="settings-description">
          Your API key is stored locally and never sent to our servers.
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="api-key-link"
          >
            Get your API key here
          </a>
        </p>
        <div className="api-key-input-group">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your OpenAI API key"
            className="api-key-input"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="toggle-visibility-button"
          >
            {showApiKey ? 'Hide' : 'Show'}
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h2>Install App</h2>
        <InstallApp />
      </section>

      <section className="settings-section">
        <h2>Currency</h2>
        <CurrencySelector />
      </section>

      <section className="settings-section">
        <h2>Expiration Warning</h2>
        <p className="settings-description">
          Items expiring within this many days will be highlighted in red.
        </p>
        <div className="expiration-warning-input-group">
          <input
            type="number"
            min="0"
            value={warningDays}
            onChange={handleWarningDaysChange}
            className="expiration-warning-input"
          />
          <span className="expiration-warning-label">days</span>
        </div>
      </section>

      <section className="settings-section">
        <h2>Savings Tracking</h2>
        <p className="settings-description">
          Track how much you save by cooking at home compared to eating out.
        </p>
        <div className="savings-mode-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={savingsModeEnabled}
              onChange={handleSavingsModeChange}
              className="savings-checkbox"
            />
            <span>Enable Savings Mode</span>
          </label>
        </div>
        {savingsModeEnabled && (
          <div className="meal-type-costs">
            <p className="settings-description">
              Set your typical costs for eating out for each meal type:
            </p>
            <div className="meal-cost-input-group">
              <label htmlFor="breakfast-cost">Breakfast:</label>
              <input
                id="breakfast-cost"
                type="number"
                min="0"
                step="0.01"
                value={breakfastCost || ''}
                onChange={(e) => handleMealTypeCostChange('breakfast', e.target.value)}
                placeholder={formatPrice(0, currency)}
                className="meal-cost-input"
              />
            </div>
            <div className="meal-cost-input-group">
              <label htmlFor="lunch-cost">Lunch:</label>
              <input
                id="lunch-cost"
                type="number"
                min="0"
                step="0.01"
                value={lunchCost || ''}
                onChange={(e) => handleMealTypeCostChange('lunch', e.target.value)}
                placeholder={formatPrice(0, currency)}
                className="meal-cost-input"
              />
            </div>
            <div className="meal-cost-input-group">
              <label htmlFor="dinner-cost">Dinner:</label>
              <input
                id="dinner-cost"
                type="number"
                min="0"
                step="0.01"
                value={dinnerCost || ''}
                onChange={(e) => handleMealTypeCostChange('dinner', e.target.value)}
                placeholder={formatPrice(0, currency)}
                className="meal-cost-input"
              />
            </div>
          </div>
        )}
      </section>

      <section className="settings-section">
        <h2>Data Management</h2>
        <div className="data-warning">
          <p className="warning-text">
            <strong>⚠️ Important:</strong> All data is stored locally in your browser.
            If you clear your browser history or data, all your information will be lost.
            Please make sure to export and back up your data regularly.
          </p>
        </div>
        <ExportData />
        <ImportData />
        <WipeData />
      </section>
    </div>
  );
}

export default Settings;

