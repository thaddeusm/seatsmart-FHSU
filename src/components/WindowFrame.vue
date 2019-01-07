<template>
	<aside>
		<button @click="closeWindow"><img src="@/assets/close.svg" alt="close icon"></button>
		<button @click="minimizeWindow"><img src="@/assets/minimize.svg" alt="minimize icon"></button>
		<button @click="maximizeWindow"><img src="@/assets/maximize.svg" alt="maximize icon"></button>
	</aside>
</template>

<script>
const remote = require('electron').remote

export default {
	name: 'WindowFrame',
	methods: {
		closeWindow() {
			let window = remote.getCurrentWindow();
			window.close();
		},
		minimizeWindow() {
			let window = remote.getCurrentWindow();
			window.minimize();
		},
		maximizeWindow() {
			let window = remote.getCurrentWindow();
			window.maximize();
		}
	}
}
</script>

<style scoped>
::selection {
	background: none;
}

aside {
	height: 25px;
	width: 100%;
	position: fixed;
	top: 0;
	z-index: 2000;
  	-webkit-app-region: drag;
  	text-align: left;
}

button {
	background: none;
	border: none;
	outline: none;
	margin: 7px;
	padding: 7px;
	border-radius: 10px;
	-webkit-app-region: no-drag;
}

img {
	width: 10px;
	vertical-align: middle;
}
</style>