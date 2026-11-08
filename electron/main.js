const { app, BrowserWindow, dialog, session } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// Packaged portable builds unpack into %TEMP%\\<random>\\... On Windows,
// Chromium's sandbox often cannot start from there and the process aborts
// immediately (Event Viewer: APPCRASH, exception 0x80000003) after a brief
// taskbar flash. Do not force --enable-unsafe-webgpu either: WebGPU is
// available on modern Electron when the GPU supports it, and that flag has
// caused the same early CHECK abort.
if (app.isPackaged) {
  app.commandLine.appendSwitch('no-sandbox');
  app.commandLine.appendSwitch('disable-gpu-sandbox');
}

const entry = path.join(__dirname, '..', 'index.html');
const entryURL = pathToFileURL(entry).href;

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'Relief Forge Litho',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: !app.isPackaged,
      webSecurity: true
    }
  });
  win.once('ready-to-show', () => {
    if (!win.isDestroyed()) win.show();
  });
  setTimeout(() => {
    if (!win.isDestroyed() && !win.isVisible()) win.show();
  }, 4000);
  // Remote libraries may run in the sandbox, never in a Node-enabled window.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    if (url !== entryURL) event.preventDefault();
  });
  win.webContents.on('did-fail-load', (_event, code, description) => {
    console.error(`Page failed to load (${code}): ${description}`);
    dialog.showErrorBox('Could not open Relief Forge Litho', description);
  });
  win.webContents.on('render-process-gone', (_event, details) => {
    if (details.reason === 'clean-exit') return;
    dialog.showErrorBox(
      'Relief Forge Litho',
      `The window closed unexpectedly (${details.reason}).`
    );
  });
  win.loadFile(entry).catch(error => {
    console.error(error);
    dialog.showErrorBox('Could not open Relief Forge Litho', error.message);
  });
}

process.on('uncaughtException', error => {
  console.error(error);
  dialog.showErrorBox('Relief Forge Litho', error.message);
});

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
