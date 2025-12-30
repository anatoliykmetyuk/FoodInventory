# Mobile Testing Guide

This guide explains how to run the Food Inventory application locally and access it from your mobile device for testing.

## Overview

By default, Vite's development server only listens on `localhost`, which means it's only accessible from the same machine. To test on a mobile device, you need to:

1. Configure Vite to listen on your local network IP
2. Ensure your mobile device is on the same network
3. Access the app using your computer's local IP address

## Method 1: Using Vite's Host Option (Recommended)

### Step 1: Update Vite Configuration

Modify `vite.config.ts` to include the `host` option:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
  },
})
```

### Step 2: Find Your Local IP Address

**On macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Or use:
```bash
ipconfig getifaddr en0  # macOS (replace en0 with your interface)
```

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.x.x.x)

### Step 3: Start the Development Server

```bash
npm run dev
```

You should see output like:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

### Step 4: Access from Mobile Device

1. Ensure your mobile device is connected to the same Wi-Fi network as your computer
2. Open a browser on your mobile device
3. Navigate to the Network URL shown in the terminal (e.g., `http://192.168.1.100:5173/`)
4. The app should load on your mobile device

## Method 2: Using Command Line Flag

You can also specify the host directly when starting the dev server:

```bash
npm run dev -- --host
```

Or with a specific host:
```bash
npm run dev -- --host 0.0.0.0
```

## Method 3: Using Environment Variable

Add to your `package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:network": "vite --host 0.0.0.0"
  }
}
```

Then run:
```bash
npm run dev:network
```

## Troubleshooting

### Can't Access from Mobile Device

1. **Check Firewall Settings**
   - macOS: System Settings → Firewall → Allow incoming connections for Node
   - Windows: Windows Defender Firewall → Allow an app → Node.js
   - Linux: Configure `ufw` or `iptables` to allow port 5173

2. **Verify Same Network**
   - Ensure both devices are on the same Wi-Fi network
   - Some networks have "client isolation" enabled - disable it if possible

3. **Check IP Address**
   - Your IP address may change if you reconnect to Wi-Fi
   - Re-run the IP lookup command if connection fails

4. **Try Different Port**
   - If port 5173 is blocked, try a different port:
   ```bash
   npm run dev -- --port 3000 --host
   ```

### HTTPS Required (iOS Safari)

Some features (like camera access for receipt scanning) may require HTTPS. For local testing:

1. **Use ngrok** (recommended for HTTPS):
   ```bash
   # Install ngrok: https://ngrok.com/
   ngrok http 5173
   ```
   Use the HTTPS URL provided by ngrok on your mobile device.

2. **Use Vite's HTTPS** (requires certificate setup):
   ```typescript
   // vite.config.ts
   export default defineConfig({
     server: {
       https: true,
       host: '0.0.0.0',
     },
   })
   ```

### Performance Issues

- Mobile devices may be slower than desktop
- Use Chrome DevTools remote debugging to profile performance
- Check network tab for slow requests

## Security Note

⚠️ **Important**: When running with `--host 0.0.0.0`, your development server is accessible to anyone on your local network. Only use this in trusted network environments (like your home Wi-Fi). Never use this configuration on public networks.

## Quick Reference

```bash
# Find your IP (macOS)
ipconfig getifaddr en0

# Find your IP (Linux)
hostname -I | awk '{print $1}'

# Find your IP (Windows)
ipconfig | findstr IPv4

# Start dev server with network access
npm run dev -- --host

# Access from mobile
http://YOUR_IP_ADDRESS:5173
```

## Testing Checklist

When testing on mobile, verify:

- [ ] Navigation breadcrumbs appear correctly
- [ ] All buttons are easily tappable (minimum 44x44px)
- [ ] Forms are usable (no zoom on input focus)
- [ ] Dialogs are properly sized and scrollable
- [ ] Tables are readable and scrollable
- [ ] Charts render correctly
- [ ] Receipt scanning works (if using HTTPS)
- [ ] Touch interactions feel responsive
- [ ] Text is readable without zooming

