<template>
	<!-- component handles trend, edit, simple, and complex styles -->
	<div v-if="type === 'trends'" id="trendCardContainer"
	:class="[trend === 0 ? 'gray' : '', trend < 0 ? 'red' : '', trend > 0 ? 'yellow' : '']">
		<section id="cardBody" v-if="student.firstName !== ''">
			<h6 class="student-name" v-if="conserveSpace">
				{{ student.firstName }} {{ student.lastName[0] }}.
			</h6>
			<h4 class="student-name" v-else>
				{{ student.firstName }} {{ student.lastName[0] }}.
			</h4>
		</section>
		<section id="cardFooter" v-if="student.firstName !== ''">
			<h6 v-if="trend > 0">{{ '+' + trend + '' }}</h6>
			<h6 v-if="trend < 0">{{ '' + trend + '' }}</h6>
			<h6 v-if="trend === 0">(no change)</h6>
		</section>
	</div>
	<div v-else-if="type === 'demo'" id="cardContainer">
		<section id="leftHeader">
			<span id="absences" v-on:mouseover="$emit('show-caption', 'total number of absences')"
			>3</span>
		</section>
		<section id="centerHeader">
			<button id="addNoteButton" class="simple-button" v-on:mouseover="$emit('show-caption', 'add a new note')">+</button>
		</section>
		<section id="rightHeader">
			<button v-if="!student.selected" class="simple-button" @click="toggleSelected"><img class="star" src="@/assets/graystar.svg" v-on:mouseover="$emit('show-caption', 'select a student')"></button>
			<button v-else class="simple-button" @click="toggleSelected"><img class="star" src="@/assets/yellowstar.svg" v-on:mouseover="$emit('show-caption', 'select a student')"></button>
		</section>
		<section id="cardBody">
			<h5 class="student-name" v-on:mouseover="$emit('show-caption', 'student name')">
				Tommy L.
			</h5>
		</section>
		<section id="cardFooter">
			<span v-on:mouseover="$emit('show-caption', 'recent note indicator')">
				<AbbreviationCircle id="demoCircle" :behavior="{Abbreviation: 'C', Description: 'Using Cell Phone', Weight: 'strong'}" size="small" color="red" />
			</span>
			<button class="simple-button more-button">
				<img src="@/assets/more.svg" alt="more icon" class="more-icon" v-on:mouseover="$emit('show-caption', 'link to view student profile')">
			</button>
		</section>
	</div>
	<div v-else-if="type === 'edit'" id="editCardContainer">
		<section id="editCardBody" v-if="student.firstName !== ''">
			<h6 class="student-name" v-if="conserveSpace">
				{{ student.firstName }} {{ student.lastName[0] }}.
			</h6>
			<h4 class="student-name" v-else>
				{{ student.firstName }} {{ student.lastName[0] }}.
			</h4>
		</section>
		<section id="editCardBody" v-else>
			<button class="simple-button add-student-button" @click="$emit('open-new-student-modal', column, row)">
				<h4>+</h4>
			</button>
		</section>
		<section id="editCardFooter" v-if="student.firstName !== ''">
			<button class="simple-button edit-student-button-small" v-if="conserveSpace" @click="$emit('open-edit-student-modal', student)">
				<img src="@/assets/editblack.svg" alt="edit icon">
			</button>
			<button class="simple-button edit-student-button-large" v-else @click="$emit('open-edit-student-modal', student)">
				<img src="@/assets/editblack.svg" alt="edit icon">
			</button>
		</section>
	</div>
	<div v-else id="cardContainer" :class="[chosen ? 'chosen' : '', 'gray', isAbsentToday ? 'absent' : '']" :style="[student.highlight !== '' ? {boxShadow: `inset 0 0 20px 7px ${student.highlight}`} : {boxShadow: `inset 0 0 20px 7px #E5E5E5`}]">
		<section id="leftHeader" v-if="student.firstName !== '' && type !== 'simple'">
			<span id="absences" :class="[behaviorToTallyType == 'positive' ? 'yellow-text' : 'red-text']">{{ tally }}</span>
		</section>
		<section id="centerHeader" v-if="student.firstName !== ''">
			<button id="addNoteButton" class="simple-button" @click="$emit('open-note-modal', student)">+
				<span class="tooltip">New note for {{ student.firstName }} {{ student.lastName }}</span>
			</button>
		</section>
		<section id="rightHeader" v-if="student.firstName !== '' && type !== 'simple'">
			<button v-if="!student.selected" class="simple-button" @click="toggleSelected"><img class="star" src="@/assets/graystar.svg"></button>
			<button v-else class="simple-button" @click="toggleSelected"><img class="star" src="@/assets/yellowstar.svg"></button>
		</section>
		<section id="cardBody" v-if="student.firstName !== ''">
			<h6 class="student-name" v-if="conserveSpace">
				{{ student.firstName }} {{ student.lastName[0] }}.
			</h6>
			<h4 class="student-name" v-else>
				{{ student.firstName }} {{ student.lastName[0] }}.
			</h4>
		</section>
		<section id="cardFooter" v-if="student.firstName !== ''">
			<AbbreviationCircle v-if="notes.length !== 0 && type !== 'simple'" v-for="(note, index) in latestNotes" :key="index" :behavior="note.behavior" :size="conserveSpace ? 'extra-small' : 'small'" :color="note.type === 'positive' ? 'yellow' : 'red'" />
			<button v-if="studentID !== undefined" class="simple-button more-button" @click="viewStudentProfile"><img src="@/assets/more.svg" alt="more icon" class="more-icon"></button>
			<button v-else class="simple-button more-button" @click="viewStudentProfile">
				<img src="@/assets/more.svg" alt="more icon" :class="[conserveSpace ? 'more-icon-smaller' : 'more-icon']">
			</button>
		</section>
	</div>
