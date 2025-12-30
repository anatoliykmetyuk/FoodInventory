import { useState } from 'react';
import { Item } from '../types';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency } from '../services/settingsService';
import { updateItem, removeItem } from '../services/dataService';
import './FridgeItemCard.css';

interface FridgeItemCardProps {
  item: Item;
  onUpdate?: () => void;
}

function FridgeItemCard({ item, onUpdate }: FridgeItemCardProps) {
  const currency = getCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [cost, setCost] = useState(item.cost.toString());
  const [calories, setCalories] = useState(item.estimatedCalories.toString());
  const [percentageLeft, setPercentageLeft] = useState(item.percentageLeft.toString());

  const handleSave = () => {
    const costNum = parseFloat(cost);
    const caloriesNum = parseFloat(calories);
    const percentageNum = parseFloat(percentageLeft);

    if (!name.trim() || isNaN(costNum) || costNum < 0 || isNaN(caloriesNum) || caloriesNum < 0 ||
        isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
      return;
    }

    updateItem(item.id, {
      name: name.trim(),
      cost: costNum,
      estimatedCalories: caloriesNum,
      percentageLeft: percentageNum,
    });

    setIsEditing(false);
    if (onUpdate) onUpdate();
  };

  const handleCancel = () => {
    setName(item.name);
    setCost(item.cost.toString());
    setCalories(item.estimatedCalories.toString());
    setPercentageLeft(item.percentageLeft.toString());
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      removeItem(item.id);
      if (onUpdate) onUpdate();
    }
  };

  return (
    <div className="fridge-item-card">
      {isEditing ? (
        <>
          <div className="item-header">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="item-name-input"
              autoFocus
            />
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={percentageLeft}
              onChange={(e) => setPercentageLeft(e.target.value)}
              className="item-percentage-input"
            />
          </div>
          <div className="item-details">
            <div className="item-detail">
              <span className="detail-label">Cost:</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="item-value-input"
              />
            </div>
            <div className="item-detail">
              <span className="detail-label">Calories:</span>
              <input
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="item-value-input"
              />
            </div>
          </div>
          <div className="item-actions">
            <button onClick={handleSave} className="save-button">Save</button>
            <button onClick={handleCancel} className="cancel-button">Cancel</button>
          </div>
        </>
      ) : (
        <>
          <div className="item-header">
            <h3 className="item-name">{item.name}</h3>
            <span className="item-percentage">{item.percentageLeft}%</span>
          </div>
          <div className="item-details">
            <div className="item-detail">
              <span className="detail-label">Cost:</span>
              <span className="detail-value">{formatPrice(item.cost, currency)}</span>
            </div>
            <div className="item-detail">
              <span className="detail-label">Calories:</span>
              <span className="detail-value">{parseFloat(item.estimatedCalories.toFixed(2))}</span>
            </div>
          </div>
          <div className="item-progress">
            <div
              className="item-progress-bar"
              style={{ width: `${item.percentageLeft}%` }}
            />
          </div>
          <div className="item-actions">
            <button onClick={() => setIsEditing(true)} className="edit-button">Edit</button>
            <button onClick={handleDelete} className="delete-button">Delete</button>
          </div>
        </>
      )}
    </div>
  );
}

export default FridgeItemCard;

