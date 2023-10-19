<template>
	<div id="settingsContainer">
		<aside id="settingsNavigation">
			<div id="navigationLogo">
				<img src="@/assets/cog.svg" alt="settings icon">
			</div>
			<ul id="navigationList">
				<li class="active" ref="help"><button class="button-link" @click="changeContent('help')">Help</button></li>
				<li class="inactive" ref="behaviors"><button class="button-link" @click="changeContent('behaviors')">Behaviors</button></li>
				<li class="inactive" ref="calculation"><button class="button-link" @click="changeContent('calculation')">Calculation</button></li>
				<li class="inactive" ref="transfer"><button class="button-link" @click="changeContent('transfer')">Transfer</button></li>
				<li class="inactive" ref="about"><button class="button-link" @click="changeContent('about')">About</button></li>
			</ul>
			<div id="navigationFooter">
				<button @click="saveChanges" :disabled="transferring">close</button>
			</div>
		</aside>
		<section id="settingsContent">
			<section v-if="content == 'help'">
				<Help v-on:change-content="changeContent" />
			</section>
			<section v-if="content == 'behaviors'">
				<h1>Behaviors</h1>
				<p>
					What does participation mean to you?  Add positive and negative behaviors
					you would like to track with Seatsmart below.  Set different weights
					for these behaviors, which will impact how the application calculates student progress.
				</p>
				<section id="alert">
					<h6><img v-if="alertMessage.length > 0" src="@/assets/alert.svg" alt="alert icon" class="alert-icon-small"> {{ alertMessage }}</h6>
				</section>
				<Tabs :sections="[{label: 'Positive', color: 'yellow'}, {label: 'Negative', color: 'red'}]">
					<template slot="Positive">
						<div class="label-row black-border">
							<span class="behavior-label">Abbreviation</span>
							<span class="behavior-label">Description</span>
							<span class="behavior-label">Weight</span>
						</div>
						<div ref="formArea">
							<div class="form-group" v-for="(behavior, index) in positiveBehaviors" :key="index">
								<section class="inline">
									<select
										name="posAbbreviation"
										v-model="behavior.Abbreviation"
										class="narrow-select"
									>
										<option
											v-for="(abbreviationOption, index) in abbreviationOptions"
											:value="abbreviationOption"
											:key="`posAbbreviation${index}`"
										>
											{{ abbreviationOption }}
										</option>
									</select>
								</section>
								<input class="large-input" type="text" name="description" v-model="behavior.Description">
								<section class="inline">
									<select
										name="posWeight"
										v-model="behavior.Weight"
										class="wide-select"
									>
										<option
											v-for="(weightOption, index) in weightOptions"
											:value="weightOption"
											:key="`posWeight${index}`"
										>
											{{ weightOption }}
										</option>
									</select>
								</section>
								<button class="delete-button black-text" @click="removeFormGroup('positive', index)">-</button>
							</div>
							<section id="addButtonArea">
								<button class="add-button black-text" @click="addFormGroup('positive')">+</button>
							</section>
						</div>
					</template>
					<template slot="Negative">
						<div class="label-row white-border">
							<span class="behavior-label">Abbreviation</span>
							<span class="behavior-label">Description</span>
							<span class="behavior-label">Weight</span>
						</div>
						<div ref="formArea">
							<div class="form-group" v-for="(behavior, index) in negativeBehaviors" :key="index">
								<section class="inline">
									<select
										name="negAbbreviation"
										v-model="behavior.Abbreviation"
										class="narrow-select"
									>
										<option
											v-for="(abbreviationOption, index) in abbreviationOptions"
											:value="abbreviationOption"
											:key="`negAbbreviation${index}`"
										>
											{{ abbreviationOption }}
										</option>
									</select>
								</section>
								<input class="large-input" type="text" name="description" v-model="behavior.Description">
								<section class="inline">
									<select
										name="negWeight"
										v-model="behavior.Weight"
										class="wide-select"
									>
										<option
											v-for="(weightOption, index) in weightOptions"
											:value="weightOption"
											:key="`negWeight${index}`"
										>
											{{ weightOption }}
										</option>
									</select>
								</section>
								<button v-if="index !== 0" class="delete-button white-text" @click="removeFormGroup('negative', index)">-</button>
							</div>
							<section id="addButtonArea">
								<button class="add-button white-text" @click="addFormGroup('negative')">+</button>
							</section>
						</div>
					</template>
				</Tabs>
				<h4 class="subheading">Tally</h4>
				<p>
					Each student's name card can tally and display one behavior on the upper left corner.
					This allows you to track student progress in an area you consider vital to your course.
					By default, Seatsmart displays absences.  You can choose an alternative behavior below:
				</p>
				<select name="tally" v-model="behaviorToTally" class="block-select">
					<option
						v-for="(behavior, index) in allBehaviors"
						:value="behavior"
						:key="`behavior${index}tally`"
					>
						{{ behavior }}
					</option>
				</select>
			</section>
			<section v-if="content == 'calculation'">
				<h1>Calculation</h1>
				<p>
					As participation records accumulate, Seatsmart will calculate participation
					trends to provide charts and other visual cues.  These are especially useful when
					updating participation grades in Blackboard throughout the semester.
				</p>
				<p>
					Calculations can be made in two ways:
				</p>
				<section class="radio-heading">
					<span class="radio-label">Balanced</span>
					<img class="radio-icon" src="@/assets/balance.svg" alt="balanced calculation">
					<div class="radio-wrapper">
						<input type="radio" id="optionOne" value="balanced" v-model="calculation">
					</div>
				</section>
				<p class="radio-description">
					By default, Seatsmart assumes that an instructor will be just as likely to note
					students' positive behaviors as negative ones.  The application will adjust
					a participation score up or down according to the type of behavior and its weight.
					If no notes are added for a student in a given week, the application
					will suggest that no changes be made to the students' grade.
				</p>
				<section class="radio-heading">
					<span class="radio-label">No News is Good News</span>
					<img class="radio-icon" src="@/assets/nonews.svg" alt="no news is good news calculation">
					<div class="radio-wrapper">
						<input type="radio" id="optionTwo" value="nonews" v-model="calculation">
					</div>
				</section>
				<p class="radio-description">
					Some instructors may find that they are more likely to record notes about negative
					behaviors such as absences, cell phone use, missing homework, etc.  In this case, trend
					calculations may not accurately reflect student performance.  'No News is Good News'
					assumes that a student is participating well if no notes are recorded pertaining to
					them in a given week.
				</p>
				<h4 class="subheading">Calculation Interval</h4>
				<p>
					By default, a Seatsmart chart includes the option to view participation trends for the current week.  This is meant to help you quickly adjust participation points on Blackboard to provide students regular feedback.  You can customize the interval being calculated by choosing either "bi-weekly", "monthly", or "cumulative" calculations as an alternative below.
				</p>
				<select name="interval" v-model="calculationInterval" class="block-select">
					<option value="weekly">weekly</option>
					<option value="bi-weekly">bi-weekly</option>
					<option value="monthly">monthly</option>
					<option value="cumulative">cumulative</option>
				</select>
				<h4 class="subheading">Point Values</h4>
				<p>
					Seatsmart helps you adjust grades regularly by preparing calculations for the current calculation interval.  For example, behaviors with a low weight add (or remove) 2 points from the student's trend score by default.
				</p>
				<p>
					You can enter alternative values below:
				</p>
				<br>
				<div id="weightValueContainer">
					<div id="weightValueLabels" class="black-border">
						<span class="calculation-label">Low</span>
						<span class="calculation-label">Medium</span>
						<span class="calculation-label">Strong</span>
					</div>
					<div id="weightValueInputs" class="form-group">
						<input class="small-input" type="number" name="low" v-model="weightValues.low">
						<input class="small-input" type="number" name="medium" v-model="weightValues.medium">
						<input class="small-input" type="number" name="strong" v-model="weightValues.strong">
					</div>
				</div>
			</section>
			<section v-if="content == 'transfer'">
				<Transfer
					v-on:toggle-transfer-progress="toggleTransferring"
				/>
			</section>
			<section v-if="content == 'about'">
				<h1>About</h1>
				<p>
					<button @click="openHomePage('main')" class="inner-link">Seatsmart</button>  offers a convenient way to to manage classrooms by encouraging learners to make positive contributions during a lesson.
				</p>
				<p>
					Instructors can use the application to track each student's participation throughout the course.  This makes feedback to students more transparent and actionable.
				</p>
				<p>
					Information security was carefully considered in the
					development of Seatsmart.  The basic features of the application do not require Internet access.  All data is stored locally on your computer.  This data is intended to remain
					on your local hard drive and not transfered to any cloud storage system.  This helps ensure that data
					related to students remains confidential.  Records in Seatsmart may relate to a student's academic
					performance and therefore should be protected just as any other grades.
				</p>
				<h3>Current Version</h3>
				<p>
					<button @click="openHomePage('notes')" class="inner-link">v.{{ version }}</button>
					| Copyright {{ year }} <button class="inner-link" @click="openEmail">Thaddeus McCleary</button>
				</p>
				<h3>MIT License</h3>
				<p>
					Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
					documentation files (the "Software"), to deal in the Software without restriction, including without limitation
					the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
					and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
				</p>
				<p>
					The above copyright notice and this permission notice shall be included in all copies or substantial portions
					of the Software.
				</p>
				<p>
					THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
					TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
					THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
					CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
					IN THE SOFTWARE.
				</p>
			</section>
		</section>
	</div>
