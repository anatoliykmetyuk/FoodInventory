import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="error-message-container">
      <div className="error-message-content">
        <span className="error-icon">⚠️</span>
        <span className="error-text">{message}</span>
        {onDismiss && (
          <button onClick={onDismiss} className="dismiss-button" aria-label="Dismiss">
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;

