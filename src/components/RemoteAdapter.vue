<template>
	<section>
		<button @click="openPanel">
			<img v-if="!enabled" src="@/assets/remote.svg" alt="remote icon">
			<img v-else-if="enabled && connected" src="@/assets/remoteconnect.svg" alt="remote icon">
			<img v-if="enabled && !connected" src="@/assets/remotedisconnect.svg" alt="remote icon">
		</button>
	</section>
</template>

<script>
export default {
	name: 'RemoteAdapter',
	data() {
		return {
			enabled: false,
			connected: false,
			roomID: ''
		}
	},
	sockets: {
		roomEstablished(roomID) {
			this.roomID = roomID
			this.connected = true
			this.$emit('set-room-id', this.roomID)
		},
		rejoinedRoom() {
			this.connected = true
		},
		remoteConnected() {
			this.$emit('remote-connected')
		},
		disconnect() {
			this.connected = false
			this.$socket.emit('rejoinRoom', this.roomID)
		}
	},
	methods: {
		openPanel() {
			if (!this.enabled) {
				this.enabled = true

				this.$socket.emit('establishRoom')
			}

			this.$emit('open-remote-panel')
		}
	}
}
</script>

<style scoped>
section {
	position: fixed;
	top: 45px;
	right: 45px;
}

button {
	background: none;
	outline: none;
	border: none;
	cursor: pointer;
}

button > img {
	width: 30px;
}
</style>