</template>

<script>
import db from '@/db.js'
import moment from 'moment'
import AbbreviationCircle from '@/components/AbbreviationCircle.vue'

export default {
	name: 'NameCard',
	props: {
		type: String, 
		column: Number, 
		row: Number, 
		classId: String, 
		chosen: Boolean, 
		conserveSpace: Boolean, 
		studentID: String,
		deselect: Boolean
	},
	components: {
		AbbreviationCircle
	},
	data() {
		return {
			student: {
				firstName: '',
				lastName: '',
				class: '',
				_id: '',
				selected: '',
				highlight: '',
				seat: {
					row: null,
					column: null
				}
			},
			notes: [
				{
					behavior: {
						Abbreviation: null,
						Description: null,
						Weight: null
					},
					student: null,
					type: null,
					dateNoted: {},
					_id: '',
                    comment: null
				}
			]
		}
	},
	computed: {
		lastStudentUpdated() {
			return this.$store.state.lastStudentUpdated
		},
		latestNotes() {
			// sort and grab the three most recent notes (if any)
			if (this.notes.length > 1) {
				this.notes.sort((a,b) => {
					let dateA = a.dateNoted._d
					let dateB = b.dateNoted._d

					return dateA > dateB ? -1 : 1
				})

				if (this.notes.length > 3) {
					return this.notes.slice(0, 3)
				} else {
					return this.notes
				}
			} else {
				return this.notes
			}
		},
		calculationPreference() {
			return this.$store.state.preferences.calculation
		},
		weightValues() {
			return this.$store.state.preferences.weightValues
		},
		calculationInterval() {
			return this.$store.state.preferences.calculationInterval
		},
		trend() {
			// calculation for trend display
			if (this.notes.length === 0) {
				// if calculation preference is 'no news is good news'
				// compensate by recommending an increase of 4 points
				if (this.calculationPreference == 'nonews') {
					return 4
				} else {
					return 0
				}
			} else {
				// base calculation on this week's notes only
				let thisInterval = this.calculationInterval
				let intervalNotes = []

				switch (thisInterval) {
					case ('weekly'):
						thisInterval = moment().week()

						for (let i=0; i<this.notes.length; i++) {
							if (moment(this.notes[i].dateNoted._d).week() === thisInterval) {
								intervalNotes.push(this.notes[i])
							}
						}

						break
					case ('bi-weekly'):
						thisInterval = [moment().week(), moment().week() - 1]

						for (let i=0; i<this.notes.length; i++) {
							if (moment(this.notes[i].dateNoted._d).week() === thisInterval[0] || moment(this.notes[i].dateNoted._d).week() === thisInterval[1]) {
								intervalNotes.push(this.notes[i])
							}
						}

						break
					case ('monthly'):
						thisInterval = moment().month()

						for (let i=0; i<this.notes.length; i++) {
							if (moment(this.notes[i].dateNoted._d).month() === thisInterval) {
								intervalNotes.push(this.notes[i])
							}
						}

						break
				}

				// handle case no new notes this week
				if (intervalNotes.length === 0 && this.calculationPreference == 'nonews') {
					return 4
				} else {
					
					// determine point values based on weight and sum 'trendNumber'
					let trendNumber = 0

					for (let i=0; i<intervalNotes.length; i++) {
						if (intervalNotes[i].type === 'positive') {
							switch (this.determineBehaviorWeight('positive', intervalNotes[i].behavior.Description, intervalNotes[i].behavior.Weight)) {
								case ('low'):
									trendNumber += parseInt(this.weightValues.low)
									break
								case ('medium'):
									trendNumber += parseInt(this.weightValues.medium)
									break
								case ('strong'):
									trendNumber += parseInt(this.weightValues.strong)
									break
							}
						} else {
							switch (this.determineBehaviorWeight('negative', intervalNotes[i].behavior.Description, intervalNotes[i].behavior.Weight)) {
								case ('low'):
									trendNumber -= parseInt(this.weightValues.low)
									break
								case ('medium'):
									trendNumber -= parseInt(this.weightValues.medium)
									break
								case ('strong'):
									trendNumber -= parseInt(this.weightValues.strong)
									break
							}
						}
					}
					return trendNumber
				}
			}
		},
		behaviorToTally() {
			return this.$store.state.preferences.behaviorToTally.split(') ')[1]
		},
		behaviorToTallyType() {
			if (this.$store.state.preferences.behaviorToTally[1] == '+') {
				return 'positive'
			} else {
				return 'negative'
			}
		},
		tally() {
			// calculate and display behavior tally
			if (this.notes.length === 0) {
				return 0
			} else {
				let number = 0

				for (let i=0; i<this.notes.length; i++) {
					if (this.notes[i].type === this.behaviorToTallyType && this.notes[i].behavior.Description === this.behaviorToTally) {
						number++
					}
				}

				return number
			}
		},
		isAbsentToday() {
			// determine whether student is absent from DB
			if (this.notes.length === 0) {
				return false
			} else {
				let arr = []
				let today = moment().dayOfYear()
				let absentToday = false

				for (let i=0; i<this.notes.length; i++) {
					if (this.notes[i].type === 'negative' && this.notes[i].behavior.Abbreviation === 'A') {

						if (moment(this.notes[i].dateNoted._d).dayOfYear() === today) {
							absentToday = true
							break
						}
					}
				}

				return absentToday
			}
		}
	},
	watch: {
		lastStudentUpdated(newValue, oldValue) {
			if (newValue == this.student._id || newValue == 'all') {
				// update component
				this.getStudent()
			}
		},
		deselect(newValue, oldValue) {
			if (newValue === true) {
				this.student.selected = false
				this.updateStudent()
			}
		}
	},
	methods: {
		toggleSelected() {
			// handles random selection UI style
			this.student.selected = !this.student.selected
			this.updateStudent()
		},
		getStudent() {
			// find student with row/column and class info
			if (!this.studentID) {
				db.readSomething('students', {seat: {row: this.row, column: this.column}, class: this.classId})
					.then((result) => {
						if (result.length !== 0) {
							this.student = result[0]

							if (this.student.firstName.indexOf('(') !== -1) {
								this.student.firstName = this.student.firstName.split('(')[1].split(')')[0].split(' ')[0]
							} else {
								this.student.firstName = this.student.firstName.split(' ')[0]
							}

							db.readSomething('notes', {student: this.student._id})
								.then((notes) => {
									this.notes = notes

									if (this.isAbsentToday) {
										this.$emit('absence', this.student._id)
									}

								})
						}
					})
			} else {
				// find student with ID
				db.readSomething('students', {_id: this.studentID })
					.then((result) => {
						if (result.length !== 0) {
							this.student = result[0]

							if (this.student.firstName.indexOf('(') !== -1) {
								this.student.firstName = this.student.firstName.split('(')[1].split(')')[0].split(' ')[0]
							} else {
								this.student.firstName = this.student.firstName.split(' ')[0]
							}

							db.readSomething('notes', {student: this.studentID})
								.then((notes) => {
									this.notes = notes

									if (this.isAbsentToday) {
										this.$emit('absence', this.studentID)
									}

								})
						}
					})
			}

		},
		updateStudent() {
			// grab fresh data from DB and update card
			db.updateSomething('students', {_id: this.student._id}, this.student)
				.then((numUpdated) => {
					this.getStudent()
				})
		},
		viewStudentProfile() {
			this.$router.push(`/student/${this.student._id}`)
		},
		determineBehaviorWeight(behaviorType, behaviorDescription, storedWeight) {
			// get latest behavior weight preference
			let weight = undefined
			let behaviors

			if (behaviorType == 'positive') {
				behaviors = this.$store.state.preferences.positiveBehaviors
			} else {
				behaviors = this.$store.state.preferences.negativeBehaviors
			}

			for (let i=0; i<behaviors.length; i++) {
				if (behaviors[i].Description == behaviorDescription) {
					weight = behaviors[i].Weight
					break
				}
			}

			// if the behavior does not exist in the system, used stored info
			if (weight == undefined) {
				return storedWeight
			} else {
				return weight
			}
		}
	},
	mounted() {
		// grab student info from the DB
		this.getStudent()
	}
}
</script>

