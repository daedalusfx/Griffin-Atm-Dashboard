import { registerAppHandlers } from '@/lib/conveyor/handlers/app-handler'
import { registerServerHandlers } from '@/lib/conveyor/handlers/server-handler'
import { registerWindowHandlers } from '@/lib/conveyor/handlers/window-handler'
import appIcon from '@/resources/build/icon.png?asset'
import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { registerResourcesProtocol } from './protocols'
import { stopServer } from './server'


export function createAppWindow(): void {
  // Register custom protocol for resources
  registerResourcesProtocol();
  registerServerHandlers(); 


  // Create the main window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    backgroundColor: '#1c1c1c',
    icon: appIcon,
    frame: true,
    titleBarStyle: 'hiddenInset',
    title: 'Electron React App',
    maximizable: true,
    resizable: true,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
    },
  })

  // Register IPC events for the main window.
  registerWindowHandlers(mainWindow)
  registerAppHandlers(app)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  app.on('before-quit', () => {
    stopServer();
});

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
