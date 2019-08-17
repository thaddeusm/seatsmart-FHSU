<template>
	<div class="container">
		<section id="activityHeader">
			<h1>{{ activity.name }}</h1>
		</section>
		<section :class="[activity.activityType, activityStage == 'started' ? 'activity-body-narrow':'activity-body-wide']">
			<section id="activityBanner">
				
			</section>
			<section class="activity-display">
				<section class="button-container" v-if="allowAnonymous && activityStage == 'configuring'">
					<h3>Launch</h3>
					<div class="select-wrapper">
						<v-select 
							v-model="launchChoice" 
							:options="launchOptions"
						>
						</v-select>
					</div>
					<div class="actions-wrapper">
						<button 
							class="action-button cancel-button" 
							@click="$emit('trigger-modal-close')"
						>
							cancel
						</button>
						<button 
							class="action-button launch-button"
							@click="launchActivity"
						>
							go
						</button>
					</div>
				</section>
				<section class="button-container" v-if="activityStage == 'launched'">
					<h3>Connect Devices</h3>
					<qriously 
						v-if="roomID !== ''"
						id="qr"
						:value="`https://activities.seatsmart.tech/?room=${roomID}`"
						:size="200" 
					/>
					<section id="roomIDLoading" v-else></section>
					<div class="actions-wrapper">
						<button 
							class="action-button cancel-button" 
							@click="cancelActivity"
						>
							cancel
						</button>
						<button 
							class="action-button launch-button"
							@click="startActivity"
						>
							start
						</button>
					</div>
				</section>
				<section class="results-container" v-if="activityStage == 'started'">
					<vc-donut
						background="black" foreground="black"
						:size="250" unit="px" :thickness="20"
						has-legend legend-placement="left"
						:sections="donutSections" :total="connectedUsers.length"
					>
						<h1>{{ responseRatio }}%</h1>
						<h5>response</h5>
					</vc-donut>
					<div class="actions-wrapper">
						<button 
							class="action-button cancel-button"
							@click="endActivity"
						>
							end {{ activity.activityType }}
						</button>
					</div>
				</section>
				<section class="user-info" v-if="activityStage == 'launched'">
					<div v-if="launchChoice == 'anonymously'" id="userCountSpace">
						<img v-if="connected" src="@/assets/usersconnected.svg" alt="users icon" class="users-icon">
						<img v-else src="@/assets/usersdisconnected.svg" alt="users icon" class="users-icon">
						<h3>{{ connectedUsers.length }}</h3>
					</div>
				</section>
			</section>
		</section>
	</div>
</template>

<script>
import db from '@/db.js'
import sjcl from 'sjcl'
import moment from 'moment'

export default {
	name: 'ActivityAdapter',
	props: {
		activity: Object,
		allowAnonymous: Boolean
	},
	data() {
		return {
			launchChoice: '',
			activityStage: 'configuring',
			roomID: '',
			responses: [],
			connectedUsers: [],
			donutSectionColorSpectrum: [
				'#FCBB04',
				'#E5E5E5',
				'#D2360A',
				'#6C6C6C',
				'#B28402',
				'#FFFFFF',
				'#832206',
				'#FDCD48',
				'#F66239'
			],
			connected: false
		}
	},
	computed: {
		launchOptions() {
			let classIDs = Object.keys(this.$store.state.allClasses)
			let classCharts = Object.values(this.$store.state.allClasses)

			let arr = []

			for (let i=0; i<classIDs.length; i++) {
				if (!classCharts[i].archived) {
					arr.push({
						label: `in ${classCharts[i].name}`,
						id: classIDs[i]
					})
				}
			}

			arr.push({
				label: 'anonymously',
				id: 'anonymously'
			})

			return arr
		},
		donutSections() {
			let responses = this.responses

			let sections = []

			// format survey choices into sections per donut chart API
			if (this.activity.activityType == 'survey') {
				for (let i=0; i<this.activity.content.choices.length; i++) {
					let obj = {
						value: 0,
						label: this.activity.content.choices[i],
						color: this.donutSectionColorSpectrum[i]
					}

					sections.push(obj)
				}

				// increment section values based upon participant responses
				for (let j=0; j<responses.length; j++) {
					for (let k=0; k<sections.length; k++) {
						if (sections[k].label == responses[j].choice) {
							sections[k].value++
							break
						}
					}
				}
			}

			return sections
		},
		responseRatio() {
			let ratio = this.responses.length / this.connectedUsers.length

			let percentage = ratio * 100

			if (percentage > 0) {
				return percentage
			} else {
				return 0
			}
		}
	},
	methods: {
		launchActivity() {
			if (this.launchChoice == 'anonymously') {
				this.activityStage = 'launched'

				this.$socket.emit('createActivityRoom')

				// start immediately
			} else {
				// route to chart and launch
			}
		},
		startActivity() {
			// allow connected devices to start activity
			this.$socket.emit('sendStartSignal')
			// display live results view
			this.activityStage = 'started'
		},
		endActivity() {
			// save session info (todo)

			this.activityEnded = true
			this.$emit('trigger-modal-close')
		},
		cancelActivity() {
			this.$socket.emit('cancelActivity')
			this.$emit('trigger-modal-close')
		},
		encrypt(data) {
            return sjcl.encrypt(this.roomID, JSON.stringify(data))
        },
        decrypt(data) {
            let decrypted = sjcl.decrypt(this.roomID, data)

            return JSON.parse(decrypted)
        }
	},
	sockets: {
		activityRoomEstablished(roomID) {
			console.log(roomID)
			this.roomID = roomID
			this.connected = true
		},
		activityDeviceConnected(deviceID) {
			console.log('preview device connected')

			if (this.connectedUsers.indexOf(deviceID) == -1) {
				this.connectedUsers.push(deviceID)
			}
		},
		activityDataRequested() {
			console.log('data requested, sending...')

			let data

			if (this.activity.activityType == 'survey') {
				data = {
					activityType: this.activity.activityType,
					activityData: {
						timeLimit: this.activity.options.timeLimit,
						prompt: this.activity.content.prompt,
						choices: this.activity.content.choices
					},
					activityMode: this.launchChoice,
					activityDate: moment()
				}
			}

			this.$socket.emit('activityDataIncoming', this.encrypt(data))
		},
		incomingResponseData(encryptedData) {
			let decrypted = this.decrypt(encryptedData)
			console.log('Received response: ', decrypted)
			this.responses.push(decrypted)
		},
		disconnect() {
			this.connected = false
			this.$socket.emit('rejoinActivityRoom', this.roomID)
		},
		rejoinedActivityRoom() {
			console.log('rejoined room')
			this.connected = true
		},
		deviceDisconnection(disconnectedSocketID) {
			let target = this.connectedUsers.indexOf(disconnectedSocketID)
			console.log('an activity device disconnected')
			if (target !== -1) {
				this.connectedUsers.splice(target, 1)
			}
		},
		activityStatusRequested(requestingDevice) {
			if (this.activityStage == 'started') {
				this.startActivity()
			} else {
				this.$socket.emit('rejectDeviceParticipation', requestingDevice)
			}
		}
	},
	mounted() {
		if (this.allowAnonymous) {
			this.launchChoice = 'anonymously'
		}
	}
}
</script>