</template>

<script>
const shell = require('electron').shell

import moment from 'moment'
import Tabs from '@/components/Tabs.vue'
import Transfer from '@/components/Transfer.vue'
import Help from '@/components/Help.vue'

export default {
	name: 'Settings',
	components: {
		Tabs,
		Help,
		Transfer
	},
	data() {
		return {
			content: 'help',
			alertMessage: '',
			calculation: 'balanced',
			calculationInterval: 'weekly',
			positiveBehaviors: [
				{
					Abbreviation: null,
					Description: null,
					Weight: null
				}
			],
			negativeBehaviors: [
				{
					Abbreviation: null,
					Description: null,
					Weight: null
				}
			],
			behaviorToTally: null,
			weightValues: {
				low: null,
				medium: null,
				strong: null
			},
			abbreviationOptions: [
				'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
				'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
			],
			weightOptions: [
				'low', 'medium', 'strong'
			],
			transferring: false,
			year: null
		}
	},
	computed: {
		version() {
      return this.$store.state.version
    },
		allBehaviors() {
			let all = []

			for (let i=0; i<this.positiveBehaviors.length; i++) {
				let thisBehavior = this.positiveBehaviors[i]
				all.push(`(+) ${thisBehavior.Description}`)
			}

			for (let i=0; i<this.negativeBehaviors.length; i++) {
				let thisBehavior = this.negativeBehaviors[i]
				all.push(`(-) ${thisBehavior.Description}`)
			}

			return all
		}
	},
	methods: {
		changeContent(area) {
			// handle component navigation
			this.content = area

			let areas = ['help', 'behaviors', 'calculation', 'about', 'transfer']

			areas.forEach((a) => {
				if (a !== area) {
					this.$refs[`${a}`].classList = 'inactive'
				}
			});

			this.$refs[`${area}`].classList = 'active'
		},
		selectForm(form) {
			// return behavior list for error checking
			if (form == 'positive') {
				return this.positiveBehaviors
			} else {
				return this.negativeBehaviors
			}
		},
		errorExists(form) {
			this.alertMessage = ''

			let formToCheck = this.selectForm(form)

			let error = false

			let abbreviations = {"A": 0, "B": 0, "C": 0, "D": 0, "E": 0, "F": 0, "G": 0, "H": 0, "I": 0, "J": 0, "K": 0, "L": 0, "M": 0, "N": 0, "O": 0, "P": 0, "Q": 0, "R": 0, "S": 0, "T": 0, "U": 0, "V": 0, "W": 0, "X": 0, "Y": 0, "Z": 0}

			for (let i = 0; i<formToCheck.length; i++) {
				if (formToCheck[i].Abbreviation == null) {
					this.alertMessage = `Please select an abbreviation for the ${form} behavior.`
					error = true
				} else if (formToCheck[i].Description == null) {
					this.alertMessage = `Please enter a description for the ${form} behavior.`
					error = true
				} else if (formToCheck[i].Weight == null) {
					this.alertMessage = `Please select a weight for the ${form} behavior.`
					error = true
				}

				abbreviations[formToCheck[i].Abbreviation]++
			}

			if (!error) {
				for (let i=0; i<Object.keys(abbreviations).length; i++) {
					if (Object.values(abbreviations)[i] > 1) {
						this.alertMessage = `There are multiple ${form} behaviors with the same abbreviation.`
						error = true
						break
					}
				}
			}

			// in case current view is elsewhere, place back on behaviors if error for easy correction
			if (error == true) {
				this.changeContent('behaviors')
			}

			return error
		},
		addFormGroup(form) {
			this.alertMessage = ''

			let obj = {
				Abbreviation: null,
				Description: null,
				Weight: null
			}

			let formToEdit = this.selectForm(form)

			formToEdit.push(obj)

		},
		removeFormGroup(form, index) {
			this.alertMessage = ''

			let formToEdit = this.selectForm(form)

			if (this.selectForm(form)[index].Description !== 'Absent') {
				formToEdit.splice(index, 1)

			} else {
				this.alertMessage = 'Sorry, absences cannot be removed as a category.'
			}
		},
		saveChanges() {
			if (!this.errorExists('positive') && !this.errorExists('negative')) {
				this.$store.dispatch('setPreferences', {
					calculation: this.calculation,
					positiveBehaviors: this.positiveBehaviors,
					negativeBehaviors: this.negativeBehaviors,
					behaviorToTally: this.behaviorToTally,
					calculationInterval: this.calculationInterval,
					weightValues: this.weightValues
				})

				let scope = this

				setTimeout(function() {
					scope.$store.dispatch('getPreferences')
				}, 1000, scope)

				this.$emit('trigger-modal-close')
			}
		},
		openHomePage(section) {
			if (section == 'main') {
				shell.openExternal('https://seatsmart.vercel.app/')
			} else {
				shell.openExternal('https://seatsmart.vercel.app/#releaseNotes')
			}
		},
		openEmail() {
			shell.openExternal('mailto:verb_stanzas0a@icloud.com?subject=Seatsmart')
		},
		toggleTransferring() {
			this.transferring = !this.transferring
		}
	},
	mounted() {
		this.year = moment().year()

		// grab existing user settings from store and set as local props for editing
		this.calculation = this.$store.state.preferences.calculation
		this.positiveBehaviors = this.$store.state.preferences.positiveBehaviors
		this.negativeBehaviors = this.$store.state.preferences.negativeBehaviors
		this.behaviorToTally = this.$store.state.preferences.behaviorToTally
		this.calculationInterval = this.$store.state.preferences.calculationInterval
		this.weightValues = this.$store.state.preferences.weightValues
	}
}
</script>

