import { useState, useEffect } from 'react';
import { getShoppingEvents, addShoppingEvent } from '../services/dataService';
import { useNavigate } from 'react-router-dom';
import type { ShoppingEvent, ShoppingItem } from '../types';
import ShoppingEventCard from '../components/ShoppingEventCard';
import ScanReceiptDialog from '../components/ScanReceiptDialog';
import EmptyState from '../components/EmptyState';
import './Shopping.css';

function Shopping() {
  const [events, setEvents] = useState<ShoppingEvent[]>([]);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    const shoppingEvents = getShoppingEvents();
    // Sort by date descending (most recent first)
    shoppingEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEvents(shoppingEvents);
  };

  const handleScanReceipt = (shoppingItems: ShoppingItem[]) => {
    const totalCost = shoppingItems.reduce((sum, item) => sum + item.finalPrice, 0);
    const shoppingEvent = addShoppingEvent({
      date: new Date(),
      items: shoppingItems,
      totalCost,
    });

    loadEvents();
    navigate(`/shopping/event/${shoppingEvent.id}`);
  };

  const handleAddShoppingEvent = () => {
    // Create empty shopping event and navigate to edit page
    const shoppingEvent = addShoppingEvent({
      date: new Date(),
      items: [],
      totalCost: 0,
    });
    navigate(`/shopping/event/${shoppingEvent.id}`);
  };

  return (
    <div className="shopping-page">
      <div className="shopping-header">
        <h1>Shopping</h1>
        <div className="shopping-actions">
          <button
            onClick={() => setIsScanDialogOpen(true)}
            className="scan-receipt-button"
          >
            Scan Receipt
          </button>
          <button
            onClick={handleAddShoppingEvent}
            className="add-event-button"
          >
            Add Shopping Event
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState
          message="No shopping events yet. Scan a receipt or add a shopping event to get started!"
          actionLabel="Scan Receipt"
          onAction={() => setIsScanDialogOpen(true)}
        />
      ) : (
        <div className="shopping-events">
          {events.map((event) => (
            <ShoppingEventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <ScanReceiptDialog
        isOpen={isScanDialogOpen}
        onClose={() => setIsScanDialogOpen(false)}
        onSave={handleScanReceipt}
      />
    </div>
  );
}

export default Shopping;

