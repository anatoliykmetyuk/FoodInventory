import { useState, useEffect } from 'react';
import { getOpenAIApiKey, setOpenAIApiKey } from '../services/settingsService';
import CurrencySelector from '../components/CurrencySelector';
import ExportData from '../components/ExportData';
import ImportData from '../components/ImportData';
import WipeData from '../components/WipeData';
import './Settings.css';

function Settings() {
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    const savedKey = getOpenAIApiKey();
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    setOpenAIApiKey(newKey);
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
        <h2>Currency</h2>
        <CurrencySelector />
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

