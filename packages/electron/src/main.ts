import { app, BrowserWindow, Menu, shell } from 'electron';
import * as path from 'path';
import { startServer, stopServer } from './api-server';

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

/**
 * Create the main application window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'Invoice Generator',
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    backgroundColor: '#0f0f1a', // Match the dark theme
    show: false, // Don't show until ready
  });

  // Create application menu
  const menu = createMenu();
  Menu.setApplicationMenu(menu);

  // Load the app
  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    const webPath = path.join(process.resourcesPath, 'web', 'index.html');
    mainWindow.loadFile(webPath);
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Create application menu
 */
function createMenu(): Menu {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Invoice',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.executeJavaScript(
              'window.location.href = "/invoices/new"'
            );
          },
        },
        { type: 'separator' },
        {
          label: 'Refresh',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow?.reload();
          },
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Navigate',
      submenu: [
        {
          label: 'Invoices',
          click: () => {
            mainWindow?.webContents.executeJavaScript(
              'window.location.href = "/"'
            );
          },
        },
        {
          label: 'Companies',
          click: () => {
            mainWindow?.webContents.executeJavaScript(
              'window.location.href = "/companies"'
            );
          },
        },
        {
          label: 'Customers',
          click: () => {
            mainWindow?.webContents.executeJavaScript(
              'window.location.href = "/customers"'
            );
          },
        },
        {
          label: 'Services',
          click: () => {
            mainWindow?.webContents.executeJavaScript(
              'window.location.href = "/services"'
            );
          },
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Invoice Generator',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'About Invoice Generator',
              message: 'Invoice Generator',
              detail: `Version: ${app.getVersion()}\nA modern invoice management application built with Electron and React.`,
            });
          },
        },
        { type: 'separator' },
        {
          label: 'Developer Tools',
          accelerator: 'F12',
          click: () => {
            mainWindow?.webContents.toggleDevTools();
          },
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  try {
    // Start the embedded API server
    await startServer();
    console.log('✅ API server started');

    // Create the main window
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }

  app.on('activate', () => {
    // On macOS, re-create a window when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep the app running until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up before quitting
app.on('before-quit', async () => {
  await stopServer();
  console.log('✅ API server stopped');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
