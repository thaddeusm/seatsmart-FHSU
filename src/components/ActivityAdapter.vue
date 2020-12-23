<template>
	<div class="container">
		<NoteForm 
			v-if="addNotes" 
			:students="genuineParticipants" 
			type="multiple modal"
			v-on:trigger-modal-close="$emit('trigger-modal-close')"
		/>
		<div class="activity-container" v-else>
			<section id="activityHeader">
				<h1>{{ abbreviatedName(activity.name) }}</h1>
			</section>
			<section :class="[activity.activityType.split(' ').join('-'), activityStage == 'started' ? 'activity-body-narrow':'activity-body-wide', activityStage == 'ended' ? 'activity-body-narrow':'activity-body-wide']">
				<section id="activityBanner">
					
				</section>
				<section class="activity-display">
					<section class="button-container" v-if="allowAnonymous && activityStage == 'configuring'">
						<h3>Launch</h3>
						<div>
							<select name="launch" v-model="launchChoice">
								<option 
									v-for="(launchOption, index) in launchOptions" 
									:value="launchOption"
									:key="`option${index}`"
								>
									{{ launchOption.label }}
								</option>
							</select>
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
						<h3 v-if="roomID !== ''">Scan to Connect</h3>
						<h3 v-else>Connecting...</h3>
						<div v-if="roomID !== ''" class="qr-area" @click="copyToClipboard(`https://activities.seatsmart.tech/code/${roomID}`)">
							<qriously 
								id="qr"
								:value="`https://activities.seatsmart.tech/code/${roomID}`"
								:size="200" 
							/>
						</div>
						<div v-else id="loading">
							
						</div>
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
								:disabled="connectedUsers.length == 0"
							>
								start
							</button>
						</div>
					</section>
					<section class="results-container" v-if="activityStage == 'started'">
						<h3 v-if="connected">Collecting Responses</h3>
						<h3 v-else>Disconnected...Trying to Reconnect</h3>
						<div v-if="activity.activityType == 'survey'">
							<vc-donut
								background="black" foreground="black"
								:size="250" unit="px" :thickness="20"
								has-legend legend-placement="left"
								:sections="donutSections" :total="responses.length"
								v-if="responses.length > 0"
							>
								<h5 v-if="responses.length == 1">1 response</h5>
								<h5 v-else>{{ responses.length }} responses</h5>
							</vc-donut>
						</div>
						<div v-if="activity.activityType == 'response pool'">
							<ul v-if="responses.length > 0">
								<li v-for="(response, index) in responses" v-if="hiddenResponses.indexOf(index) === -1">
									<button class="delete-response-button" @click="deleteResponse(index)" disabled>
										<img src="@/assets/delete.svg" alt="delete icon">
									</button>
									<h1 @click="copyToClipboard(response.response)">{{ response.response }}</h1>
									<button class="hide-button" @click="hideResponse(index)">
										<img src="@/assets/hide.svg" alt="hide icon">
									</button>
								</li>
							</ul>
							<button v-if="responses.length > 0" class="show-all-button" @click="hiddenResponses = []" :disabled="hiddenResponses.length == 0">
								show all
							</button>
						</div>
						<div v-if="activity.activityType == 'information gap'">
							<vc-donut
								background="black" foreground="black"
								:size="250" unit="px" :thickness="20"
								:sections="assignmentDonutSections" :total="responses.length"
								v-if="responses.length > 0"
							>
							</vc-donut>
						</div>
						<div v-if="activity.activityType == 'word cloud'">
							<vue-word-cloud
							  style="
							    height: 280px;
							    width: 100%;
							    margin: 45px auto -15px auto;
							  "
							  :words="wordCloudWordArray"
							  :color="([, weight]) => weight > 6 ? '#FCBB04' : weight > 3 ? '#D2360A' : '#E5E5E5'"
							  font-family="ArchivoNarrow"
							  v-if="responses.length > 0"
							  @click="toggleWordCloudView"
							/>
						</div>
						<section id="waitingForResponses" v-if="responses.length == 0"></section>
						<div class="actions-wrapper">
							<button 
								class="action-button cancel-button"
								@click="endActivity"
								:disabled="ending"
							>
								end {{ activity.activityType }}
							</button>
						</div>
					</section>
					<section class="results-container" v-if="activityStage == 'ended'">
						<h3>Final Results</h3>
						<div v-if="activity.activityType == 'survey'">
							<vc-donut
								background="black" foreground="black"
								:size="250" unit="px" :thickness="20"
								has-legend legend-placement="left"
								:sections="donutSections" :total="responses.length"
							>
								<h5 v-if="responses.length == 1">1 response</h5>
								<h5 v-else>{{ responses.length }} responses</h5>
							</vc-donut>
						</div>
						<div v-if="activity.activityType == 'response pool'">
							<ul v-if="responses.length > 0">
								<li v-for="(response, index) in responses" v-if="hiddenResponses.indexOf(index) === -1" :key="`response${index}`">
									<button class="delete-response-button" @click="deleteResponse(index)">
										<img src="@/assets/delete.svg" alt="delete icon">
									</button>
									<h1 @click="copyToClipboard(response.response)">{{ response.response }}</h1>
									<button class="hide-button" @click="hideResponse(index)">
										<img src="@/assets/hide.svg" alt="hide icon">
									</button>
								</li>
							</ul>
							<button v-if="responses.length > 0" class="show-all-button" @click="hiddenResponses = []" :disabled="hiddenResponses.length == 0">
								show all
							</button>
						</div>
						<div v-if="activity.activityType == 'word cloud'">
							<vue-word-cloud
							  style="
							    height: 280px;
							    width: 100%;
							    margin: 45px auto -15px auto;
							  "
							  :words="wordCloudWordArray"
							  :color="([, weight]) => weight > 6 ? '#FCBB04' : weight > 3 ? '#D2360A' : '#E5E5E5'"
							  font-family="ArchivoNarrow"
							  v-if="responses.length > 0"
							/>
						</div>
						<div v-if="activity.activityType == 'information gap'">
							<vc-donut
								background="black" foreground="black"
								:size="250" unit="px" :thickness="20"
								:sections="assignmentDonutSections" :total="responses.length"
							>
							</vc-donut>
						</div>
						<div class="actions-wrapper" v-if="allowAnonymous">
							<button 
								class="action-button cancel-button"
								@click="$emit('trigger-modal-close')"
							>
								close
							</button>
						</div>
						<div class="actions-wrapper" v-else>
							<button 
								class="action-button cancel-button"
								@click="$emit('trigger-modal-close')"
							>
								close without notes
							</button>
							<button 
								class="action-button launch-button"
								@click="beginAddNotes"
								v-if="responses.length > 0"
							>
								add participation notes
							</button>
						</div>
					</section>
					<section class="user-info" v-if="activityStage == 'launched'">
						<div id="userCountSpace">
							<img v-if="connected" src="@/assets/usersconnected.svg" alt="users icon" class="users-icon">
							<img v-else src="@/assets/usersdisconnected.svg" alt="users icon" class="users-icon">
							<h3>{{ connectedUsers.length }}</h3>
							<h5 v-if="launchChoice.id !== 'anonymously' && mostRecentlyConnectedStudent !== ''" id="mostRecentlyConnectedStudent">
								{{ mostRecentlyConnectedStudent }}
							</h5>
						</div>
					</section>
					<div v-if="activity.options.hasOwnProperty('timeLimit')">
						<Countdown 
							id="countdown"  
							v-if="activity.options.timeLimit.enabled && activityStage == 'started'"
							:countdownRunning="countdownStarted"
							:timeLimit="timeLimitInSeconds"
							v-on:countdown-ended="endActivity"
						/>
					</div>
				</section>
			</section>
		</div>
	</div>
