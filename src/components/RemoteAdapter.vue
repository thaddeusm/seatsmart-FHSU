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
import sjcl from 'sjcl'

export default {
	name: 'RemoteAdapter',
	props: {
		classInfo: Object,
		students: Array,
		randomStudent: Number
	},
	data() {
		return {
			enabled: false,
			connected: false,
			roomID: ''
		}
	},
	computed: {
		positiveBehaviors() {
			return this.$store.state.preferences.positiveBehaviors
		},
		negativeBehaviors() {
			return this.$store.state.preferences.negativeBehaviors
		}
	},
	sockets: {
		roomEstablished(roomID) {
			this.roomID = roomID
			this.connected = true
			this.$emit('connected')
			this.$emit('set-room-id', this.roomID)
		},
		rejoinedRoom() {
			this.connected = true
			this.$emit('connected')
		},
		remoteConnected() {
			this.connected = true
			this.$emit('remote-connected')
		},
		dataRequested() {
			let rawData = {
				classInfo: this.classInfo,
				students: this.students,
				randomStudent: this.randomStudent,
				behaviors: {
					positive: this.positiveBehaviors,
					negative: this.negativeBehaviors
				}
			}

			this.$socket.emit('dataIncoming', this.encrypt(JSON.stringify(rawData)))
		},
		deviceDisconnection() {
			this.connected = false
		},
		disconnect() {
			this.connected = false
			this.$emit('disconnected')
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
		},
		encrypt(data) {
            return sjcl.encrypt(this.roomID, data)
        },
        decrypt(data) {
            return sjcl.decrypt(this.roomID, data)
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