<style scoped>
#settingsContainer {
	display: grid;
	width: 100%;
	height: 100%;
	grid-template-columns: 175px 1fr;
	grid-template-areas: "navigation content";
}

#settingsNavigation {
	grid-area: navigation;
	background: var(--gray);
	border-top-left-radius: 2px;
	border-bottom-left-radius: 2px;
}

#settingsContent {
	grid-area: content;
	background: var(--light-gray);
	border-top-right-radius: 2px;
	border-bottom-right-radius: 2px;
	padding: 45px 70px;
	overflow: auto;
}

#navigationLogo {
	text-align: center;
	margin: 40px 0 70px 0;
}

img {
	width: 35px;
}

.button-link {
	background: none;
	border: none;
	outline: none;
	cursor: pointer;
	font-size: 26px;
}

.inactive > button {
	color: var(--white);
}

.active {
	background: var(--light-gray);
	color: var(--black);
}

li {
	padding: 5px 22px;
	margin: 25px 0;
}

ul {
	list-style: none;
}

p {
	margin: 10px 0;
}

h1 {
	margin-bottom: 25px;
}

h3 {
	margin-top: 30px;
}

.inner-link {
	background: none;
	border: none;
	outline: none;
	cursor: pointer;
	font-size: 18px;
	border-bottom: 2px solid var(--yellow);
}

