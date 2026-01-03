import { useState, useEffect } from 'react';
import { getItems } from '../services/dataService';
import type { Item, MealItem, MealType } from '../types';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency, getMealTypeCost } from '../services/settingsService';
import './MealItemEditor.css';

interface MealItemEditorProps {
  mealItems: MealItem[];
  onMealItemsChange: (items: MealItem[]) => void;
  isEditable?: boolean;
  savingsModeEnabled?: boolean;
  mealType?: MealType;
}

function MealItemEditor({ mealItems, onMealItemsChange, isEditable = true, savingsModeEnabled = false, mealType = 'unspecified' }: MealItemEditorProps) {
  const [fridgeItems, setFridgeItems] = useState<Item[]>([]);
  const [localMealItems, setLocalMealItems] = useState<MealItem[]>(mealItems);
  // Store raw input values for percentage to allow empty strings
  const [percentageInputs, setPercentageInputs] = useState<Record<string, string>>({});
  const currency = getCurrency();

  useEffect(() => {
    const items = getItems();
    setFridgeItems(items);
  }, []);

  useEffect(() => {
    setLocalMealItems(mealItems);
    // Initialize percentage inputs from mealItems
    const inputs: Record<string, string> = {};
    mealItems.forEach(item => {
      inputs[item.itemId] = item.percentageUsed.toString();
    });
    setPercentageInputs(inputs);
  }, [mealItems]);

  const addItem = (itemId: string) => {
    const item = fridgeItems.find(i => i.id === itemId);
    if (!item) return;

    // Check if item is already in meal
    if (localMealItems.find(mi => mi.itemId === itemId)) {
      return;
    }

    const newMealItem: MealItem = {
      itemId: item.id,
      name: item.name,
      percentageUsed: 0,
      cost: 0,
    };

    const updated = [...localMealItems, newMealItem];
    setLocalMealItems(updated);
    setPercentageInputs(prev => ({ ...prev, [item.id]: '0' }));
    updateMealItems(updated);
  };

  const removeItem = (itemId: string) => {
    const updated = localMealItems.filter(mi => mi.itemId !== itemId);
    setLocalMealItems(updated);
    updateMealItems(updated);
  };

  const updatePercentage = (itemId: string, value: string) => {
    const item = fridgeItems.find(i => i.id === itemId);
    if (!item) return;

    // Update the raw input value (allow empty string)
    setPercentageInputs(prev => ({ ...prev, [itemId]: value }));

    // Empty string is interpreted as 0
    const percentage = value === '' ? 0 : parseFloat(value);

    // If not a valid number after parsing, treat as 0
    const validPercentage = isNaN(percentage) ? 0 : percentage;

    // Calculate cost (0% means 0 cost)
    const cost = (validPercentage / 100) * item.cost;

    // Update the meal item - allow 0 during editing, validation happens on save
    const updated = localMealItems.map(mi => {
      if (mi.itemId === itemId) {
        return {
          ...mi,
          percentageUsed: validPercentage,
          cost,
        };
      }
      return mi;
    });

    setLocalMealItems(updated);
    updateMealItems(updated);
  };

  const updateMealItems = (items: MealItem[]) => {
    onMealItemsChange(items);
  };

  // Calculate total cost - empty string is interpreted as 0, so all items contribute
  const totalCost = localMealItems.reduce((sum, item) => {
    return sum + (item.cost ?? 0);
  }, 0);

  // Calculate savings if savings mode is enabled and meal type is specified
  const calculateSavings = (): number | undefined => {
    if (!savingsModeEnabled || mealType === 'unspecified') {
      return undefined;
    }
    const normalCost = getMealTypeCost(mealType);
    return normalCost - totalCost;
  };
  const savings = calculateSavings();

  const availableItems = fridgeItems
    .filter(item => !localMealItems.find(mi => mi.itemId === item.id))
    .sort((a, b) => {
      // Items without expiration date go to the end
      if (!a.expirationDate && !b.expirationDate) return 0;
      if (!a.expirationDate) return 1;
      if (!b.expirationDate) return -1;
      // Sort by expiration date (earliest first)
      return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
    });

  return (
    <div className="meal-item-editor">
      <div className="editor-header">
        <h3>Meal Items</h3>
        <div className="meal-totals">
          <span className="total-label">Total Cost:</span>
          <span className="total-value">{formatPrice(totalCost, currency)}</span>
          {savings !== undefined && (
            <>
              <span className="total-label">Savings:</span>
              <span className={`total-value ${savings >= 0 ? 'savings-positive' : 'savings-negative'}`}>
                {savings >= 0 ? '+' : ''}{formatPrice(savings, currency)}
              </span>
            </>
          )}
        </div>
      </div>

      {isEditable && availableItems.length > 0 && (
        <div className="add-item-section">
          <label htmlFor="item-select">Add Item from Fridge:</label>
          <select
            id="item-select"
            onChange={(e) => {
              if (e.target.value) {
                addItem(e.target.value);
                e.target.value = '';
              }
            }}
            className="item-select"
          >
            <option value="">Select an item...</option>
            {availableItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.percentageLeft}% left)
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="meal-items-list">
        {localMealItems.length === 0 ? (
          <p className="no-items">No items added yet. Select items from your fridge above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Percentage Used</th>
                <th>Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {localMealItems.map((mealItem) => {
                const fridgeItem = fridgeItems.find(i => i.id === mealItem.itemId);
                const maxPercentage = fridgeItem?.percentageLeft || 0;

                return (
                  <tr key={mealItem.itemId}>
                    <td>{mealItem.name}</td>
                    <td>
                      {isEditable ? (
                        <>
                          <input
                            type="number"
                            min="1"
                            max={maxPercentage}
                            step="1"
                            value={percentageInputs[mealItem.itemId] ?? mealItem.percentageUsed ?? ''}
                            onChange={(e) => updatePercentage(mealItem.itemId, e.target.value)}
                            className="percentage-input"
                            placeholder="0"
                          />
                          <span className="max-hint">(max: {maxPercentage}%)</span>
                        </>
                      ) : (
                        <span>{mealItem.percentageUsed}%</span>
                      )}
                    </td>
                    <td>{formatPrice(mealItem.cost, currency)}</td>
                    <td>
                      {isEditable && (
                        <button
                          onClick={() => removeItem(mealItem.itemId)}
                          className="remove-button"
                          type="button"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default MealItemEditor;

