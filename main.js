const { app, BrowserWindow } = require('electron');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.setFullScreen(true);

  // Load the index.html file from the React app.
  win.loadURL('http://localhost:3000');

  // Open the DevTools.
  win.webContents.openDevTools();
}

// This is required for Electron apps.
app.whenReady().then(createWindow);