<style scoped>
#cardContainer {
	align-items: center;
	width: 100%;
	height: 100%;
	display: grid;
	grid-template-areas:
		"leftHeader centerHeader rightHeader"
		"cardBody   cardBody cardBody"
		"cardFooter cardFooter cardFooter";
	grid-template-rows: 30% 35% 35%;
	grid-template-columns: 1fr 1fr 1fr;
	border-radius: 10px;
}

#trendCardContainer {
	align-items: center;
	width: 100%;
	height: 100%;
	display: grid;
	grid-template-areas:
		"cardBody"
		"cardFooter";
	grid-template-rows: 50% 50%;
	grid-template-columns: auto;
	border-radius: 10px;
}

#editCardContainer {
	align-items: center;
	width: 100%;
	height: 100%;
	display: grid;
	grid-template-areas:
		"editCardBody"
		"editCardFooter";
	grid-template-rows: 50% 50%;
	grid-template-columns: auto;
	border-radius: 10px;
	background: var(--light-gray);
}

#editCardBody {
	grid-area: editCardBody;
}

#editCardFooter {
	grid-area: editCardFooter;
}

.edit-student-button-small > img {
	width: 15px;
}

.edit-student-button-large {
	width: 30px;
}

#leftHeader {
	grid-area: leftHeader;
	text-align: left;
	padding-top: 10%;
	padding-left: 25%;
}

