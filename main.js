// main.js
const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js') // opcional
    }
  });

  win.loadFile('index.html');
}

// -------- AutoUpdater con progreso --------
autoUpdater.on('checking-for-update', () => {
  console.log('Buscando actualizaciones...');
});

autoUpdater.on('update-available', info => {
  console.log(`Actualización disponible: versión ${info.version}`);
  win.webContents.send('update-available', info);
});

autoUpdater.on('update-not-available', info => {
  console.log('No hay actualizaciones disponibles.');
});

autoUpdater.on('error', err => {
  console.error('Error al actualizar:', err);
});

autoUpdater.on('download-progress', progress => {
  // Muestra progreso en consola y opcionalmente en la ventana
  let message = `Descargando actualización: ${Math.round(progress.percent)}% (${Math.round(progress.transferred / 1024)}KB de ${Math.round(progress.total / 1024)}KB)`;
  console.log(message);
  win.webContents.send('download-progress', progress);
});

autoUpdater.on('update-downloaded', info => {
  console.log(`Actualización descargada: versión ${info.version}`);
  const choice = dialog.showMessageBoxSync(win, {
    type: 'question',
    buttons: ['Instalar ahora', 'Después'],
    title: 'Actualizar',
    message: `Nueva versión ${info.version} lista. ¿Instalar ahora?`
  });
  if (choice === 0) {
    autoUpdater.quitAndInstall();
  }
});

// -------- App ready --------
app.on('ready', () => {
  createWindow();

  // Solo checkear si estamos en app empaquetada (evita ruido en dev)
  if (!app.isPackaged) {
    console.log('Modo desarrollo - autoUpdater desactivado');
  } else {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

// -------- Cierre de ventanas --------
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
