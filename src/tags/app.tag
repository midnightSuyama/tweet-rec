<app>
  <player></player>
  <schedule></schedule>
  <auth show={ global.state.isAuth != true }></auth>
  
  <script>
    global.electron    = require('electron')
    global.remote      = electron.remote
    global.ipcRenderer = electron.ipcRenderer
    electron.webFrame.setZoomLevelLimits(1, 1)
    
    ipcRenderer.on('update-state', (event, state) => {
      global.state = state
      this.update()
    })
  </script>
</app>
