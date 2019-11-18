<template>
	<div id="container">
		<header>
			<h1 ref="pageHeader" v-if="id == undefined">New {{ capitalizeString(activityChoice) }} Activity</h1>
			<h1 ref="pageHeader" v-else>Edit {{ capitalizeString(activityChoice) }} Activity</h1>
			<button class="modal-button" @click="infoModalOpen = true">more information</button>
		</header>
		<section id="activityChoice">
			<div class="activity-choice-container">
				<button class="activity-button" @click="chooseActivity('survey')" :class="[activityChoice == 'survey' ? 'selected' : '']" :disabled="progress !== 1">
					<img src="@/assets/survey-illustration.svg" alt="survey illustration">
					<h5>survey</h5>
				</button>
			</div>
			<div class="activity-choice-container">
				<button class="activity-button" @click="chooseActivity('response pool')" :class="[activityChoice == 'response pool' ? 'selected' : '']" :disabled="progress !== 1">
					<img src="@/assets/response-pool-illustration.svg" alt="response pool illustration">
					<h5>response pool</h5>
				</button>
			</div>
			<div class="activity-choice-container">
				<button class="activity-button" @click="chooseActivity('information gap')" :class="[activityChoice == 'information gap' ? 'selected' : '']" :disabled="progress !== 1">
					<img src="@/assets/information-gap-illustration.svg" alt="information gap illustration">
					<h5>information gap</h5>
				</button>
			</div>
		</section>
		<section id="border"></section>
		<section id="activityForm">
			<section id="errorArea">
				<h6><img v-if="alertMessage.length > 0" src="@/assets/alert.svg" alt="alert icon" class="alert-icon-small"> {{ alertMessage }}</h6>
			</section>
			<div v-if="activityChoice == 'survey'">
				<section class="form-one" v-if="progress == 1">
					<div class="form-container">
						<h3>Options</h3>
						<div class="input-wrapper">
							<h5>Name</h5>
							<input class="large-input" type="text" name="surveyName" v-model="surveyData.name" placeholder="Survey name...">
						</div>
						<div class="switch-wrapper">
							<h5>Time Limit</h5>
							<button :class="[surveyData.timeLimit.enabled ? 'on' : 'off' ,'switch']" @click="toggleTimer">
								<img src="@/assets/switch-circle.svg" alt="switch circle">
							</button>
							<div class="switch-config" v-if="surveyData.timeLimit.enabled">
								<div class="label-row">
									<span v-if="surveyData.timeLimit.minutes !== '1'">
										Minutes
									</span>
									<span v-else>
										Minute
									</span>
									<span v-if="surveyData.timeLimit.seconds !== '1'">
										Seconds
									</span>
									<span v-else>
										Second
									</span>
								</div>
								<div>
									<div class="form-group">
										<input class="small-input" type="number" min="0" max="59" name="timeLimitMinutes" v-model="surveyData.timeLimit.minutes">
										<input class="small-input" type="number" min="0" max="59" name="timeLimitSeconds" v-model="surveyData.timeLimit.seconds">
									</div>
								</div>
							</div>
						</div>
					</div>
					<section class="progress-button-area">
						<button class="progress-button" @click="routeBack"><img class="back-icon" src="@/assets/backarrowwhite.svg" alt="back icon"></button>
						<button class="progress-button" @click="changeProgress(2)">add survey content</button>
					</section>
				</section>
				<section class="form-two" v-if="progress == 2">
					<div class="form-container">
						<h3>Content</h3>
						<div class="input-wrapper">
							<h5>Prompt</h5>
							<input class="large-input" type="text" name="surveyPrompt" v-model="surveyData.prompt" placeholder="Prompt...">
						</div>
						<div class="input-wrapper" id="choicesArea">
							<h5>Choices</h5>
							<div class="form-group" v-for="(choice, index) in surveyData.choices">
								<input class="medium-input" type="text" :name="`surveyChoice${index}`" v-model="surveyData.choices[index]" placeholder="Choice...">
								<button class="delete-button" @click="removeSurveyChoice(index)" :disabled="index < 2">-</button>
							</div>
							<section id="addButtonArea">
								<button class="add-button" @click="addSurveyChoice" :disabled="surveyData.choices.length >= 9">+</button>
							</section>
						</div>
					</div>
					<section class="progress-button-area">
						<button class="progress-button" @click="routeBack"><img class="back-icon" src="@/assets/backarrowwhite.svg" alt="back icon"></button>
						<button class="progress-button" @click="startPreview">preview survey</button>
					</section>
				</section>
			</div>
			<div v-else-if="activityChoice == 'response pool'">
				<section class="form-one" v-if="progress == 1">
					<div class="form-container">
						<h3>Options</h3>
						<div class="input-wrapper">
							<h5>Name</h5>
							<input class="large-input" type="text" name="surveyName" v-model="responsePoolData.name" placeholder="Response Pool name...">
						</div>
						<div class="switch-wrapper">
							<h5>Allow Multiple Responses</h5>
							<button :class="[responsePoolData.allowMultipleResponses ? 'on' : 'off' ,'switch']" @click="toggleAllowMultipleResponses">
								<img src="@/assets/switch-circle.svg" alt="switch circle">
							</button>
						</div>
						<div class="switch-wrapper">
							<h5>Time Limit</h5>
							<button :class="[responsePoolData.timeLimit.enabled ? 'on' : 'off' ,'switch']" @click="toggleTimer">
								<img src="@/assets/switch-circle.svg" alt="switch circle">
							</button>
							<div class="switch-config" v-if="responsePoolData.timeLimit.enabled">
								<div class="label-row">
									<span v-if="responsePoolData.timeLimit.minutes !== '1'">
										Minutes
									</span>
									<span v-else>
										Minute
									</span>
									<span v-if="responsePoolData.timeLimit.seconds !== '1'">
										Seconds
									</span>
									<span v-else>
										Second
									</span>
								</div>
								<div>
									<div class="form-group">
										<input class="small-input" type="number" min="0" max="59" name="timeLimitMinutes" v-model="responsePoolData.timeLimit.minutes">
										<input class="small-input" type="number" min="0" max="59" name="timeLimitSeconds" v-model="responsePoolData.timeLimit.seconds">
									</div>
								</div>
							</div>
						</div>
					</div>
					<section class="progress-button-area">
						<button class="progress-button" @click="routeBack"><img class="back-icon" src="@/assets/backarrowwhite.svg" alt="back icon"></button>
						<button class="progress-button" @click="changeProgress(2)">add response pool content</button>
					</section>
				</section>
				<section class="form-two" v-if="progress == 2">
					<div class="form-container">
						<h3>Content</h3>
						<div class="input-wrapper">
							<h5>Prompt</h5>
							<input class="large-input" type="text" name="responsePoolPrompt" v-model="responsePoolData.prompt" placeholder="Prompt...">
						</div>
						<div class="input-wrapper">
							<h5>Example Response</h5>
							<input class="large-input" type="text" name="responsePoolExample" v-model="responsePoolData.example" placeholder="Example response...">
						</div>
					</div>
					<section class="progress-button-area">
						<button class="progress-button" @click="routeBack"><img class="back-icon" src="@/assets/backarrowwhite.svg" alt="back icon"></button>
						<button class="progress-button" @click="startPreview">preview response pool</button>
					</section>
				</section>
			</div>
			<div v-else>
				<section class="form-one" v-if="progress == 1">
					<div class="form-container">
						<h3>Options</h3>
						<div class="input-wrapper">
							<h5>Name</h5>
							<input class="large-input" type="text" name="informationGapName" v-model="informationGapData.name" placeholder="Information Gap name...">
						</div>
						<div class="switch-wrapper">
							<h5>Assign by Highlight Color</h5>
							<button :class="[informationGapData.assignByHighlight ? 'on' : 'off' ,'switch']" @click="toggleAssignByHighlight">
								<img src="@/assets/switch-circle.svg" alt="switch circle">
							</button>
						</div>
					</div>
					<section class="progress-button-area">
						<button class="progress-button" @click="routeBack"><img class="back-icon" src="@/assets/backarrowwhite.svg" alt="back icon"></button>
						<button class="progress-button" @click="changeProgress(2)">add information gap content</button>
					</section>
				</section>
				<section class="form-two" v-if="progress == 2">
					<div class="form-container">
						<h3>Content</h3>
						<div class="input-wrapper">
							<h5>Prompt</h5>
							<input class="large-input" type="text" name="informationGapPrompt" v-model="informationGapData.prompt" placeholder="Prompt...">
						</div>
						<div class="input-wrapper" id="choicesArea">
							<h5>Content to Assign</h5>
							<div class="form-group select-with-input" v-for="(assignment, index) in informationGapData.assignments">
								<select name="assignment" v-model="assignment.resourceType">
									<option value="text">text</option>
									<option value="url">URL</option>
									<option value="img">image</option>
								</select>
								<input 
									v-if="informationGapData.assignments[index].resourceType == 'text'"
									class="medium-input" 
									type="text" 
									:name="`assignment${index}`" 
									v-model="informationGapData.assignments[index].resourceData" 
									placeholder="Content..."
								>
								<input 
									v-else-if="informationGapData.assignments[index].resourceType == 'url'"
									class="medium-input" 
									type="text" 
									:name="`assignment${index}`" 
									v-model="informationGapData.assignments[index].resourceData" 
									placeholder="https://..."
								>
								<input 
									v-else
									class="medium-input" 
									type="text" 
									:name="`assignment${index}`" 
									v-model="informationGapData.assignments[index].resourceData" 
									placeholder="https://....jpeg"
								>
								<button class="delete-button" @click="removeInformationGapAssignment(index)" :disabled="index < 2">-</button>
							</div>
							<section id="addButtonArea">
								<button class="add-button" @click="addInformationGapAssignment">+</button>
							</section>
						</div>
					</div>
					<section class="progress-button-area">
						<button class="progress-button" @click="routeBack"><img class="back-icon" src="@/assets/backarrowwhite.svg" alt="back icon"></button>
						<button class="progress-button" @click="startPreview">preview information gap</button>
					</section>
				</section>
			</div>
			<div id="previewArea" v-if="progress == 3">
				<section class="form-container">
					<h3 v-if="previewRoomID == ''">Preview the {{ capitalizeString(activityChoice) }}</h3>
					<h3 v-else>Scan to Connect</h3>
					<qriously 
						v-if="previewRoomID !== ''"
						id="qr"
						:value="`https://activities.seatsmart.tech/code/${previewRoomID}`"
						:size="200" 
					/>
					<section id="roomIDLoading" v-else></section>
				</section>
				<section class="progress-button-area">
					<button class="progress-button" @click="routeBack"><img class="back-icon" src="@/assets/backarrowwhite.svg" alt="back icon"></button>
					<button class="progress-button" @click="saveActivity">save activity</button>
				</section>
			</div>
		</section>
		<section id="progressNodes">
			<ProgressNodes :steps="steps" :progress="progress" />
		</section>
        <Modal v-if="infoModalOpen" v-on:trigger-close="infoModalOpen = false" :dismissable="true" size="small">
            <template slot="content">
                <div class="activity-info">
                	<h2>
                		{{ activityChoice }}s
                	</h2>
                	<p>
                		The activities you launch through Seatsmart should not make students feel like they are taking a quiz.  Ideally, the process will be somewhat gamified and encourage willing participation.  Since students will be using their own devices to connect, it is important to communicate the short duration and specific purpose of your activities.
                	</p>
                	<p v-if="activityChoice == 'survey'">
                		Surveys are ideal when you would like to receive honest feedback as responses are tabulated without identifying the individual choices of your students.  You can provide up to nine choices, which will be displayed on the students' devices in the same order in which you list them in the form below.
                	</p>
                	<p v-else-if="activityChoice == 'response pool'">
                		Response pools offer an open-ended format for feedback, which can even be configured to allow students to submit multiple responses.  Responses will be displayed anonymously as they are received by your computer.  Two moderation options will be presented to you during the activity: hiding or deleting responses.
                	</p>
                	<p v-else>
                		Information Gaps provide a simple solution to a common aspect of a classroom activity - randomly distributing content.  Like other activities, this is meant to be used during simple, low-stakes tasks.  Also, if you use highlight colors to visually group students, you can have Seatsmart ensure that students with the same highlight color receive the same information gap assignment.
                	</p>
                </div>
            </template>
        </Modal>
		<TouchBar 
			:show="true" 
            :escapeItem="{type: 'button', label: 'back', method: function() {routeBack()}}"
        />
	</div>
