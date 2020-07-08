module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      preload: 'src/preload.js',
      builderOptions: {
      	"appId": "com.thaddeusmccleary.seatsmart",
     	  "afterSign": "electron-builder-notarize",
      	"mac": {
	        "entitlements": "./build/entitlements.mac.inherit.plist"
	   	  }
      }
    }
  }
}