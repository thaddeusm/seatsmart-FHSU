const {Menu} = require('electron')
const electron = require('electron')
const app = electron.app

if (process.platform === 'darwin') { 
  var template = [{ 
    label: 'FromScratch', 
    submenu: [{ 
      label: 'Quit', 
      accelerator: 'CmdOrCtrl+Q', 
      click: function() { 
        app.quit(); 
      } 
    }] 
  }, { 
    label: 'Edit', 
    submenu: [{ 
      label: 'Undo', 
      accelerator: 'CmdOrCtrl+Z', 
      selector: 'undo:' 
    }, { 
      label: 'Redo', 
      accelerator: 'Shift+CmdOrCtrl+Z', 
      selector: 'redo:' 
    }, { 
      type: 'separator'
    }, { 
      label: 'Cut', 
      accelerator: 'CmdOrCtrl+X', 
      selector: 'cut:' 
    }, { 
      label: 'Copy', 
      accelerator: 'CmdOrCtrl+C', 
      selector: 'copy:'
    }, { 
      label: 'Paste', 
      accelerator: 'CmdOrCtrl+V', 
      selector: 'paste:' 
    }, { 
      label: 'Select All', 
      accelerator: 'CmdOrCtrl+A', 
      selector: 'selectAll:' 
    }] 
  }];
  var osxMenu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(osxMenu);
}