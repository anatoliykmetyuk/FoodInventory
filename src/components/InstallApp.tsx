import { useState, useEffect } from 'react';
import './InstallApp.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const isStandaloneMode = (window.navigator as any).standalone === true || standalone;
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was just installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Show instructions for browsers that don't support programmatic install
      setShowInstructions(true);
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  const handleShowInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  // Don't show anything if already installed
  if (isInstalled || isStandalone) {
    return (
      <div className="install-app-section">
        <p className="install-status installed">✓ App is installed</p>
      </div>
    );
  }

  // Show install button for Chrome/Edge or instructions toggle for others
  return (
    <div className="install-app-section">
      {deferredPrompt ? (
        <>
          <button
            type="button"
            onClick={handleInstallClick}
            className="install-button"
          >
            Install App
          </button>
          <p className="install-status">
            Install this app on your device for a better experience
          </p>
        </>
      ) : (
        <>
          {isIOS ? (
            <>
              <button
                type="button"
                onClick={handleShowInstructions}
                className="install-button"
              >
                {showInstructions ? 'Hide' : 'Show'} Installation Instructions
              </button>
              {showInstructions && (
                <div className="install-instructions">
                  <h3>Install on iOS (Safari)</h3>
                  <ol>
                    <li>Tap the Share button (square with arrow) at the bottom of the screen</li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" to confirm</li>
                    <li>The app icon will appear on your home screen</li>
                  </ol>
                </div>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleShowInstructions}
                className="install-button"
              >
                {showInstructions ? 'Hide' : 'Show'} Installation Instructions
              </button>
              {showInstructions && (
                <div className="install-instructions">
                  <h3>Install this App</h3>
                  <p>
                    <strong>Chrome/Edge:</strong> Look for the install icon (⊕) in the address bar, or use the browser menu (⋮) → "Install app"
                  </p>
                  <p>
                    <strong>Safari (macOS):</strong> Use File → "Add to Dock" or check the address bar for an install option
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default InstallApp;

