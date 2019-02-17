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
				<li class="inactive" ref="about"><button class="button-link" @click="changeContent('about')">About</button></li>
			</ul>
			<div id="navigationFooter">
				<button @click="saveChanges">Close</button>
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
							<span>Abbreviation</span>
							<span>Description</span>
							<span>Weight</span>
						</div>
						<div ref="formArea">
							<div class="form-group" v-for="(behavior, index) in positiveBehaviors" :key="index">
								<section class="inline select-wrapper">
									<v-select v-model="behavior.Abbreviation" :options="[
										'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
										'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
									]" @keyup="alertMessage = ''"></v-select>
								</section>
								<input type="text" name="description" v-model="behavior.Description">
								<section class="inline select-wrapper">
									<v-select v-model="behavior.Weight" :options="[
										'low', 'medium', 'strong'
									]" @keyup="alertMessage = ''"></v-select>
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
							<span>Abbreviation</span>
							<span>Description</span>
							<span>Weight</span>
						</div>
						<div ref="formArea">
							<div class="form-group" v-for="(behavior, index) in negativeBehaviors" :key="index">
								<section class="inline select-wrapper">
									<v-select v-model="behavior.Abbreviation" :options="[
										'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
										'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
									]" @keyup="alertMessage = ''"></v-select>
								</section>
								<input type="text" name="description" v-model="behavior.Description">
								<section class="inline select-wrapper">
									<v-select v-model="behavior.Weight" :options="[
										'low', 'medium', 'strong'
									]" @keyup="alertMessage = ''"></v-select>
								</section>
								<button v-if="index !== 0" class="delete-button white-text" @click="removeFormGroup('negative', index)">-</button>
							</div>
							<section id="addButtonArea">
								<button class="add-button white-text" @click="addFormGroup('negative')">+</button>
							</section>
						</div>
					</template>
				</Tabs>
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
			</section>
			<section v-if="content == 'about'">
				<h1>About</h1>
				<p>
					Seatsmart is being developed as a convenient way to implement classroom
					participation guidance by the Department of English at Fort Hays State University for
					courses conducted at campuses in China.
				</p>
				<p>
					Participation is considered an essential part of student performance and can impact final
					course grades. A student begins the semester at the level of a 'C' letter grade for participation.
					The instructor regularly adjusts the grade throughout the semester, making it visible on Blackboard.
					This is intended to motivate students to make positive contributions during class sessions.  A
					course syllabus should define how the instructor calculates the score, spelling out what behaviors
					are encouraged and discouraged.
				</p>
				<p>
					FHSU policies related to technology use and information security were carefully considered in the
					development of Seatsmart.  The application does not require Internet access and does not communicate
					with any remote servers.  All data is stored locally on your computer.  This data is intended to remain
					on your local hard drive and not transfered to any cloud storage system.  This helps ensure that data
					related to students remains confidential.  Records in Seatsmart may relate to a student's academic
					performance and therefore should be protected just as any other grades.
				</p>
				<h3>MIT License</h3>
				<p>
					Seatsmart (beta) v.{{ version }} | Copyright 2019 Thaddeus McCleary
				</p>
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
import Tabs from '@/components/Tabs.vue'
import Help from '@/components/Help.vue'
import TouchBar from '@/components/TouchBar.vue'

export default {
	name: 'Settings',
	components: {
		Tabs,
		Help,
		TouchBar
	},
	data() {
		return {
			content: 'help',
			alertMessage: '',
			calculation: 'balanced',
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
			]
		}
	},
	computed: {
		version() {
            return this.$store.state.version
        }
	},
	mounted() {
		this.calculation = this.$store.state.preferences.calculation
		this.positiveBehaviors = this.$store.state.preferences.positiveBehaviors
		this.negativeBehaviors = this.$store.state.preferences.negativeBehaviors
	},
	methods: {
		changeContent(area) {
			this.content = area

			let areas = ['help', 'behaviors', 'calculation', 'about']

			areas.forEach((a) => {
				if (a !== area) {
					this.$refs[`${a}`].classList = 'inactive'
				}
			});

			this.$refs[`${area}`].classList = 'active'
		},
		selectForm(form) {
			if (form == 'positive') {
				return this.positiveBehaviors
			} else {
				return this.negativeBehaviors
			}
		},
		errorExists(form) {
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

			if (error) {
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
					progress: this.$store.state.preferences.progress,
					calculation: this.calculation,
					positiveBehaviors: this.positiveBehaviors,
					negativeBehaviors: this.negativeBehaviors
				})

				let scope = this

				setTimeout(function() {
					scope.$store.dispatch('getPreferences')
				}, 1000, scope)

				this.$emit('trigger-modal-close')
			}
		}
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
	margin: 40px 0;
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

/* Form styles */
.select-wrapper {
	background: var(--white);
	border-radius: 4px;
	margin: 10px 10px;
	width: 160px;
	color: var(--black);
	font-family: "ArchivoNarrow";
}

.inline {
	display: inline-block;
}

input {
	border-radius: 4px;
	font-size: 15px;
	padding: 7px 10px 9px 10px;
	margin: 10px 10px;
	width: 140px;
	color: var(--black);
	border: 1px solid var(--light-gray);
	outline: none;
}

.label-row {
	padding-left: 5px;
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
	width: 160px;
	margin: 0 10px;
}

.delete-button {
	background: none;
	outline: none;
	font-size: 50px;
	border: none;
	cursor: pointer;
	margin-top: -10px;
	margin-left: 10px;
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
