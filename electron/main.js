const { app, BrowserWindow, dialog, session } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// Keep hardware acceleration on. Adapter availability still depends on the GPU/driver.
app.commandLine.appendSwitch('enable-unsafe-webgpu');
const entry = path.join(__dirname, '..', 'index.html');
const entryURL = pathToFileURL(entry).href;

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'Relief Forge Litho',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });
  // Remote libraries may run in the sandbox, never in a Node-enabled window.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    if (url !== entryURL) event.preventDefault();
  });
  win.webContents.on('did-fail-load', (_event, code, description) => {
    console.error(`Page failed to load (${code}): ${description}`);
  });
  win.loadFile(entry).catch(error => {
    console.error(error);
    dialog.showErrorBox('Could not open Relief Forge Litho', error.message);
  });
}

app.whenReady().then(() => {
  // Blob downloads from Save STL use the native Save As dialog, including overwrite checks.
  session.defaultSession.on('will-download', (_event, item) => {
    item.setSaveDialogOptions({
      title: 'Save export',
      defaultPath: path.join(app.getPath('downloads'), path.basename(item.getFilename())),
      filters: [{ name: 'STL model', extensions: ['stl'] }, { name: 'All files', extensions: ['*'] }]
    });
    item.once('done', (_event, state) => {
      if (state !== 'completed' && state !== 'cancelled') {
        dialog.showErrorBox('Export could not be saved', 'Please try Save STL again and choose a writable folder.');
      }
    });
  });
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