#navigationFooter {
	margin-top: 70px;
	text-align: center;
}

#navigationFooter > button {
	font-size: 16px;
	padding: 5px 12px;
	border-radius: 5px;
	cursor: pointer;
	box-shadow: 0px 0px 1px var(--black);
	outline: none;
}

#navigationFooter > button:disabled {
	background: var(--light-gray)!important;
	opacity: .6;
	cursor: not-allowed;
}

/* Form styles */
.block-select {
	width: 100%;
	margin: 10px 0;
}

.narrow-select {
	width: 70px;
}

.wide-select {
	width: 120px;
}

.inline {
	display: inline-block;
}

input {
	border-radius: 4px;
	font-size: 15px;
	padding: 7px 10px 9px 10px;
	margin: 10px 8px;
	color: var(--black);
	border: 1px solid var(--light-gray);
	outline: none;
}

.large-input {
	width: 300px;
}

#weightValueContainer {
	display: grid;
	grid-template-rows: .5fr 1fr;
}

#weightValueLabels {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
}

#weightValueLabels > span {
	display: block;
	justify-self: center;
}

#weightValueInputs {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
}

#weightValueInputs > * {
	display: block;
}

.label-row {
	padding-bottom: 5px;
}

.black-border {
	border-bottom: 1px solid var(--black);
}