#absences {
	font-size: 14px;
}

.red-text {
	color: var(--red);
}

.yellow-text {
	color: #896502;
}

#centerHeader {
	grid-area: centerHeader;
}

#rightHeader {
	grid-area: rightHeader;
	text-align: right;
	padding-top: 13%;
	padding-right: 18%;
}

.simple-button {
	background: none;
	outline: none;
	border: none;
	cursor: pointer;
}

.star {
	width: 12px;
}

#cardBody {
	grid-area: cardBody;
}

#cardFooter {
	grid-area: cardFooter;
	align-items: center;
}

#addNoteButton {
	font-size: 17px;
}

.more-button {
	margin: 0 3%;
}

.more-icon {
	width: 15px;
	padding-bottom: 3px;
	vertical-align: middle;
}

.more-icon-smaller {
	width: 12px;
	vertical-align: middle;
	padding-bottom: 2px;
}

.chosen {
	background: var(--yellow)!important;
}

.gray {
	background: var(--light-gray);
}

.yellow {
	background: var(--yellow);
}

.red {
	background: var(--red);
	color: var(--white);
}

.absent {
	opacity: .6;
}

.simple-button:hover .tooltip {
	visibility: visible;
}

.tooltip {
	visibility: hidden;
	position: absolute;
	background: var(--yellow);
	padding: 5px;
	width: 180px;
	text-align: center;
	margin-top: -4%;
	margin-left: -85px;
	z-index: 1000;
	border-radius: 5px;
	font-family: "ArchivoNarrow";
	font-size: 14px;
}

.tooltip::after {
	content: " ";
	position: absolute;
	top: 100%; /* At the bottom of the tooltip */
	left: 50%;
	margin-left: -10px;
	border-width: 5px;
	border-style: solid;
	border-color: var(--yellow) transparent transparent transparent;
}
</style>