</template>

<script>
import {clipboard} from 'electron'

import db from '@/db.js'
import sjcl from 'sjcl'
import moment from 'moment'
import VueWordCloud from 'vuewordcloud'

import NoteForm from '@/components/NoteForm.vue'
import Countdown from '@/components/Countdown.vue'

export default {
	name: 'ActivityAdapter',
	props: {
		activity: Object,
		allowAnonymous: Boolean,
		chart: String,
		students: Array,
		remoteConnected: Boolean,
		remoteStartActivity: Boolean
	},
	components: {
		NoteForm,
		Countdown,
		[VueWordCloud.name]: VueWordCloud,
	},
	data() {
		return {
			launchChoice: {id: '', label: ''},
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
			connected: false,
			mostRecentlyConnectedStudent: '',
			addNotes: false,
			hiddenResponses: [],
			countdownStarted: false,
			ending: false
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
		assignmentDonutSections() {
			let responses = this.responses
			let sections = []

			let spectrumIndex = 0

			// format survey choices into sections per donut chart API
			if (this.activity.activityType == 'information gap') {
				for (let i=0; i<this.activity.content.assignments.length; i++) {
					if (spectrumIndex == this.donutSectionColorSpectrum.length) {
                        spectrumIndex = 0
                    }

					let obj = {
						value: 0,
						label: `item ${i + 1}`,
						color: this.donutSectionColorSpectrum[spectrumIndex]
					}

					sections.push(obj)
					
					spectrumIndex++
				}

				// increment section values based upon participant responses
				for (let j=0; j<responses.length; j++) {
					for (let k=0; k<sections.length; k++) {
						if (sections[k].label == `item ${parseInt(responses[j].assignment) + 1}`) {
							sections[k].value++
							break
						}
					}
				}
			}

			return sections
		},
		wordCloudWordArray() {
			let responses = this.responses
			let wordDictionary = {}

			// increment word weights based upon participant responses
			for (let i=0; i<responses.length; i++) {
				let response = responses[i]
				if (wordDictionary.hasOwnProperty([response.response])) {
					wordDictionary[response.response]++
				} else {
					wordDictionary[response.response] = 1
				}
			}

			let keys = Object.keys(wordDictionary)
			let values = Object.values(wordDictionary)

			return keys.map((key, index) => {
				return [key, values[index]]
			})
		},
		responsesInDBFormat() {
			return this.responses.map((response) => {
				let simpleResponseObj
				if (this.launchChoice.id == 'anonymously') {
					if (this.activity.activityType == 'survey') {
						simpleResponseObj = { choice: response.choice }

						return {
							respondent: 'anonymous',
							response: simpleResponseObj
						}
					} else if (this.activity.activityType == 'information gap') {
						simpleResponseObj = { assignment: response.assignment }

						return {
							respondent: 'anonymous',
							response: simpleResponseObj
						}
					} else {
						simpleResponseObj = { text: response.response }

						return {
							respondent: 'anonymous',
							response: simpleResponseObj
						}
					}
				} else {
					if (this.activity.activityType == 'survey') {
						simpleResponseObj = { choice: response.choice }

						return {
							respondent: response.student,
							response: simpleResponseObj
						}
					} else if (this.activity.activityType == 'information gap') {
						simpleResponseObj = { assignment: response.assignment }

						return {
							respondent: response.student,
							response: simpleResponseObj
						}
					} else {
						simpleResponseObj = { text: response.response }

						return {
							respondent: response.student,
							response: simpleResponseObj
						}
					}
				}
			})
		},
		genuineParticipants() {
			let allResponses = this.responses

			if (this.activity.activityType == 'survey') {
				let responseArray = allResponses.filter(response => {
					return response.choice !== ''
				})

				// provide only student DB ids to Note Form
				return responseArray.map(response => {
					return response.student.id
				})
			} else {
				// provide only student DB ids to Note Form
				return allResponses.map(response => {
					return response.student.id
				})
			}
		},
		timeLimitInSeconds() {
			if (this.activity.options.hasOwnProperty('timeLimit') && this.activity.options.timeLimit.enabled) {
				let minutes = parseInt(this.activity.options.timeLimit.minutes)
				let seconds = parseInt(this.activity.options.timeLimit.seconds)

				if (minutes > 0) {
					let minutesToSeconds = minutes * 60
					return minutesToSeconds + seconds
				} else {
					return seconds
				}
			} else {
				return undefined
			}
		},
		assignmentsByHighlight() {
			if (this.activity.activityType == 'information gap') {
				let colors = [
	                '#04fcbb',
	                '#0445fc',
	                '#04c1fc',
	                '#73006c',
	                '#bb04fc',
	                '#ff3af2',
	                '#c1fc04',
	                '#04fc3f',
	                '#00a10b',
	                '#fc7d04',
	                '#fc0445',
	                '#b10230',
	                '#878379',
	                '#FFFFFF',
	                '#E5E5E5'
	            ]
				let highlightDictionary = {}
				let assignments = this.shuffle(this.activity.content.assignments)

				let assignmentIndex = 0

				// iterate over shuffled list of assignments to minimize repetition
				for (let i=0; i<colors.length; i++) {
					if (assignmentIndex == colors.length || assignmentIndex == assignments.length) {
						assignmentIndex = 0
					}
					highlightDictionary[colors[i]] = assignmentIndex
					assignmentIndex++
				}

				return highlightDictionary
			} else {
				return undefined
			}
		},
		assignmentsByStudent() {
			if (this.activity.activityType == 'information gap' && this.launchChoice.id !== 'anonymously') {
				let assignmentDictionary = {}
				let assignments = this.shuffle(this.activity.content.assignments)

				let assignmentIndex = 0

				// iterate over shuffled list of assignments to minimize repetition
				for (let i=0; i<this.students.length; i++) {
					let student = this.students[i].id

					assignmentDictionary[student] = assignmentIndex
					
					if (assignmentIndex < assignments.length - 1) {
						assignmentIndex++
					} else {
						assignmentIndex = 0
					}
				}

				return assignmentDictionary
			} else {
				return undefined
			}
		}
	},
	watch: {
		mostRecentlyConnectedStudent(newValue, oldValue) {
			this.$emit('update-connected-users', newValue)
		},
		responses(newValue, oldValue) {
			this.$emit('update-activity-responses', newValue)
		},
		activityStage(newValue, oldValue) {
			this.$emit('update-activity-status', newValue)
		},
		remoteStartActivity(newValue, oldValue) {
			if (newValue == true) {
				this.startActivity()
			}
		}
	},
	methods: {
		launchActivity() {
			if (this.launchChoice.id == 'anonymously') {
				this.activityStage = 'launched'
				this.$socket.emit('createActivityRoom')
			} else {
				// route to chart and launch
				this.$router.push({
					name: 'chart',
					params: {id: this.launchChoice.id},
					query: {activityToLaunch: this.activity._id}
				})
			}
		},
		startActivity() {
			// allow connected devices to start activity
			this.$socket.emit('sendStartSignal')
			// display live results view
			this.activityStage = 'started'

			if (this.activity.options.hasOwnProperty('timeLimit')) {
				// start countdown, if enabled
				if (this.activity.options.timeLimit.enabled) {
					let scope = this
					setTimeout(function() {
						scope.countdownStarted = true
					}, 3500, scope)
				}
			}
		},
		endActivity() {
			this.$socket.emit('endActivitySession')

			this.ending = true

			let scope = this
			setTimeout(function() {
				scope.saveActivitySession()
			}, 10000, scope)
		},
		saveActivitySession() {
			if (this.activityStage !== 'ended') {
				// set the DB property to 'anonymous' if no chart prop value
				let chartStatus

				if (this.chart == undefined) {
					chartStatus = 'anonymous'
				} else {
					chartStatus = this.chart
				}

				db.createSomething('activitySessions', {
					date: moment(),
					activity: this.activity,
					responses: this.responsesInDBFormat,
					chart: chartStatus
				}).then(() => {
					this.activityStage = 'ended'
				})
			}
		},
		cancelActivity() {
			if (this.chart !== undefined) {
				this.$emit('cancel-activity')
			} else {
				this.$emit('trigger-modal-close')
			}

			this.$socket.emit('cancelActivity')

			// persist socket if remote is connected
			if (this.chart == '') {
				this.$socket.close()
			}
		},
		encrypt(data) {
            return sjcl.encrypt(this.roomID, JSON.stringify(data))
        },
        decrypt(data) {
            let decrypted = sjcl.decrypt(this.roomID, data)

            return JSON.parse(decrypted)
        },
        beginAddNotes() {
        	// display bulk note component
        	this.addNotes = true
        },
        addResponse(response) {
        	if (this.activity.activityType !== 'response pool') {
        		this.responses.push(response)
        	} else {
        		// push response to the top of the list for better UX
        		this.responses.unshift(response)
        	}
        },
        hideResponse(index) {
        	this.hiddenResponses.push(index)
        },
        deleteResponse(index) {
        	this.responses.splice(index, 1)
        },
        abbreviatedName(name) {
            if (name.length > 15) {
                return name.slice(0, 15) + '...'
            } else {
            	return name
            }
        },
        shuffle(arr) {
        	let j, x, i
		    for (i = arr.length - 1; i > 0; i--) {
		        j = Math.floor(Math.random() * (i + 1))
		        x = arr[i]
		        arr[i] = arr[j]
		        arr[j] = x
		    }

		    return arr
        },
        mergeResponses(arrayOfResponses) {
        	if (arrayOfResponses.length > this.responses.length) {
        		this.responses = arrayOfResponses
        	}

        	this.saveActivitySession()
        },
        copyToClipboard(response) {
        	clipboard.write({text: response})
        },
        toggleWordCloudView() {
        	console.log('clicked')
        }
	},
	sockets: {
		activityRoomEstablished(roomID) {
			this.roomID = roomID
			this.connected = true
		},
		activityDeviceConnected(deviceID) {
			if (this.connectedUsers.indexOf(deviceID) == -1) {
				this.connectedUsers.push(deviceID)
			}
		},
		activityDataRequested() {
			let data

			if (this.activity.activityType == 'survey') {
				if (this.launchChoice.id == 'anonymously') {
					data = {
						activityType: this.activity.activityType,
						activityData: {
							timeLimit: this.activity.options.timeLimit,
							prompt: this.activity.content.prompt,
							choices: this.activity.content.choices
						},
						activityMode: this.launchChoice.id,
						activityDate: moment()
					}
				} else {
					data = {
						activityType: this.activity.activityType,
						activityData: {
							timeLimit: this.activity.options.timeLimit,
							prompt: this.activity.content.prompt,
							choices: this.activity.content.choices
						},
						activityMode: this.launchChoice.id,
						activityDate: moment(),
						students: this.students
					}
				}
			} else if (this.activity.activityType == 'response pool') {
				if (this.launchChoice.id == 'anonymously') {
					data = {
						activityType: this.activity.activityType,
						activityData: {
							timeLimit: this.activity.options.timeLimit,
							prompt: this.activity.content.prompt,
							example: this.activity.content.example,
							allowMultipleResponses: this.activity.options.allowMultipleResponses
						},
						activityMode: this.launchChoice.id,
						activityDate: moment()
					}
				} else {
					data = {
						activityType: this.activity.activityType,
						activityData: {
							timeLimit: this.activity.options.timeLimit,
							prompt: this.activity.content.prompt,
							example: this.activity.content.example,
							allowMultipleResponses: this.activity.options.allowMultipleResponses
						},
						activityMode: this.launchChoice.id,
						activityDate: moment(),
						students: this.students
					}
				}
			} else if (this.activity.activityType == 'word cloud') {
				if (this.launchChoice.id == 'anonymously') {
					data = {
						activityType: this.activity.activityType,
						activityData: {
							timeLimit: this.activity.options.timeLimit,
							prompt: this.activity.content.prompt,
							example: this.activity.content.example,
							allowMultipleResponses: this.activity.options.allowMultipleResponses
						},
						activityMode: this.launchChoice.id,
						activityDate: moment()
					}
				} else {
					data = {
						activityType: this.activity.activityType,
						activityData: {
							timeLimit: this.activity.options.timeLimit,
							prompt: this.activity.content.prompt,
							example: this.activity.content.example,
							allowMultipleResponses: this.activity.options.allowMultipleResponses
						},
						activityMode: this.launchChoice.id,
						activityDate: moment(),
						students: this.students
					}
				}
			} else {
				if (this.launchChoice.id == 'anonymously') {
					data = {
						activityType: this.activity.activityType,
						activityData: {
							assignByHighlight: this.activity.options.assignByHighlight,
							assignmentsByHighlight: this.assignmentsByHighlight,
							prompt: this.activity.content.prompt,
							assignments: this.activity.content.assignments
						},
						activityMode: this.launchChoice.id,
						activityDate: moment()
					}
				} else {
					data = {
						activityType: this.activity.activityType,
						activityData: {
							assignByHighlight: this.activity.options.assignByHighlight,
							assignmentsByHighlight: this.assignmentsByHighlight,
							assignmentsByStudent: this.assignmentsByStudent,
							prompt: this.activity.content.prompt,
							assignments: this.activity.content.assignments
						},
						activityMode: this.launchChoice.id,
						activityDate: moment(),
						students: this.students
					}
				}
			}
			this.$socket.emit('activityDataIncoming', this.encrypt(data))
		},
		incomingResponseData(encryptedData) {
			let decrypted = this.decrypt(encryptedData)
			
			this.addResponse(decrypted)
		},
		incomingResponses(encryptedArray) {
			let decryptedArray = []

			for (let i=0; i<encryptedArray.length; i++) {
				let decrypted = this.decrypt(encryptedArray[i])

				decryptedArray.push(decrypted)
			}

			this.mergeResponses(decryptedArray)

			this.$socket.emit('confirmResponsesReceipt')
		},
		disconnect() {
			this.connected = false
			this.$socket.emit('rejoinActivityRoom', this.roomID)
		},
		rejoinedActivityRoom() {
			this.connected = true

			if (this.activityStage == 'started') {
				this.startActivity()
			}
		},
		deviceDisconnection(disconnectedSocketID) {
			let target = this.connectedUsers.indexOf(disconnectedSocketID)
			if (target !== -1) {
				this.connectedUsers.splice(target, 1)
			}
		},
		activityStatusRequested(requestingDevice) {
			if (this.activityStage == 'started') {
				this.startActivity()
			} else if (this.activityStage == 'ended') {
				this.$socket.emit('rejectDeviceParticipation', requestingDevice)
			}
		},
		incomingUsername(encryptedFullName) {
			let fullName = this.decrypt(encryptedFullName)
			this.mostRecentlyConnectedStudent = `${fullName.firstName} ${fullName.lastName}`
		}
	},
	mounted() {
		if (this.allowAnonymous) {
			this.launchChoice = {id: 'anonymously', label: 'anonymously'}
		} else {
			this.activityStage = 'launched'
			this.$socket.emit('createActivityRoom')
		}
	}
}
</script>

<style scoped>
.container {
	width: 100%;
	height: 100%;
}

.activity-container {
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
	grid-template-columns: 70% 30%;
	align-items: center;
	grid-template-areas: "banner display";
}

.activity-body-narrow {
	grid-area: body;
	display: grid;
	grid-template-columns: 30% 70%;
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
	padding: 20px 15px;
	background: var(--dark-gray);
	color: var(--white);
	font-weight: 50;
	width: 85%;
	margin: 0 auto;
	border-radius: 5px;
	box-shadow: 0px 0px 5px var(--black);
}

.results-container > h3 {
	text-align: center;
	margin-bottom: 20px;
}

.results-container > .actions-wrapper {
	margin-top: 40px;
}

.actions-wrapper {
	text-align: center;
}

ul {
	list-style: none;
	height: 230px;
	overflow: auto;
}

li {
	display: grid;
	grid-template-columns: 10% 1fr 10%;
	background: var(--gray);
	padding: 10px;
	margin: 15px 0;
	align-items: center;
	justify-content: center;
}

h4:hover {
	cursor: grab;
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

.show-all-button {
	display: block;
	font-size: 16px;
	padding: 5px 12px;
	border-radius: 5px;
	cursor: pointer;
	box-shadow: 0px 0px 1px var(--black);
	outline: none;
	background: var(--yellow);
	color: var(--black);
	margin: 10px auto;
}

.launch-button {
	background: var(--yellow);
	color: var(--black);
}

.cancel-button {
	background: var(--light-gray);
	color: var(--black);
}

.hide-button {
	background: none;
	cursor: pointer;
	outline: none;
	border: none;
	display: block;
}

.hide-button > img {
	height: 20px;
	vertical-align: middle;
}

.delete-response-button {
	background: none;
	cursor: pointer;
	outline: none;
	border: none;
	display: block;
}

.delete-response-button > img {
	height: 14px;
	padding: 3px;
	vertical-align: middle;
	background: var(--white);
	border-radius: 2px;
}

.survey {
	background-image: url('~@/assets/survey-illustration.svg');
	background-repeat: no-repeat;
	background-size: cover;
	background-position: -300px 20px;
}

.response-pool {
	background-image: url('~@/assets/response-pool-illustration.svg');
	background-repeat: no-repeat;
	background-size: cover;
	background-position: 0 -20px;
}

.information-gap {
	background-image: url('~@/assets/information-gap-illustration.svg');
	background-repeat: no-repeat;
	background-size: cover;
	background-position: 0px -5px;
}

.word-cloud {
	background-image: url('~@/assets/word-cloud-illustration.svg');
	background-repeat: no-repeat;
	background-size: cover;
	background-position: -20px -50px;
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

.qr-area {
	cursor: pointer;
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

#waitingForResponses {
	height: 240px;
    width: 240px;
    margin: 20px auto;
    border-radius: 240px;
    border-top: 5px solid var(--light-gray);
    border-right: 5px solid var(--yellow);
    border-bottom: 5px solid var(--yellow);
    border-left: 5px solid var(--yellow);
    animation-name: spin;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
}

#loading {
	height: 180px;
    width: 180px;
    margin: 20px auto;
    border-radius: 180px;
    border-top: 5px solid var(--light-gray);
    border-right: 5px solid var(--yellow);
    border-bottom: 5px solid var(--yellow);
    border-left: 5px solid var(--yellow);
    animation-name: spin;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
}

select {
	width: 100%;
	margin: 20px 0;
}

button:disabled {
	opacity: .6;
	cursor: not-allowed;
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

#mostRecentlyConnectedStudent {
	margin-top: 15px;
	animation-name: fadeUp;
	animation-duration: 1s;
}

#countdown {
	text-align: center;
	margin-top: 20px;
}

@keyframes fadeUp {
	from {
		opacity: 0;
		transform: translateY(-20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.fade-enter-active, .fade-leave-active {
	transition: opacity .2s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
	opacity: 0;
}
</style>
