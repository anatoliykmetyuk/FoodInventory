import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShoppingEvent, updateShoppingEvent, addItemsToFridgeFromShopping, deleteShoppingEvent } from '../services/dataService';
import type { ShoppingItem } from '../types';
import ShoppingItemEditor from '../components/ShoppingItemEditor';
import Toast from '../components/Toast';
import './ShoppingEvent.css';

function ShoppingEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState(() => id ? getShoppingEvent(id) : null);
  const [isEditable, setIsEditable] = useState(!event || event.items.length === 0);
  const [items, setItems] = useState<ShoppingItem[]>(event?.items || []);
  const [eventDate, setEventDate] = useState(() => {
    if (event) {
      return new Date(event.date).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (id) {
      const shoppingEvent = getShoppingEvent(id);
      if (shoppingEvent) {
        setEvent(shoppingEvent);
        setItems(shoppingEvent.items);
        setIsEditable(shoppingEvent.items.length === 0);
        setEventDate(new Date(shoppingEvent.date).toISOString().split('T')[0]);
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setEventDate(newDate);
    if (event && id) {
      updateShoppingEvent(id, {
        date: new Date(newDate),
      });
      setEvent({ ...event, date: new Date(newDate) });
    }
  };

  const handleSave = () => {
    if (!event || !id) return;

    if (items.length === 0) {
      setToast({ message: 'Shopping event was not saved because it is empty.', type: 'error' });
      // Delete the empty event if it exists
      deleteShoppingEvent(id);
      // Navigate back to shopping page
      setTimeout(() => {
        navigate('/shopping');
      }, 2000);
      return;
    }

    // Add items to fridge
    addItemsToFridgeFromShopping(items);

    // Update shopping event
    const totalCost = items.reduce((sum, item) => sum + item.finalPrice, 0);
    updateShoppingEvent(id, {
      items,
      totalCost,
      date: new Date(eventDate),
    });

    // Navigate to fridge
    navigate('/');
  };

  const handleDelete = () => {
    if (!event || !id) return;

    if (window.confirm(`Are you sure you want to delete this shopping event from ${formattedDate}?`)) {
      deleteShoppingEvent(id);
      navigate('/shopping');
    }
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
        {isEditable ? (
          <div className="event-date-input-group">
            <label htmlFor="event-date">Date:</label>
            <input
              id="event-date"
              type="date"
              value={eventDate}
              onChange={handleDateChange}
              className="event-date-input"
            />
          </div>
        ) : (
          <span className="event-date">{formattedDate}</span>
        )}
      </div>

      <ShoppingItemEditor
        items={items}
        onItemsChange={handleItemsChange}
        isEditable={isEditable}
      />

      <div className="event-actions">
        {isEditable && (
          <>
            <button onClick={handleDelete} className="delete-button">
              Delete
            </button>
            <button onClick={handleCancel} className="cancel-button">
              Cancel
            </button>
            <button onClick={handleSave} className="save-button">
              Save to Fridge
            </button>
          </>
        )}
        {!isEditable && (
          <>
            <button onClick={handleDelete} className="delete-button">
              Delete
            </button>
            <button onClick={handleCancel} className="back-button">
              Back to Shopping
            </button>
          </>
        )}
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default ShoppingEvent;

