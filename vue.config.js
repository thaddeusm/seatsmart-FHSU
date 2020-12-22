module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      preload: 'src/preload.js',
      builderOptions: {
      	"appId": "com.thaddeusmccleary.seatsmart",
     	  "afterSign": "electron-builder-notarize",
      	"mac": {
	        "hardenedRuntime" : true,
          "gatekeeperAssess": false,
          "entitlements": "./build/entitlements.mac.inherit.plist",
          "entitlementsInherit": "./build/entitlements.mac.inherit.plist",
          "target": {
              "target": "dir",
              "arch": "universal",
              "publish": ["github"]
          },
	   	  }
      }
    }
  }
}