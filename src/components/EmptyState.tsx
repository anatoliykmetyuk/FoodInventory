import './EmptyState.css';

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-message">{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="empty-action-button">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;

