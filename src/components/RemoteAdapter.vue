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
		absentStudents: Array,
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
	watch: {
		// update remote client data after host actions
		students(newValue, oldValue) {
			this.sendData()
		},
		absentStudents(newValue, oldValue) {
			this.sendData()
		},
		randomStudent(newValue, oldValue) {
			this.sendData()
		}
	},
	sockets: {
		roomEstablished(roomID) {
			// store roomID in component and parent
			this.roomID = roomID
			this.connected = true
			this.$emit('connected')
			this.$emit('set-room-id', this.roomID)
		},
		rejoinedRoom() {
			// update UI after reconnecting(rejoining)
			this.connected = true
			this.$emit('connected')
		},
		remoteConnected() {
			// update UI after remote client connects(joins)
			this.connected = true
			this.$emit('remote-connected')
		},
		dataRequested() {
			this.sendData()
		},
		deviceDisconnection() {
			// update UI on remote disconnection
			this.connected = false
		},
		disconnect() {
			// update UI on host disconnection
			this.connected = false
			this.$emit('disconnected')

			// attempt to rejoin automatically
			this.$socket.emit('rejoinRoom', this.roomID)
		}
	},
	methods: {
		openPanel() {
			// open config panel on button click
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
        },
        sendData() {
        	// format and send data to client
        	let rawData = {
				classInfo: this.classInfo,
				students: this.students,
				randomStudent: this.randomStudent,
				behaviors: {
					positive: this.positiveBehaviors,
					negative: this.negativeBehaviors
				},
				absentStudents: this.absentStudents
			}

			this.$socket.emit('dataIncoming', this.encrypt(JSON.stringify(rawData)))
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