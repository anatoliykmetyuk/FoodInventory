import { useState } from 'react';
import { processReceiptImage } from '../services/openaiService';
import { getOpenAIApiKey } from '../services/settingsService';
import { parseReceiptItems, toShoppingItems } from '../utils/receiptParser';
import type { ShoppingItem } from '../types';
import ReceiptReviewTable from './ReceiptReviewTable';
import ErrorMessage from './ErrorMessage';
import './ScanReceiptDialog.css';

interface ScanReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: ShoppingItem[]) => void;
}

function ScanReceiptDialog({ isOpen, onClose, onSave }: ScanReceiptDialogProps) {
  const [step, setStep] = useState<'upload' | 'review' | 'loading'>('upload');
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if API key is set
    if (!getOpenAIApiKey()) {
      setError('OpenAI API key is not set. Please set it in Settings first.');
      return;
    }

    // Show image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setStep('loading');
    setError(null);

    try {
      const response = await processReceiptImage(file);
      const parsedItems = parseReceiptItems(response);
      const shoppingItems = toShoppingItems(parsedItems);

      setItems(shoppingItems);
      setStep('review');
    } catch (err: any) {
      setError(err.message || 'Failed to process receipt image');
      setStep('upload');
      setImagePreview(null);
    }
  };

  const handleSave = () => {
    if (items.length === 0) {
      setError('Please add at least one item');
      return;
    }
    onSave(items);
    handleClose();
  };

  const handleClose = () => {
    setStep('upload');
    setItems([]);
    setError(null);
    setImagePreview(null);
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={handleClose}>
      <div className="dialog-content scan-receipt-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Scan Receipt</h2>

        {step === 'upload' && (
          <div className="upload-step">
            {!getOpenAIApiKey() && (
              <div className="api-key-warning">
                <p>OpenAI API key is not set.</p>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-key-link"
                >
                  Get your API key here
                </a>
                <p>Then set it in Settings.</p>
              </div>
            )}
            <div className="file-upload-area">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                id="receipt-upload"
                className="file-input"
              />
              <label htmlFor="receipt-upload" className="file-upload-label">
                <span className="upload-icon">📷</span>
                <span>Take Photo or Upload Image</span>
              </label>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {step === 'loading' && (
          <div className="loading-step">
            <div className="spinner"></div>
            <p>Processing receipt image...</p>
            {imagePreview && (
              <img src={imagePreview} alt="Receipt preview" className="image-preview" />
            )}
          </div>
        )}

        {step === 'review' && (
          <div className="review-step">
            <ReceiptReviewTable items={items} onItemsChange={setItems} />
            {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
            <div className="dialog-actions">
              <button onClick={handleClose} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleSave} className="save-button">
                Save to Fridge
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanReceiptDialog;

