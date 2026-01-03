import { useState, useEffect } from 'react';
import { addItem } from '../services/dataService';
import './AddItemDialog.css';

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

function AddItemDialog({ isOpen, onClose, onSave }: AddItemDialogProps) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset form when dialog closes
      setName('');
      setCost('');
      setExpirationDate('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const costNum = parseFloat(cost);

    if (!name.trim() || isNaN(costNum) || costNum <= 0) {
      return;
    }

    const newItem: Parameters<typeof addItem>[0] = {
      name: name.trim(),
      cost: costNum,
      percentageLeft: 100,
    };

    if (expirationDate) {
      newItem.expirationDate = new Date(expirationDate);
    }

    addItem(newItem);

    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <h2>Add Item to Fridge</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="item-name">Item Name:</label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="item-cost">Cost:</label>
            <input
              id="item-cost"
              type="number"
              step="0.01"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="item-expiration">Expiration Date (optional):</label>
            <input
              id="item-expiration"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddItemDialog;

