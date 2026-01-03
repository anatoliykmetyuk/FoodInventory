import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShoppingEvent, updateShoppingEvent, addShoppingEvent, addItemsToFridgeFromShopping, deleteShoppingEvent } from '../services/dataService';
import type { ShoppingItem } from '../types';
import ShoppingItemEditor from '../components/ShoppingItemEditor';
import Toast from '../components/Toast';
import './ShoppingEvent.css';

function ShoppingEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewEvent = id === 'new';
  const [event, setEvent] = useState(() => {
    if (isNewEvent) {
      return null; // New event - no event object yet
    }
    return id ? getShoppingEvent(id) : null;
  });
  const [isEditable, setIsEditable] = useState(isNewEvent || !event || (event?.items?.length ?? 0) === 0);
  const [items, setItems] = useState<ShoppingItem[]>(event?.items || []);
  const [eventDate, setEventDate] = useState(() => {
    if (event) {
      return new Date(event.date).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });
  const [taxRate, setTaxRate] = useState<number>(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (id && !isNewEvent) {
      const shoppingEvent = getShoppingEvent(id);
      if (shoppingEvent) {
        setEvent(shoppingEvent);
        setItems(shoppingEvent.items);
        setIsEditable(shoppingEvent.items.length === 0);
        setEventDate(new Date(shoppingEvent.date).toISOString().split('T')[0]);
      }
    }
  }, [id, isNewEvent]);

  const handleItemsChange = (newItems: ShoppingItem[]) => {
    setItems(newItems);
    // Don't persist changes immediately - only update local state
    // Changes will be persisted only when Save is clicked
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setEventDate(newDate);
    // Don't persist changes immediately - only update local state
    // Changes will be persisted only when Save is clicked
  };

  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTaxRate = parseFloat(e.target.value) || 0;
    setTaxRate(newTaxRate);
  };

  const handleSave = () => {
    if (items.length === 0) {
      setToast({ message: 'Shopping event was not saved because it is empty.', type: 'error' });
      // Navigate back to shopping page
      setTimeout(() => {
        navigate('/shopping');
      }, 2000);
      return;
    }

    // Convert items to saved format: ONLY name and finalPrice (cost after tax)
    // Use global tax rate to calculate finalPrice for all items
    // Saved items MUST ONLY have name and finalPrice - NOTHING ELSE
    const itemsToSave: ShoppingItem[] = items.map(item => {
      // Calculate finalPrice (cost after tax)
      const finalPrice = item.finalPrice !== undefined
        ? item.finalPrice  // Already calculated (from saved event)
        : (item.listedPrice ?? 0) * (1 + taxRate / 100);  // Calculate from listedPrice + global tax

      // Return ONLY name and finalPrice (cost) - nothing else
      return {
        name: item.name,
        finalPrice,  // This is the cost after tax
      };
    });

    // Calculate total cost from finalPrice
    const totalCost = itemsToSave.reduce((sum, item) => sum + (item.finalPrice ?? 0), 0);

    if (isNewEvent) {
      // CREATE the shopping event - this is the ONLY place events are created
      const newEvent = addShoppingEvent({
        date: new Date(eventDate),
        items: itemsToSave,
        totalCost,
      });
      setEvent(newEvent);
    } else {
      // UPDATE existing shopping event
      if (!event || !id) return;

      const updatedEvent = updateShoppingEvent(id, {
        items: itemsToSave,
        totalCost,
        date: new Date(eventDate),
      });

      if (updatedEvent) {
        setEvent(updatedEvent);
      }
    }

    // Add items to fridge
    addItemsToFridgeFromShopping(itemsToSave);

    // Navigate to fridge
    navigate('/');
  };

  const handleDelete = () => {
    if (isNewEvent) {
      // Nothing to delete for new events
      navigate('/shopping');
      return;
    }

    if (!event || !id) return;

    if (window.confirm(`Are you sure you want to delete this shopping event from ${formattedDate}?`)) {
      deleteShoppingEvent(id);
      navigate('/shopping');
    }
  };

  const handleCancel = () => {
    // For new events, just navigate away - nothing was created so nothing to delete
    // For existing events, just navigate away - we don't delete on cancel
    navigate('/shopping');
  };

  // For new events, we don't have an event object yet, so we can't show formatted date
  // For existing events, show the formatted date
  const formattedDate = event
    ? new Date(event.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date(eventDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  // For new events, event is null but that's expected - don't show error
  // For existing events, if event is null and id is not 'new', show error
  if (!event && !isNewEvent && id) {
    return (
      <div className="shopping-event-page">
        <p>Shopping event not found</p>
      </div>
    );
  }

  return (
    <div className="shopping-event-page">
      <div className="event-header">
        <h1>Shopping Event</h1>
        {isEditable ? (
          <div className="event-header-inputs">
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
            <div className="event-date-input-group">
              <label htmlFor="event-tax-rate">Tax Rate (%):</label>
              <input
                id="event-tax-rate"
                type="number"
                step="0.01"
                min="0"
                value={taxRate}
                onChange={handleTaxRateChange}
                className="event-date-input"
              />
            </div>
          </div>
        ) : (
          <span className="event-date">{formattedDate}</span>
        )}
      </div>

      <ShoppingItemEditor
        items={items}
        onItemsChange={handleItemsChange}
        isEditable={isEditable}
        taxRate={taxRate}
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
            {!isNewEvent && (
              <button onClick={handleDelete} className="delete-button">
                Delete
              </button>
            )}
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

