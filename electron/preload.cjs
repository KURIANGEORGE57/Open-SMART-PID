const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Send events to main process
  send: (channel, data) => {
    const validChannels = ['save-file', 'open-file', 'export-image'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  // Receive events from main process
  receive: (channel, func) => {
    const validChannels = [
      'menu-new',
      'menu-open',
      'menu-save',
      'menu-undo',
      'menu-redo',
      'menu-export-png',
      'menu-export-svg',
      'menu-export-json',
      'menu-about',
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },

  // Platform info
  platform: process.platform,
  isElectron: true,
});
