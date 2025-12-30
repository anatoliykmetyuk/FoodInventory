# Progressive Web App (PWA) Setup

The Food Inventory application is configured as a Progressive Web App (PWA), allowing users to install it on their devices and use it offline.

## Features

### ✅ Installable
- Users can install the app on their home screen (mobile) or desktop
- App appears as a standalone application (not in browser)
- Custom app icon and name

### ✅ Offline Support
- Service worker caches app assets for offline use
- App works without internet connection (for viewing and editing data)
- Data is stored locally in browser localStorage

### ✅ Auto Updates
- Service worker automatically updates when new version is available
- Users get the latest version without manual refresh

## Installation

### On Mobile (iOS/Android)

1. Open the app in your mobile browser
2. Look for the "Add to Home Screen" prompt, or:
   - **iOS Safari**: Tap the Share button → "Add to Home Screen"
   - **Android Chrome**: Tap the menu (⋮) → "Add to Home Screen" or "Install app"
3. Confirm the installation
4. The app icon will appear on your home screen

### On Desktop (Chrome/Edge)

1. Open the app in your browser
2. Look for the install icon (⊕) in the address bar
3. Click "Install" when prompted
4. The app will open in its own window

## Offline Functionality

The app works offline for:
- ✅ Viewing all your data (fridge items, meals, shopping events, statistics)
- ✅ Adding new items manually
- ✅ Editing existing items
- ✅ Creating meals
- ✅ Viewing statistics

**Note**: Receipt scanning requires an internet connection as it uses the OpenAI API.

## Service Worker

The app uses a service worker that:
- Caches all app assets (HTML, CSS, JavaScript)
- Provides offline functionality
- Automatically updates when new versions are deployed
- Caches OpenAI API responses (24 hours) for faster receipt scanning

## Configuration

PWA configuration is handled by `vite-plugin-pwa` in `vite.config.ts`:

- **Manifest**: Defines app name, icons, theme colors, and display mode
- **Service Worker**: Handles caching and offline functionality
- **Icons**: Automatically generated from source SVG

## Customization

### Icons

Replace `public/icon.svg` with your custom icon. The build process will automatically generate:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)

### Theme Colors

Update theme colors in `vite.config.ts`:
- `theme_color`: Color of the browser UI when app is installed
- `background_color`: Splash screen background color

### Manifest

Edit the manifest in `vite.config.ts` to customize:
- App name and description
- Display mode (standalone, fullscreen, minimal-ui)
- Orientation (portrait, landscape, or any)

## Testing PWA Features

### Development

1. Run `npm run dev`
2. Open DevTools → Application tab
3. Check "Service Workers" section
4. Test offline mode using "Network" tab → "Offline" checkbox

### Production

1. Build the app: `npm run build`
2. Preview: `npm run preview`
3. Test installation and offline functionality
4. Verify service worker is active

## Troubleshooting

### Service Worker Not Registering

- Ensure you're using HTTPS (or localhost for development)
- Check browser console for errors
- Clear browser cache and reload

### App Not Installing

- Check that manifest.json is accessible
- Verify icons are present and valid
- Ensure service worker is registered
- Check browser compatibility (Chrome, Edge, Safari 11.1+)

### Offline Mode Not Working

- Clear service worker cache in DevTools → Application → Service Workers
- Check that assets are being cached (Application → Cache Storage)
- Verify service worker is active and running

## Browser Support

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (iOS 11.3+, macOS 11.1+)
- ✅ Firefox (Desktop & Mobile)
- ⚠️ Some features may vary by browser

## Security

- Service worker only works over HTTPS (or localhost)
- All data remains local (localStorage)
- No data is sent to external servers except OpenAI API

