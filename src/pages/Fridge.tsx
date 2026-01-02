import { useState, useEffect } from 'react';
import { getItems, addItemsToFridgeFromShopping, addShoppingEvent } from '../services/dataService';
import type { Item, ShoppingItem, FridgeViewMode } from '../types';
import { getFridgeViewMode, setFridgeViewMode } from '../services/settingsService';
import FridgeItemCard from '../components/FridgeItemCard';
import FridgeItemCardCompact from '../components/FridgeItemCardCompact';
import AddItemDialog from '../components/AddItemDialog';
import ScanReceiptDialog from '../components/ScanReceiptDialog';
import EmptyState from '../components/EmptyState';
import { useNavigate } from 'react-router-dom';
import './Fridge.css';

function Fridge() {
  const [items, setItems] = useState<Item[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<FridgeViewMode>(getFridgeViewMode());
  const navigate = useNavigate();

  const handleViewModeChange = (mode: FridgeViewMode) => {
    setViewMode(mode);
    setFridgeViewMode(mode);
  };

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
    // Sort items by expiration date - earliest first, items without expiration date at the end
    const sortedItems = [...fridgeItems].sort((a, b) => {
      // Items without expiration date go to the end
      if (!a.expirationDate && !b.expirationDate) return 0;
      if (!a.expirationDate) return 1;
      if (!b.expirationDate) return -1;
      // Sort by expiration date (earliest first)
      return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
    });
    setItems(sortedItems);
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
        <div className="fridge-title-row">
          <h1>Fridge</h1>
          <div className="view-toggle">
            <button
              className={`view-toggle-button ${viewMode === 'full' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('full')}
              title="Full view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="18" height="7" rx="1" />
                <rect x="3" y="14" width="18" height="7" rx="1" />
              </svg>
            </button>
            <button
              className={`view-toggle-button ${viewMode === 'compact' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('compact')}
              title="Compact view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="4" width="18" height="3" rx="1" />
                <rect x="3" y="10.5" width="18" height="3" rx="1" />
                <rect x="3" y="17" width="18" height="3" rx="1" />
              </svg>
            </button>
          </div>
        </div>
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
      ) : viewMode === 'compact' ? (
        <div className="fridge-items fridge-items-compact">
          {items.map((item) => (
            <FridgeItemCardCompact key={item.id} item={item} />
          ))}
        </div>
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

