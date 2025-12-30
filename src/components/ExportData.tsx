import { exportData } from '../services/settingsService';
import './ExportData.css';

function ExportData() {
  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `food-inventory-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="export-data">
      <button onClick={handleExport} className="export-button">
        Export Data
      </button>
      <p className="export-description">
        Download all your data as a JSON file for backup or migration.
      </p>
    </div>
  );
}

export default ExportData;

