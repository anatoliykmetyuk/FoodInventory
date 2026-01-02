import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItem, updateItem, removeItem } from '../services/dataService';
import { getCurrency, getExpirationWarningDays } from '../services/settingsService';
import { formatPrice } from '../utils/currencyFormatter';
import type { Item } from '../types';
import './FridgeItem.css';

function FridgeItem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currency = getCurrency();
  const expirationWarningDays = getExpirationWarningDays();

  const [item, setItem] = useState<Item | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [calories, setCalories] = useState('');
  const [percentageLeft, setPercentageLeft] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  useEffect(() => {
    if (id) {
      loadItem(id);
    }
  }, [id]);

  const loadItem = (itemId: string) => {
    const loadedItem = getItem(itemId);
    if (loadedItem) {
      setItem(loadedItem);
      setName(loadedItem.name);
      setCost(loadedItem.cost.toString());
      setCalories(loadedItem.estimatedCalories.toString());
      setPercentageLeft(loadedItem.percentageLeft.toString());
      setExpirationDate(
        loadedItem.expirationDate ? new Date(loadedItem.expirationDate).toISOString().split('T')[0] : ''
      );
    } else {
      navigate('/');
    }
  };

  const getDaysUntilExpiration = (): number | null => {
    if (!item?.expirationDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(item.expirationDate);
    expDate.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysUntilExpiration = getDaysUntilExpiration();
  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= expirationWarningDays;

  const handleSave = () => {
    if (!id) return;

    const costNum = parseFloat(cost);
    const caloriesNum = parseFloat(calories);
    const percentageNum = parseFloat(percentageLeft);

    if (!name.trim() || isNaN(costNum) || costNum < 0 || isNaN(caloriesNum) || caloriesNum < 0 ||
        isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
      return;
    }

    const updates: Partial<Omit<Item, 'id'>> = {
      name: name.trim(),
      cost: costNum,
      estimatedCalories: caloriesNum,
      percentageLeft: percentageNum,
    };

    if (expirationDate) {
      updates.expirationDate = new Date(expirationDate);
    } else {
      updates.expirationDate = undefined;
    }

    updateItem(id, updates);
    setIsEditing(false);
    loadItem(id);
  };

  const handleCancel = () => {
    if (item) {
      setName(item.name);
      setCost(item.cost.toString());
      setCalories(item.estimatedCalories.toString());
      setPercentageLeft(item.percentageLeft.toString());
      setExpirationDate(
        item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : ''
      );
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!item || !id) return;

    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      removeItem(id);
      navigate('/');
    }
  };

  if (!item) {
    return <div className="fridge-item-page">Loading...</div>;
  }

  return (
    <div className="fridge-item-page">
      <div className="fridge-item-header">
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="fridge-item-name-input"
            autoFocus
          />
        ) : (
          <h1>{item.name}</h1>
        )}
      </div>

      <div className="fridge-item-content">
        <div className="fridge-item-progress-section">
          <div className="progress-label">
            <span>Amount Left</span>
            {isEditing ? (
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={percentageLeft}
                onChange={(e) => setPercentageLeft(e.target.value)}
                className="percentage-input"
              />
            ) : (
              <span className="percentage-value">{item.percentageLeft}%</span>
            )}
          </div>
          <div className="fridge-item-progress">
            <div
              className="fridge-item-progress-bar"
              style={{ width: `${isEditing ? percentageLeft : item.percentageLeft}%` }}
            />
          </div>
        </div>

        <div className="fridge-item-details">
          <div className="detail-row">
            <span className="detail-label">Cost:</span>
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="detail-input"
              />
            ) : (
              <span className="detail-value">{formatPrice(item.cost, currency)}</span>
            )}
          </div>

          <div className="detail-row">
            <span className="detail-label">Calories:</span>
            {isEditing ? (
              <input
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="detail-input"
              />
            ) : (
              <span className="detail-value">{parseFloat(item.estimatedCalories.toFixed(2))}</span>
            )}
          </div>

          <div className="detail-row">
            <span className="detail-label">Expires:</span>
            {isEditing ? (
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="detail-input date-input"
              />
            ) : item.expirationDate ? (
              <span className={`detail-value ${isExpiringSoon ? 'expiring-soon' : ''}`}>
                {new Date(item.expirationDate).toISOString().split('T')[0]}
                {' '}
                ({daysUntilExpiration !== null && (
                  daysUntilExpiration < 0
                    ? `${Math.abs(daysUntilExpiration)} days ago`
                    : daysUntilExpiration === 0
                      ? 'today'
                      : daysUntilExpiration === 1
                        ? '1 day left'
                        : `${daysUntilExpiration} days left`
                )})
              </span>
            ) : (
              <span className="detail-value">—</span>
            )}
          </div>
        </div>
      </div>

      <div className="fridge-item-actions">
        {isEditing ? (
          <>
            <button onClick={handleCancel} className="cancel-button">Cancel</button>
            <button onClick={handleSave} className="save-button">Save</button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} className="edit-button">Edit</button>
            <button onClick={handleDelete} className="delete-button">Delete</button>
            <button onClick={() => navigate('/')} className="back-button">Back to Fridge</button>
          </>
        )}
      </div>
    </div>
  );
}

export default FridgeItem;
