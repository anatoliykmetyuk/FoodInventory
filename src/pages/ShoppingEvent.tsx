import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShoppingEvent, updateShoppingEvent, addItemsToFridgeFromShopping } from '../services/dataService';
import type { ShoppingItem } from '../types';
import ShoppingItemEditor from '../components/ShoppingItemEditor';
import './ShoppingEvent.css';

function ShoppingEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState(() => id ? getShoppingEvent(id) : null);
  const [isEditable, setIsEditable] = useState(!event || event.items.length === 0);
  const [items, setItems] = useState<ShoppingItem[]>(event?.items || []);

  useEffect(() => {
    if (id) {
      const shoppingEvent = getShoppingEvent(id);
      if (shoppingEvent) {
        setEvent(shoppingEvent);
        setItems(shoppingEvent.items);
        setIsEditable(shoppingEvent.items.length === 0);
      }
    }
  }, [id]);

  const handleItemsChange = (newItems: ShoppingItem[]) => {
    setItems(newItems);
    // Recalculate total cost
    const totalCost = newItems.reduce((sum, item) => sum + item.finalPrice, 0);
    if (event && id) {
      updateShoppingEvent(id, {
        items: newItems,
        totalCost,
      });
      setEvent({ ...event, items: newItems, totalCost });
    }
  };

  const handleSave = () => {
    if (!event || !id) return;

    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    // Add items to fridge
    addItemsToFridgeFromShopping(items);

    // Update shopping event
    const totalCost = items.reduce((sum, item) => sum + item.finalPrice, 0);
    updateShoppingEvent(id, {
      items,
      totalCost,
    });

    // Navigate to fridge
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/shopping');
  };

  if (!event) {
    return (
      <div className="shopping-event-page">
        <p>Shopping event not found</p>
      </div>
    );
  }

  const date = new Date(event.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="shopping-event-page">
      <div className="event-header">
        <h1>Shopping Event</h1>
        <span className="event-date">{formattedDate}</span>
      </div>

      <ShoppingItemEditor
        items={items}
        onItemsChange={handleItemsChange}
        isEditable={isEditable}
      />

      <div className="event-actions">
        {isEditable && (
          <>
            <button onClick={handleCancel} className="cancel-button">
              Cancel
            </button>
            <button onClick={handleSave} className="save-button">
              Save to Fridge
            </button>
          </>
        )}
        {!isEditable && (
          <button onClick={handleCancel} className="back-button">
            Back to Shopping
          </button>
        )}
      </div>
    </div>
  );
}

export default ShoppingEvent;