</template>

<script>
import sjcl from 'sjcl'
import db from '@/db.js'
import moment from 'moment'

import Modal from '@/components/Modal.vue'
import ProgressNodes from '@/components/ProgressNodes.vue'
import TouchBar from '@/components/TouchBar.vue'

export default {
	name: 'ActivityCreation',
	components: {
		ProgressNodes,
		TouchBar,
		Modal
	},
	props: ['id'],
	data() {
		return {
			mode: 'new',
			progress: 1,
			steps: 3,
			alertMessage: '',
			activityChoice: 'survey',
			surveyData: {
				name: '',
				timeLimit: {
					enabled: true,
					minutes: '1',
					seconds: '0'
				},
				prompt: '',
				choices: ['', '']
			},
			responsePoolData: {
				name: '',
				timeLimit: {
					enabled: true,
					minutes: '1',
					seconds: '0'
				},
				prompt: '',
				example: '',
				allowMultipleResponses: true
			},
			informationGapData: {
				name: '',
				prompt: '',
				assignByHighlight: false,
				assignments: [
					{
						resourceType: 'text',
						resourceData: ''
					},
					{
						resourceType: 'text',
						resourceData: ''
					}
				]
			},
			dateCreated: {},
			previewRoomID: '',
			infoModalOpen: false
		}
	},
	computed: {
		lastView() {
			return this.$store.state.lastView
		}
	},
	sockets: {
		activityRoomEstablished(roomID) {
			this.previewRoomID = roomID
		},
		activityDataRequested() {
			let activityData

			if (this.activityChoice == 'survey') {
				activityData = this.surveyData
			} else if (this.activityChoice == 'response pool') {
				activityData = this.responsePoolData
			} else {
				activityData = this.informationGapData
			}


			let data = {
				activityType: this.activityChoice,
				activityData: activityData,
				activityMode: 'preview',
				activityDate: moment()
			}

			this.$socket.emit('activityDataIncoming', this.encrypt(data))
		}
	},
	methods: {
		chooseActivity(activity) {
			this.alertMessage = ''
			this.activityChoice = activity
		},
		routeBack() {
			if (this.progress == 1) {
				this.$router.go(-1)
			} else {
				this.progress -= 1
			}
		},
		changeProgress(step) {
			if (!this.errorExists()) {
				this.progress = step
			}
		},
		toggleTimer() {
			if (this.activityChoice === 'survey') {
				this.surveyData.timeLimit.enabled = !this.surveyData.timeLimit.enabled
			} else {
				this.responsePoolData.timeLimit.enabled = !this.responsePoolData.timeLimit.enabled
			}
		},
		toggleAssignByHighlight() {
			this.informationGapData.assignByHighlight = !this.informationGapData.assignByHighlight
		},
		toggleAllowMultipleResponses() {
			this.responsePoolData.allowMultipleResponses = !this.responsePoolData.allowMultipleResponses
		},
		addSurveyChoice() {
			this.surveyData.choices.push('')
		},
		removeSurveyChoice(index) {
			this.surveyData.choices.splice(index, 1)
		},
		addInformationGapAssignment() {
			this.informationGapData.assignments.push({
				resourceType: 'text',
				resourceData: ''
			})
		},
		removeInformationGapAssignment(index) {
			this.informationGapData.assignments.splice(index, 1)
		},
		errorExists() {
			this.alertMessage = ''
			let check = false

			switch (this.activityChoice) {
				case 'survey':
					switch (this.progress) {
						case 1:
							if (this.surveyData.name == '') {
								this.alertMessage = 'Please name the survey activity.'
								check = true
							} else if (this.surveyData.timeLimit.enabled) {
								if (this.surveyData.timeLimit.seconds > 59) {
									this.alertMessage = 'Please enter a valid number of seconds.'
									check = true
								} else if (this.surveyData.timeLimit.minutes < 1 && this.surveyData.timeLimit.seconds < 1) {
									this.alertMessage = 'Please enter a time limit'
									check = true
								}
							}
							break
						case 2:
							if (this.surveyData.prompt == '') {
								this.alertMessage = 'Please provide a survey prompt.'
								check = true
							} else if (this.surveyData.choices.indexOf('') !== -1) {
								this.alertMessage = 'Please complete all choice fields.'
								check = true
							}
							break
						case 3:
							break
					}
				break
				case 'response pool':
					switch (this.progress) {
						case 1:
							if (this.responsePoolData.name == '') {
								this.alertMessage = 'Please name the response pool activity.'
								check = true
							} else if (this.responsePoolData.timeLimit.enabled) {
								if (this.responsePoolData.timeLimit.seconds > 59) {
									this.alertMessage = 'Please enter a valid number of seconds.'
									check = true
								} else if (this.responsePoolData.timeLimit.minutes < 1 && this.responsePoolData.timeLimit.seconds < 1) {
									this.alertMessage = 'Please enter a time limit'
									check = true
								}
							}
							break
						case 2:
							if (this.responsePoolData.prompt == '') {
								this.alertMessage = 'Please provide a response pool prompt.'
								check = true
							} else if (this.responsePoolData.example == '') {
								this.alertMessage = 'Please provide an example response.'
								check = true
							}
							break
						case 3:
							break
					}
				break
				case 'information gap':
					switch (this.progress) {
						case 1:
							if (this.informationGapData.name == '') {
								this.alertMessage = 'Please name the information gap activity.'
								check = true
							}
							break
						case 2:
							if (this.informationGapData.prompt == '') {
								this.alertMessage = 'Please provide a information gap prompt.'
								check = true
							} else {
								let missingInfo = false

								for (let i=0; i<this.informationGapData.assignments.length; i++) {
									let data = this.informationGapData.assignments[i].resourceData

									if (data == '') {
										missingInfo = true
										break
									}
								}

								if (missingInfo) {
									this.alertMessage = 'Please provide content for each content item.'
									check = true
								}
							}
							break
						case 3:
							break
					}
			}

			return check
		},
		startPreview() {
			this.$socket.emit('createActivityRoom')
			this.changeProgress(3)
		},
		saveActivity() {
			let dataToSave

			if (this.activityChoice == 'survey') {
				dataToSave = {
						name: this.surveyData.name,
						activityType: 'survey',
						dateCreated: this.dateCreated,
						content: {
							prompt: this.surveyData.prompt,
							choices: this.surveyData.choices
						},
						options: {
							timeLimit: {
								enabled: this.surveyData.timeLimit.enabled,
								minutes: this.surveyData.timeLimit.minutes,
								seconds: this.surveyData.timeLimit.seconds
							}
						}
					}						
			} else if (this.activityChoice == 'response pool') {
				dataToSave = {
						name: this.responsePoolData.name,
						activityType: 'response pool',
						dateCreated: this.dateCreated,
						content: {
							prompt: this.responsePoolData.prompt,
							example: this.responsePoolData.example
						},
						options: {
							timeLimit: {
								enabled: this.responsePoolData.timeLimit.enabled,
								minutes: this.responsePoolData.timeLimit.minutes,
								seconds: this.responsePoolData.timeLimit.seconds
							},
							allowMultipleResponses: this.responsePoolData.allowMultipleResponses
						}
					}
			} else {
				dataToSave = {
						name: this.informationGapData.name,
						activityType: 'information gap',
						dateCreated: this.dateCreated,
						content: {
							prompt: this.informationGapData.prompt,
							assignments: this.informationGapData.assignments
						},
						options: {
							assignByHighlight: this.informationGapData.assignByHighlight
						}
					}	
			}


			if (this.id !== undefined) {
				db.updateSomething('activities', {_id: this.id}, dataToSave)
					.then((numUpdated) => {
						this.$router.go(-1)
					})
			} else {
				db.createSomething('activities', dataToSave)
					.then((savedActivity) => {
						// update onboarding progress
						this.$store.dispatch('setPreferences', {
			                progress: ['created class', 'rearranged seats', 'viewed class chart', 'viewed a student page', 'read remote features info', 'explored remote features']
			            })

						if (this.lastView.includes('chart')) {
							let chartID = this.lastView.split('/')[2]
							// route back to chart and launch
							this.$router.push({
								name: 'chart',
								params: {id: chartID},
								query: {activityToLaunch: savedActivity._id}
							})
						} else {
							this.$router.go(-1)
						}
					})
			}
		},
		encrypt(data) {
            return sjcl.encrypt(this.previewRoomID, JSON.stringify(data))
        },
        decrypt(data) {
            let decrypted = sjcl.decrypt(this.previewRoomID, data)

            return JSON.parse(decrypted)
        },
        capitalizeString(str) {
        	// handle single and multiple-word names
			let arr = str.split(' ')

			for (let i=0; i<arr.length; i++) {
				arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1)
			}

			return arr.join(' ')
		}
	},
	created() {
		if (this.id !== undefined) {
			db.readSomething('activities', {_id: this.id})
				.then((existingActivity) => {

					this.activityChoice = existingActivity[0].activityType

					if (existingActivity[0].activityType == 'survey') {
						this.surveyData.name = existingActivity[0].name
						this.surveyData.timeLimit.enabled = existingActivity[0].options.timeLimit.enabled
						this.surveyData.timeLimit.minutes = existingActivity[0].options.timeLimit.minutes
						this.surveyData.timeLimit.seconds = existingActivity[0].options.timeLimit.seconds
						this.surveyData.prompt = existingActivity[0].content.prompt
						this.surveyData.choices = existingActivity[0].content.choices
						this.dateCreated = existingActivity[0].dateCreated
					} else if (existingActivity[0].activityType == 'response pool') {
						this.responsePoolData.name = existingActivity[0].name
						this.responsePoolData.timeLimit.enabled = existingActivity[0].options.timeLimit.enabled
						this.responsePoolData.timeLimit.minutes = existingActivity[0].options.timeLimit.minutes
						this.responsePoolData.timeLimit.seconds = existingActivity[0].options.timeLimit.seconds
						this.responsePoolData.prompt = existingActivity[0].content.prompt
						this.responsePoolData.example = existingActivity[0].content.example
						this.dateCreated = existingActivity[0].dateCreated
					} else {
						this.informationGapData.name = existingActivity[0].name
						this.informationGapData.assignByHighlight = existingActivity[0].options.assignByHighlight
						this.informationGapData.prompt = existingActivity[0].content.prompt
						this.informationGapData.assignments = existingActivity[0].content.assignments
						this.dateCreated = existingActivity[0].dateCreated
					}

					this.mode = 'edit'
				})
		}
	}
}
</script>

