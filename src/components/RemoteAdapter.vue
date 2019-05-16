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
import db from '@/db.js'
import moment from 'moment'

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
			roomID: '',
			receivedActions: []
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
			this.$emit('connected')

			let scope = this
			setTimeout(function() {
				scope.$emit('end-config')
			}, 10000)
		},
		dataRequested() {
			this.sendData()
			this.$emit('remote-connected')
			this.$emit('connected')
		},
		deviceDisconnection() {
			// update UI on remote disconnection
			this.connected = false
			this.$emit('disconnected')
		},
		disconnect() {
			// update UI on host disconnection
			this.connected = false
			this.$emit('disconnected')

			// attempt to rejoin automatically
			this.$socket.emit('rejoinRoom', this.roomID)
		},
		requestAction(action) {
			this.processActionRequest(this.decrypt(action))
			this.$emit('connected')
		},
		sessionEnded() {
			// reset config UI when host closes connection session
			this.enabled = false
			this.connected = false
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
            return sjcl.encrypt(this.roomID, JSON.stringify(data))
        },
        decrypt(data) {
            let decrypted = sjcl.decrypt(this.roomID, data)

            return JSON.parse(decrypted)
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

			this.$socket.emit('dataIncoming', this.encrypt(rawData))
        },
        initConfirm(id) {
        	// send confirmation that the action was completed to remote client
        	this.$socket.emit('initConfirm', this.encrypt(id))
        },
        processActionRequest(request) {
        	// switch to respond to action requests from remote client

        	// first ensure that the action is not a duplicate request
        	if (this.receivedActions.indexOf(request.id) == -1) {
        		this.receivedActions.push(request.id)

        		// use a string description as a switch
	        	switch (request.action.name) {
	        		
	        		case 'save note':
	        			// structure new note object according to db representation
	        			let newNote = {}

        				newNote.dateNoted = moment()
        				newNote.behavior = {
        					Abbreviation: request.action.data.behavior.Abbreviation,
        					Description: request.action.data.behavior.Description,
        					Weight: request.action.data.behavior.Weight
        				}
        				newNote.type = request.action.data.behavior.Type
        				newNote.comment = request.action.data.note
        				newNote.student = request.action.data.student

        				db.createSomething('notes', newNote)
        					.then(() => {
        						// send confirmation to remote client
        						this.initConfirm(request.id)

        						// trigger store mutation to rerender name card component
        						this.$store.dispatch('setLastUpdatedStudent', request.action.data.student)

        						// add action to log in parent component
        						this.$emit('action-completed', 'Saved new note')

        						// if the note is an absence, trigger name card component update
        						if (newNote.type === 'negative' && newNote.behavior.Abbreviation === 'A') {
									this.$emit('absence', newNote.student)
								}
        					})

	        			break
	        		case 'choose random':
	        			// send confirmation to remote client
	        			this.initConfirm(request.id)
	        			// trigger normal UI action in parent component
	        			this.$emit('select-random')
	        			// add action to log in parent component
        				this.$emit('action-completed', 'Selected a random student')
	        			break
	        		case 'disable random':
	        			// send confirmation to remote client
	        			this.initConfirm(request.id)
	        			// trigger normal UI action in parent component
	        			this.$emit('clear-random')
	        			break
	        	}
        	}
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