.white-border {
	border-bottom: 1px solid var(--white);
}

.label-row > span {
	display: inline-block;
	margin: 0 10px;
}

.behavior-label:first-child {
	width: 195px;
}

.behavior-label:nth-child(2) {
	width: 235px;
}

.calculation-label {
	width: 30%;
	text-align: center;
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

#addButtonArea {
	text-align: center;
	margin-top: 20px;
}

.add-button {
	background: none;
	outline: none;
	cursor: pointer;
	font-size: 40px;
	border: none;
}

#alert {
	text-align: center;
	color: var(--red);
	padding: 10px;
	height: 20px;
}

.subheading {
	margin-top: 60px;
}

.black-text {
	color: var(--black);
}

.white-text {
	color: var(--white);
}

.radio-heading {
	display: grid;
	grid-template-columns: 90% 5% 5%;
	grid-template-rows: 100%;
	grid-template-areas: "text image radio";
	align-items: center;
	width: 100%;
	height: 40px;
	margin-top: 30px;
}

.radio-heading:first-child {
	margin: 0;
}

.radio-label {
	font-size: 22px;
	font-weight: 550;
	border-left: 3px solid var(--yellow);
	padding-left: 3px;
}

.radio-heading > img {
	text-align: right;
}

.radio-text {
	grid-area: text;
	vertical-align: middle;
	font-family: "ArchivoNarrow";
	font-size: 28px;
}

.radio-icon {
	width: 30px;
	/*margin-left: 5px;*/
	padding-bottom: 4px;
	grid-area: image;
}

.radio-wrapper {
	grid-area: radio;
}

input[type=radio] {
	width: 10px;
}

.alert-icon-small {
	vertical-align: middle;
	width: 20px;
	margin-bottom: 5px;
	margin-right: 5px;
}
</style>