<style scoped>
#container {
	background: var(--light-gray);
	width: 100%;
	height: 100%;
	display: grid;
	grid-template-rows: 20vh 65vh 15vh;
	grid-template-columns: 50% auto 50%;
	grid-template-areas:
	'head head head'
	'activityChoice border activityForm'
	'. . .';
	align-items: center;
}

header {
	grid-area: head;
	text-align: center;
	margin-bottom: 40px;
}

h1 {
	margin-top: 70px;
	margin-bottom: 15px;
}

button {
	background: none;
    outline: none;
    border: none;
    cursor: pointer;
}

#border {
	height: 100%;
	width: 2px;
	background: var(--dark-gray);
	grid-area: border;
}

#activityChoice {
	grid-area: activityChoice;
	text-align: center;
}

.activity-choice-container {
	display: inline-block;
}

.activity-button {
	padding: 5px 15px;
	border-radius: 5px;
	box-shadow: 1px 2px 1px 2px var(--gray);
	border: 2px solid var(--light-gray);
	margin: 10px;
}

.activity-button:active {
	box-shadow: none;
}

.activity-button > img {
	width: 220px;
	margin-bottom: 5px;
}

.modal-button {
	background: none;
	outline: none;
	color: var(--red);
	border: none;
	cursor: pointer;
	vertical-align: text-top;
	font-size: 14px;
}