<style scoped>
.container {
	width: 100%;
	height: 100%;
	display: grid;
	grid-template-rows: 15% 85%;
	grid-template-areas: 
		"header"
		"body";
	background: rgba(255,255,255,1);
}

#activityHeader {
	text-align: center;
	grid-area: header;
	align-self: center;
}

.activity-body-wide {
	grid-area: body;
	display: grid;
	grid-template-columns: 66% 1fr;
	align-items: center;
	grid-template-areas: "banner display";
}

.activity-body-narrow {
	grid-area: body;
	display: grid;
	grid-template-columns: 47% 1fr;
	align-items: center;
	grid-template-areas: "banner display";
}

#activityBanner {
	min-height: 100%;
	grid-area: banner;
}

.activity-display {
	grid-area: display;
	align-self: flex-start;
}

.button-container {
	padding: 20px 15px;
	background: var(--dark-gray);
	width: 70%;
	margin: 0 auto;
	border-radius: 5px;
	box-shadow: 0px 0px 5px var(--black);
}

.button-container > h3 {
	color: var(--white);
	text-align: center;
}

.results-container {
	padding: 20px 5px;
	background: var(--dark-gray);
	color: var(--white);
	font-family: "ArchivoNarrow";
	width: 85%;
	margin: 0 auto;
	border-radius: 5px;
	box-shadow: 0px 0px 5px var(--black);
}

.results-container > .actions-wrapper {
	margin-top: 40px;
}

.select-wrapper {
	background: var(--white);
	border-radius: 4px;
	margin: 20px auto;
	color: var(--black);
	font-family: "ArchivoNarrow";
}

.actions-wrapper {
	text-align: center;
}

.action-button {
	font-size: 16px;
	padding: 5px 12px;
	border-radius: 5px;
	cursor: pointer;
	box-shadow: 0px 0px 1px var(--black);
	outline: none;
	margin: 0 5px;
}

.launch-button {
	background: var(--yellow);
	color: var(--black);
}

.cancel-button {
	background: var(--light-gray);
	color: var(--black);
}

.survey {
	background-image: url('~@/assets/survey-illustration.svg');
	background-repeat: no-repeat;
	background-size: cover;
	background-position: -300px 20px;
}

#qr {
	background: var(--white);
	box-shadow: 2px 2px 5px var(--black);
	width: 200px;
	height: 200px;
	margin: 25px auto;
	border-radius: 5px;
	vertical-align: middle;
}

#roomIDLoading {
    height: 190px;
    width: 190px;
    margin: 20px auto;
    border-radius: 200px;
    border-top: 5px solid var(--light-gray);
    border-right: 5px solid var(--yellow);
    border-bottom: 5px solid var(--yellow);
    border-left: 5px solid var(--yellow);
    animation-name: spin;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
}

@keyframes spin {
    from {transform: rotate(0);}
    to {transform: rotate(360deg);}
}

.user-info {
	padding: 20px 15px;
	width: 70%;
	margin: 0 auto;
}

#userCountSpace {
	text-align: center;
}

.users-icon {
	width: 35px;
}
</style>
