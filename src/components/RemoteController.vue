<template>
	<div>
		<button v-if="passphrase == undefined" @click="openInitPanel">
			<img src="@/assets/remote.svg" alt="remote icon">
		</button>
		<button v-else @click="openStatusPanel">
			<img v-if="connected" src="@/assets/remoteconnect.svg" alt="remote connected icon">
			<img v-else-if="!connected && passphrase !== undefined" src="@/assets/remotedisconnect.svg" alt="remote disconnected icon">
		</button>
	</div>
</template>

<script>
import sjcl from 'sjcl'

export default {
	name: 'RemoteController',
	props: {
		passphrase: String,
		id: String,
		host: String,
		remote: String
	},
	data() {
		return {
			connected: false
		}
	},
	sockets: {
		remoteConnected() {
			this.connected = true
		},
		disconnect() {
			this.connected = false
		}
	},
	methods: {
		openInitPanel() {
			this.$emit('open-remote-panel')
			this.$socket.emit('action', {"message": "test"})
		},
		openStatusPanel() {
			this.$emit('open-remote-status-panel')
		},
		encrypt(data) {
			return sjcl.encrypt(this.passphrase, data)
		},
		decrypt(data) {
			return sjcl.decrypt(this.passphrase, data) 
		}
	},
	mounted() {
		
	}
}
</script>

<style scoped>
div {
	display: inline-block;
	float: right;
	margin-top: -45px;
	margin-right: 50px;
}

button {
    background: none;
    outline: none;
    border: none;
    cursor: pointer;
}

img {
	width: 25px;
}
</style>