.activity-info {
	
}

.activity-info > h2 {
	background: var(--gray);
	color: var(--white);
	padding: 20px 0;
	text-align: center;
}

.activity-info > p {
	padding: 15px 30px;
}

#activityForm {
	grid-area: activityForm;
	justify-self: center;
	align-self: center;
	margin: 0 auto;
	text-align: center;
}

.form-one {
	width: 400px;
}

.form-two {
	width: 400px;
}

#previewArea {
	width: 400px;
}

#choicesArea {
	max-height: 200px;
	overflow: auto;
}

.form-container {
	background: var(--yellow);
	border-radius: 10px;
	padding: 10px;
}

.form-group {
	text-align: left;
}

.input-wrapper {
	background: var(--light-gray);
	padding: 20px;
	margin: 15px 0;
	border-radius: 10px;
}

.input-wrapper > h5 {
	text-align: left;
	padding-left: 10px;
}

.switch-wrapper {
	background: var(--light-gray);
	padding: 20px;
	border-radius: 10px;
	display: grid;
	grid-template-columns: auto 1fr;
	grid-template-rows: 70% 30%;
	grid-template-areas: 
		"label switch"
		"config config";
	align-items: center;
	margin: 15px 0;
}

.switch-wrapper > h5 {
	grid-area: label;
	text-align: left;
	padding-left: 10px;
}

