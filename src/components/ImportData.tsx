import { useState } from 'react';
import { importData } from '../services/settingsService';
import './ImportData.css';

function ImportData() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        // Validate data structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid JSON format');
        }

        // Import the data
        importData(data);

        setSuccess(true);
        // Reload the page to reflect the imported data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error.message || 'Failed to import data. Please check the file format.');
      }
    };

    reader.onerror = () => {
      setError('Failed to read the file.');
    };

    reader.readAsText(file);
  };

  return (
    <div className="import-data">
      <input
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        id="import-file-input"
        className="import-file-input"
      />
      <label htmlFor="import-file-input" className="import-button">
        Import Data
      </label>
      {error && (
        <p className="import-error">{error}</p>
      )}
      {success && (
        <p className="import-success">Data imported successfully! Reloading...</p>
      )}
      <p className="import-description">
        Import data from a previously exported JSON file. This will replace all current data.
      </p>
    </div>
  );
}

export default ImportData;

