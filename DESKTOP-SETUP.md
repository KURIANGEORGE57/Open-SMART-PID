# Desktop Application Setup Guide

This guide will help you set up and run Smart P&ID as a desktop application on your PC.

## Prerequisites

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- At least 500MB of free disk space

## Installation Steps

### 1. Install Dependencies

Open a terminal/command prompt in the project directory and run:

```bash
npm install
```

This will install all required dependencies including Electron.

### 2. Run in Development Mode

To test the desktop app during development:

```bash
npm run electron:dev
```

This will:
- Start the Vite development server
- Launch the Electron desktop application
- Enable hot-reloading (changes to code will automatically reload the app)

### 3. Build Standalone Desktop App

To create a distributable desktop application:

#### For Windows:
```bash
npm run electron:build:win
```

This creates:
- `release/Smart P&ID Setup X.X.X.exe` - Windows installer
- `release/Smart P&ID X.X.X.exe` - Portable executable (no installation needed)

#### For macOS:
```bash
npm run electron:build:mac
```

This creates:
- `release/Smart P&ID-X.X.X.dmg` - macOS disk image installer
- `release/Smart P&ID-X.X.X-mac.zip` - Compressed application

#### For Linux:
```bash
npm run electron:build:linux
```

This creates:
- `release/Smart P&ID-X.X.X.AppImage` - Universal Linux executable
- `release/smart-pid_X.X.X_amd64.deb` - Debian/Ubuntu package
- `release/smart-pid-X.X.X.x86_64.rpm` - RedHat/Fedora package

## Features

### Desktop-Specific Features

- **Native Menus**: Traditional File, Edit, View, and Help menus
- **Keyboard Shortcuts**:
  - `Ctrl+N` (Cmd+N on Mac) - New Diagram
  - `Ctrl+O` (Cmd+O on Mac) - Open Diagram
  - `Ctrl+S` (Cmd+S on Mac) - Save Diagram
  - `Ctrl+Z` (Cmd+Z on Mac) - Undo
  - `Ctrl+Shift+Z` (Cmd+Shift+Z on Mac) - Redo
- **Offline Operation**: Works without internet connection
- **Better Performance**: Native app performance vs browser
- **File Association**: (Future) Double-click .spid files to open

### Platform-Specific Notes

#### Windows
- The installer creates a desktop shortcut and start menu entry
- Use the portable .exe if you don't want to install
- Windows Defender might show a warning on first run (this is normal for unsigned apps)

#### macOS
- First launch may require right-click → Open due to Gatekeeper
- The app is not code-signed, so you'll need to allow it in Security & Privacy settings
- Requires macOS 10.13 or higher

#### Linux
- AppImage is the easiest option - just make it executable and run:
  ```bash
  chmod +x Smart-P&ID-X.X.X.AppImage
  ./Smart-P&ID-X.X.X.AppImage
  ```
- .deb and .rpm packages integrate better with the system (menu entries, file associations)

## Troubleshooting

### App won't start
1. Make sure Node.js 18+ is installed: `node --version`
2. Delete `node_modules` and `package-lock.json`, then run `npm install` again
3. Check that port 3000 is not in use (for dev mode)

### Build fails
1. Make sure you have enough disk space (at least 500MB free)
2. On Linux, you may need to install additional dependencies:
   ```bash
   sudo apt-get install -y libgtk-3-0 libnotify4 libnss3 libxtst6 xdg-utils
   ```
3. Check the error message - it usually indicates what's missing

### App is slow or laggy
1. Make sure you're using the built version (`electron:build`), not dev mode
2. Close other resource-intensive applications
3. For large diagrams (100+ elements), consider breaking them into multiple sheets

## Customization

### Changing the App Icon

1. Create a 512x512 PNG image for your custom icon
2. Save it as `public/icon.png`
3. Rebuild the app: `npm run electron:build`

### Modifying the App Name

Edit `package.json`:
```json
{
  "name": "your-app-name",
  "build": {
    "productName": "Your App Name",
    "appId": "com.yourcompany.yourapp"
  }
}
```

Then rebuild the app.

## Distribution

### Signing Your App

For production distribution, you should code-sign your application:

- **Windows**: Requires a code-signing certificate from a trusted CA
- **macOS**: Requires Apple Developer account ($99/year)
- **Linux**: Generally not required, but can use GPG signing

See the [electron-builder documentation](https://www.electron.build/code-signing) for details.

### Auto-Updates

To add auto-update functionality:

1. Set up a release server or use GitHub Releases
2. Configure `electron-builder` for auto-updates
3. Implement update checking in `electron/main.js`

This is beyond the scope of the initial setup but is well-documented in electron-builder docs.

## Development Tips

### Debugging

- Press `F12` in the app to open Developer Tools
- Console logs from the renderer process appear in DevTools
- Main process logs appear in the terminal where you ran `electron:dev`

### Adding IPC Communication

To add communication between the UI and the Electron main process:

1. Add IPC handlers in `electron/main.js`
2. Expose them via `electron/preload.js`
3. Use `window.electronAPI` in your React code

See the existing menu handlers as examples.

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/your-org/smart-pid/issues)
- Read the main [README.md](README.md)
- Consult [Electron documentation](https://www.electronjs.org/docs/latest/)

## License

MIT License - See [LICENSE](LICENSE) for details.