.switch-wrapper > .switch {
	grid-area: switch;
}

.switch-config {
	background: var(--light-gray);
	padding: 20px 5px 0px 5px;
	text-align: center;
	grid-area: config;
}

.large-input {
	border-radius: 4px;
	font-size: 15px;
	padding: 7px 10px 9px 10px;
	margin: 10px 0 0 0;
	width: 306px;
	color: var(--black);
	border: 1px solid var(--light-gray);
	outline: none;
}

.label-row {
	text-align: left;
}

.label-row > span {
	display: inline-block;
	width: 90px;
	margin-right: 12px;
}

.black-border {
	border-bottom: 1px solid var(--black);
}

.small-input {
	border-radius: 4px;
	font-size: 15px;
	padding: 7px 10px;
	margin: 10px 10px 10px 0;
	width: 70px;
	color: var(--black);
	border: 1px solid var(--light-gray);
	outline: none;
}

.medium-input {
	border-radius: 4px;
	font-size: 15px;
	padding: 7px 10px 9px 10px;
	margin: 10px 5px;
	width: 80%;
	color: var(--black);
	border: 1px solid var(--light-gray);
	outline: none;
}

.select-with-input {
	display: grid;
	grid-template-columns: 30% 55% 15%;
}

#addButtonArea {
	text-align: center;
	margin-top: 15px;
}

