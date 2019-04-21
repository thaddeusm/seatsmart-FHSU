<template>
	<aside @dblclick="stretchWindow">
		<button @click="closeWindow"><img src="@/assets/close.svg" alt="close icon"></button>
		<button @click="minimizeWindow" :class="[maximized ? 'faded' : '']"><img src="@/assets/minimize.svg" alt="minimize icon"></button>
		<button v-if="maximized" @click="restoreWindow"><img src="@/assets/restore.svg" alt="restore icon"></button>
		<button v-else @click="maximizeWindow"><img src="@/assets/maximize.svg" alt="maximize icon"></button>
	</aside>
</template>

<script>
const {remote, screen} = require('electron')
import api from '@/preferences.js'

export default {
	name: 'WindowFrame',
	data() {
		return {
			maximized: false
		}
	},
	methods: {
		closeWindow() {
			let window = remote.getCurrentWindow()
			window.close()
		},
		minimizeWindow() {
			let window = remote.getCurrentWindow()
			window.minimize()
		},
		maximizeWindow() {
			let window = remote.getCurrentWindow()
			window.setFullScreen(true)

			this.stretchWindow()

			this.maximized = true
		},
		restoreWindow() {
			let window = remote.getCurrentWindow()

			if (window.isFullScreen()) {
				window.setFullScreen(false)
			} else {
				window.unmaximize()
			}

			this.stretchWindow()

			this.maximized = false
		},
		stretchWindow() {
			let window = remote.getCurrentWindow()

			let {width, height} = screen.getPrimaryDisplay().size
		    
		    window.setSize(width, height)
		    window.maximize()

		    // this helps reset dynamically calculated component sizes
		    setTimeout(function() {
		    	EventBus.$emit('stretch')
		    }, 800)
		}
	},
	mounted() {
		let window = remote.getCurrentWindow()

		if (window.isFullScreen()) {
			this.maximized = true
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

.faded {
	opacity: .5;
}
</style>
