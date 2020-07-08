'use strict'
// Electron JS modules
const { app, protocol, BrowserWindow, ipcMain: ipc, contents } = require('electron')
const { autoUpdater } = require("electron-updater")

// Vue JS modules
import {
  createProtocol,
} from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

// modules to support persistence
import path from 'path'
import Datastore from 'nedb'
const userDocs = app.getPath('documents')

// initialize datastores from local file system
global.classes = new Datastore({
  filename: `${userDocs}/Seatsmart/classes.db`,
  autoload: true
})

global.students = new Datastore({
  filename: `${userDocs}/Seatsmart/students.db`,
  autoload: true
})

global.notes = new Datastore({
  filename: `${userDocs}/Seatsmart/notes.db`,
  autoload: true
})

global.activities = new Datastore({
  filename: `${userDocs}/Seatsmart/activities.db`,
  autoload: true
})

global.activitySessions = new Datastore({
  filename: `${userDocs}/Seatsmart/activitySessions.db`,
  autoload: true
})

// provides build version information for use in UI
global.version = app.getVersion()

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to BrowserWindow instance
let win

// Standard scheme must be registered before the app is ready
// protocol.registerStandardSchemes(['app'], { secure: true })
protocol.registerSchemesAsPrivileged([{
  scheme: 'atom',
  privileges: {
    // The following setting
    // is causing the memoryleak
    standard: true
  }
}])


function createWindow () {
  // Create the frameless window but hide until load
  win = new BrowserWindow({
    'backgroundColor': '#000000',
    'show': false,
    'darkTheme': true,
    'vibrancy': 'dark',
    'fullscreenWindowTitle': true,
    'titleBarStyle': 'hiddenInset',
    webPreferences: { 
      webSecurity: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js') 
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')

  }

  // supports native-like menu toolbar
  require('./toolbarmenu')

  win.on('closed', () => {
    win = null
  })

  // trying to improve UX when connecting to a projector or secondary display
  win.on('restore', () => {
    let {width, height} = require('electron').screen.getPrimaryDisplay().size

    global.screenWidth = width
    global.screenHeight = height
    
    win.setSize(width, height)

    win.maximize()
  })

  // force BrowserWindow instance to fill screen before showing
  win.on('ready-to-show', function() {
      let {width, height} = require('electron').screen.getPrimaryDisplay().size

      global.screenWidth = width
      global.screenHeight = height
      win.setSize(width, height)
      win.maximize()
      win.setResizable(false)
      win.show()
      win.focus()

      // suppress network error messages
      autoUpdater.error = (msg) => {
        console.log(msg)
      }

      // suppress network error messages
      // following https://github.com/electron-userland/electron-builder/issues/2398
      process.on('uncaughtException', (msg) => {

      })

      autoUpdater.checkForUpdatesAndNotify()
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    await installExtension(VUEJS_DEVTOOLS)
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