.add-button {
	background: none;
	outline: none;
	cursor: pointer;
	font-size: 40px;
	border: none;
}

.delete-button {
	background: none;
	outline: none;
	font-size: 50px;
	border: none;
	cursor: pointer;
	margin-top: -10px;
	margin-left: 5px;
	vertical-align: middle;
}

.progress-button-area {
	text-align: center;
	padding: 20px 0 0 0;
}

.progress-button {
	padding: 10px 15px;
	background: var(--gray);
	color: var(--white);
	font-size: 20px;
	border-radius: 10px;
	cursor: pointer;
	outline: none;
}

.progress-button:nth-child(2) {
	margin-left: 10px;
}

.back-icon {
	width: 15px;
}

#progressNodes {
	position: fixed;
	bottom: 0;
	width: 100%;
	background: var(--light-gray);
}

.selected {
	border: 2px solid var(--black);
}

#errorArea {
	height: 15px;
	text-align: center;
	margin-bottom: 15px;
}

#errorArea > h6 {
	color: var(--red);
	display: inline-block;
}

.alert-icon-small {
	vertical-align: middle;
	width: 20px;
	margin-bottom: 3px;
	margin-right: 5px;
}

.switch {
	height: 27px;
	width: 62px;
	border-radius: 27px;
	text-align: left;
	border: 1px solid var(--black);
	transition: all .1s ease-in;
	margin-left: 20px;
}

.switch > img {
	height: 25px;
	vertical-align: middle;
}

.off {
	background: var(--gray);
	padding-left: 0;
}

.on {
	background: var(--yellow);
	padding-left: 35px;
}

button:disabled {
	opacity: .5;
	cursor: not-allowed;
}

#qr {
	background: var(--white);
	box-shadow: 2px 2px 5px var(--black);
	width: 200px;
	height: 200px;
	margin: 20px auto;
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
</style>
