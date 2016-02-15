require('dotenv').config({ path: __dirname + '/../.env' })

import electron from 'electron'
const app           = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu          = electron.Menu
const Tray          = electron.Tray
const ipcMain       = electron.ipcMain

import Promise from 'bluebird'
const fs     = Promise.promisifyAll(require('fs'))
const mkdirp = Promise.promisifyAll(require('mkdirp'))
import path from 'path'

import TweetRec from './lib/tweet-rec'
global.tweetRec = new TweetRec()
tweetRec.distDir = path.join(app.getPath('appData'), app.getName(), 'csv')

var mainWindow = null
var appIcon    = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 320,
    height: 480,
    minWidth: 320,
    minHeight: 480,
    useContentSize: true
  })
  mainWindow.loadURL('file://' + __dirname + '/index.html')
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('update-state', store.getState())
  })
}

const showWindow = () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  } else {
    createWindow()
  }
}

const setupMenu = () => {
  let template = [
    {
      label: 'Twitter',
      submenu: [
        { label: 'Auth', click: () => store.dispatch(actions.showAuth()) }
      ]
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' },
        { type: 'separator' },
        { label: 'Bring All to Front', role: 'front' }
      ]
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        { label: 'Website', click: () => electron.shell.openExternal('https://github.com/midnightSuyama/tweet-rec') }
      ]
    }
  ]
  if (process.platform === 'darwin') {
    template.unshift({
      submenu: [
        { label: `About ${app.getName()}`, role: 'about' },
        { type: 'separator' },
        { label: 'Services', role: 'services', submenu: [] },
        { type: 'separator' },
        { label: `Hide ${app.getName()}`, accelerator: 'Command+H', role: 'hide' },
        { label: 'Hide Others', accelerator: 'Command+Alt+H', role: 'hideothers' },
        { label: 'Show All', role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: () => app.quit() }
      ]
    })
  }
  
  let menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

const setupTray = () => {
  let image = path.join(__dirname, '..', 'res', (process.platform === 'darwin' ? 'tray-22.png' : 'tray-32.png'))
  appIcon = new Tray(image)
  appIcon.setToolTip(app.getName())
  
  let template = [
    { label: 'Show', click: () => showWindow() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]
  let menu = Menu.buildFromTemplate(template)
  appIcon.setContextMenu(menu)
}

var shouldQuit = app.makeSingleInstance((argv, workingDirectory) => {
  showWindow()
})
if (shouldQuit) app.quit()

app.on('ready', () => {
  createWindow()
  setupMenu()
  setupTray()
}).on('activate', () => {
  showWindow()
}).on('window-all-closed', () => {})

// redux
import store from './store/configureStore'
import * as actions from './actions'

const stateCachePath = path.join(app.getPath('cache'), app.getName(), 'state.json')

store.subscribe(() => {
  if (mainWindow) {
    mainWindow.webContents.send('update-state', store.getState())
  }
  mkdirp.mkdirpAsync(path.dirname(stateCachePath)).then(() => {
    fs.writeFile(stateCachePath, JSON.stringify(store.getState()))
  })
})

ipcMain.on('dispatch-action', (event, action) => {
  store.dispatch(action)
})

fs.readFileAsync(stateCachePath).then(JSON.parse).then(state => {
  state.schedules.forEach(schedule => {
    store.dispatch(actions.addSchedule(schedule))
  })
})
