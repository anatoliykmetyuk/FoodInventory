import { useState } from 'react';
import { wipeData } from '../services/settingsService';
import './WipeData.css';

function WipeData() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleWipe = () => {
    if (showConfirm) {
      wipeData();
      setShowConfirm(false);
      // Reload the page to reflect the cleared state
      window.location.reload();
    } else {
      setShowConfirm(true);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="wipe-data">
      {!showConfirm ? (
        <button onClick={handleWipe} className="wipe-button">
          Wipe All Data
        </button>
      ) : (
        <div className="wipe-confirm">
          <p className="wipe-warning">
            Are you sure you want to delete all data? This action cannot be undone.
          </p>
          <div className="wipe-actions">
            <button onClick={handleWipe} className="wipe-confirm-button">
              Yes, Delete Everything
            </button>
            <button onClick={handleCancel} className="wipe-cancel-button">
              Cancel
            </button>
          </div>
        </div>
      )}
      <p className="wipe-description">
        Permanently delete all items, meals, shopping events, and settings.
      </p>
    </div>
  );
}

export default WipeData;

