module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      "appId": "com.thaddeusmccleary.seatsmart",
      "afterSign": "./afterSignHook.js",
      "mac": {
	      "entitlements": "./build/entitlements.mac.inherit.plist"
	   }
    }
  }
}