import { useState, useEffect } from 'react';
import { getItems, addItemsToFridgeFromShopping, addShoppingEvent } from '../services/dataService';
import type { Item, ShoppingItem } from '../types';
import FridgeItemCard from '../components/FridgeItemCard';
import AddItemDialog from '../components/AddItemDialog';
import ScanReceiptDialog from '../components/ScanReceiptDialog';
import EmptyState from '../components/EmptyState';
import { useNavigate } from 'react-router-dom';
import './Fridge.css';

function Fridge() {
  const [items, setItems] = useState<Item[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();

    // Listen for currency changes to refresh display
    const handleCurrencyChange = () => {
      loadItems();
    };
    window.addEventListener('currencyChanged', handleCurrencyChange);

    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange);
    };
  }, []);

  const loadItems = () => {
    const fridgeItems = getItems();
    setItems(fridgeItems);
  };

  const handleAddItem = () => {
    loadItems();
  };

  const handleScanReceipt = (shoppingItems: ShoppingItem[]) => {
    // Add items to fridge
    addItemsToFridgeFromShopping(shoppingItems);

    // Create shopping event
    const totalCost = shoppingItems.reduce((sum, item) => sum + item.finalPrice, 0);
    const shoppingEvent = addShoppingEvent({
      date: new Date(),
      items: shoppingItems,
      totalCost,
    });

    // Reload items
    loadItems();

    // Navigate to shopping event page
    navigate(`/shopping/event/${shoppingEvent.id}`);
  };

  return (
    <div className="fridge-page">
      <div className="fridge-header">
        <h1>Fridge</h1>
        <div className="fridge-actions">
          <button
            onClick={() => setIsScanDialogOpen(true)}
            className="scan-receipt-button"
          >
            Scan Receipt
          </button>
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="add-item-button"
          >
            Add Item
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          message="Your fridge is empty. Add items to get started!"
          actionLabel="Add Item"
          onAction={() => setIsAddDialogOpen(true)}
        />
      ) : (
        <div className="fridge-items">
          {items.map((item) => (
            <FridgeItemCard key={item.id} item={item} onUpdate={loadItems} />
          ))}
        </div>
      )}

      <AddItemDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddItem}
      />

      <ScanReceiptDialog
        isOpen={isScanDialogOpen}
        onClose={() => setIsScanDialogOpen(false)}
        onSave={handleScanReceipt}
      />
    </div>
  );
}

export default Fridge;

