import { useState, useEffect } from 'react';
import { getItems } from '../services/dataService';
import type { Item, MealItem } from '../types';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency } from '../services/settingsService';
import './MealItemEditor.css';

interface MealItemEditorProps {
  mealItems: MealItem[];
  onMealItemsChange: (items: MealItem[]) => void;
}

function MealItemEditor({ mealItems, onMealItemsChange }: MealItemEditorProps) {
  const [fridgeItems, setFridgeItems] = useState<Item[]>([]);
  const [localMealItems, setLocalMealItems] = useState<MealItem[]>(mealItems);
  const currency = getCurrency();

  useEffect(() => {
    const items = getItems();
    setFridgeItems(items);
  }, []);

  useEffect(() => {
    setLocalMealItems(mealItems);
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
      calories: 0,
    };

    const updated = [...localMealItems, newMealItem];
    setLocalMealItems(updated);
    updateMealItems(updated);
  };

  const removeItem = (itemId: string) => {
    const updated = localMealItems.filter(mi => mi.itemId !== itemId);
    setLocalMealItems(updated);
    updateMealItems(updated);
  };

  const updatePercentage = (itemId: string, percentage: number) => {
    const item = fridgeItems.find(i => i.id === itemId);
    if (!item) return;

    // Validate percentage (0 < p <= available)
    if (percentage <= 0 || percentage > item.percentageLeft) {
      return;
    }

    const updated = localMealItems.map(mi => {
      if (mi.itemId === itemId) {
        const cost = (percentage / 100) * item.cost;
        const calories = (percentage / 100) * item.estimatedCalories;
        return {
          ...mi,
          percentageUsed: percentage,
          cost,
          calories,
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

  const totalCost = localMealItems.reduce((sum, item) => sum + item.cost, 0);
  const totalCalories = localMealItems.reduce((sum, item) => sum + item.calories, 0);

  const availableItems = fridgeItems.filter(
    item => !localMealItems.find(mi => mi.itemId === item.id)
  );

  return (
    <div className="meal-item-editor">
      <div className="editor-header">
        <h3>Meal Items</h3>
        <div className="meal-totals">
          <span className="total-label">Total Cost:</span>
          <span className="total-value">{formatPrice(totalCost, currency)}</span>
          <span className="total-label">Total Calories:</span>
          <span className="total-value">{totalCalories}</span>
        </div>
      </div>

      {availableItems.length > 0 && (
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
                <th>Calories</th>
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
                      <input
                        type="number"
                        min="0.01"
                        max={maxPercentage}
                        step="0.01"
                        value={mealItem.percentageUsed}
                        onChange={(e) => updatePercentage(mealItem.itemId, parseFloat(e.target.value) || 0)}
                        className="percentage-input"
                      />
                      <span className="max-hint">(max: {maxPercentage}%)</span>
                    </td>
                    <td>{formatPrice(mealItem.cost, currency)}</td>
                    <td>{Math.round(mealItem.calories)}</td>
                    <td>
                      <button
                        onClick={() => removeItem(mealItem.itemId)}
                        className="remove-button"
                        type="button"
                      >
                        Remove
                      </button>
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

