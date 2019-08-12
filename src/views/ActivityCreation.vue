<template>
	<div id="container">
		<header>
			<h1 ref="pageHeader" v-if="id == undefined">New Activity</h1>
			<h1 ref="pageHeader" v-else>Edit Activity (...)</h1>
		</header>
		<section id="activityChoice">
			<button class="activity-button" @click="chooseActivity('survey')" :class="[activityChoice == 'survey' ? 'selected' : '']">
				<img src="@/assets/survey-illustration.svg" alt="survey illustration">
				 <h5>survey</h5>
			</button>
		</section>
		<section id="border"></section>
		<section id="activityForm">
			<section id="errorArea">
				<h6><img v-if="alertMessage.length > 0" src="@/assets/alert.svg" alt="alert icon" class="alert-icon-small"> {{ alertMessage }}</h6>
			</section>
			<div v-if="activityChoice == 'survey'">
				<section id="formOne" v-if="progress == 1">
					<div class="form-container">
						<h3>Options</h3>
						<div class="input-wrapper">
							<h5>Name</h5>
							<input class="large-input" type="text" name="surveyName" v-model="surveyData.name" placeholder="Survey name...">
						</div>
						<div class="switch-wrapper">
							<h5>Time Limit</h5>
							<button :class="[surveyData.timeLimit.enabled ? 'on' : 'off' ,'switch']" @click="toggleSurveyTimer">
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
				<section id="formTwo" v-if="progress == 2">
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
								<button class="add-button" @click="addSurveyChoice">+</button>
							</section>
						</div>
					</div>
					<section class="progress-button-area">
						<button class="progress-button" @click="routeBack"><img class="back-icon" src="@/assets/backarrowwhite.svg" alt="back icon"></button>
						<button class="progress-button" @click="changeProgress(3)">preview survey</button>
					</section>
				</section>
			</div>
			<div id="previewArea" v-if="progress == 3">
				<section class="progress-button-area">
					<button class="progress-button" @click="routeBack"><img class="back-icon" src="@/assets/backarrowwhite.svg" alt="back icon"></button>
					<button class="progress-button" @click="saveActivity">save activity</button>
				</section>
			</div>
		</section>
		<section id="progressNodes">
			<ProgressNodes :steps="steps" :progress="progress" />
		</section>
	</div>
</template>

<script>
import ProgressNodes from '@/components/ProgressNodes.vue'

export default {
	name: 'ActivityCreation',
	components: {
		ProgressNodes
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
					seconds: '1'
				},
				prompt: '',
				choices: ['', '']
			}
		}
	},
	methods: {
		chooseActivity(activity) {
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
		toggleSurveyTimer() {
			this.surveyData.timeLimit.enabled = !this.surveyData.timeLimit.enabled
		},
		addSurveyChoice() {
			this.surveyData.choices.push('')
		},
		removeSurveyChoice(index) {
			this.surveyData.choices.splice(index, 1)
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
					}
			}

			return check
		},
		saveActivity() {

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
	margin-top: 70px;
	margin-bottom: 40px;
}

h1 {
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

.activity-button {
	padding: 5px 15px;
	border-radius: 5px;
	box-shadow: 1px 2px 1px 2px var(--gray);
}

.activity-button:active {
	box-shadow: none;
}

.activity-button > img {
	width: 280px;
	margin-bottom: 5px;
}

#activityForm {
	grid-area: activityForm;
	justify-self: center;
	align-self: center;
	margin: 0 auto;
	text-align: center;
}

#formOne {
	width: 400px;
}

#formTwo {
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
}

.switch-wrapper > h5 {
	grid-area: label;
	text-align: left;
	padding-left: 5px;
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
</style>
