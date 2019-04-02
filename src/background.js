'use strict'
// Electron JS modules
import { app, protocol, BrowserWindow } from 'electron'

// Vue JS modules
import {
  createProtocol,
  installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib'

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

// provides build version information for use in UI
global.version = '0.15'


const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to BrowserWindow instance
let win

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true })
function createWindow () {

  // Create the frameless window but hide until load
  win = new BrowserWindow({
    'frame': false,
    'backgroundColor': '#000000',
    'show': false,
    webPreferences: { webSecurity: false }
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

  // force BrowserWindow instance to fill screen before showing
  win.on('ready-to-show', function() {
      let {width, height} = require('electron').screen.getPrimaryDisplay().size

      global.screenWidth = width
      global.screenHeight = height
      win.maximize()
      win.setResizable(false)
      win.show()
      win.focus()
  });
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
    await installVueDevtools()
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
