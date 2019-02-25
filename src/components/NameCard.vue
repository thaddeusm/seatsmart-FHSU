<template>
	<div v-if="type === 'trends'" id="trendCardContainer"
	:class="[trend === 0 ? 'gray' : '', trend < 0 ? 'red' : '', trend > 0 ? 'yellow' : '']">
		<section id="cardBody" v-if="student.firstName !== ''">
			<!-- <h3 v-if="name !== ''">{{ name.split('(')[1].split(')')[0] }}</h3> -->
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
			<span class="tooltip top">total number of student absences</span>
			<span id="absences">3</span>
		</section>
		<section id="centerHeader">
			<span class="tooltip top">add a new note</span>
			<button id="addNoteButton" class="simple-button">+</button>
		</section>
		<section id="rightHeader">
			<span class="tooltip top">flag a student</span>
			<button v-if="!student.selected" class="simple-button" @click="toggleSelected"><img class="star" src="@/assets/graystar.svg"></button>
			<button v-else class="simple-button" @click="toggleSelected"><img class="star" src="@/assets/yellowstar.svg"></button>
		</section>
		<section id="cardBody">
			<h5 class="student-name">
				Tommy L.
			</h5>
		</section>
		<section id="cardFooter">
			<span class="tooltip top">recent note indicator and see all student notes</span>
			<AbbreviationCircle id="demoCircle" :behavior="{Abbreviation: 'C', Description: 'Using Cell Phone', Weight: 'strong'}" size="small" color="red" />
			<button class="simple-button more-button"><img src="@/assets/more.svg" alt="more icon" class="more-icon"></button>
		</section>
	</div>
	<div v-else id="cardContainer" :class="[chosen ? 'chosen' : '', 'gray', isAbsentToday ? 'absent' : '']" :style="[student.firstName !== '' ? {boxShadow: `inset 0 0 20px 7px ${student.highlight}`} : {}]">
		<section id="leftHeader" v-if="student.firstName !== '' && type !== 'simple'">
			<span id="absences">{{ numberOfAbsences }}</span>
		</section>
		<section id="centerHeader" v-if="student.firstName !== ''">
			<button id="addNoteButton" class="simple-button" @click="$emit('open-note-modal', student)">+</button>
		</section>
		<section id="rightHeader" v-if="student.firstName !== '' && type !== 'simple'">
			<button v-if="!student.selected" class="simple-button" @click="toggleSelected"><img class="star" src="@/assets/graystar.svg"></button>
			<button v-else class="simple-button" @click="toggleSelected"><img class="star" src="@/assets/yellowstar.svg"></button>
		</section>
		<section id="cardBody" v-if="student.firstName !== ''">
			<!-- <h3 v-if="name !== ''">{{ name.split('(')[1].split(')')[0] }}</h3> -->
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
			<button v-else class="simple-button more-button" @click="$router.push(`/student/${student._id}`)"><img src="@/assets/more.svg" alt="more icon" :class="[conserveSpace ? 'more-icon-smaller' : 'more-icon']"></button>
		</section>
	</div>
</template>

<script>
import db from '@/db.js'
import moment from 'moment'
import AbbreviationCircle from '@/components/AbbreviationCircle.vue'

export default {
	name: 'NameCard',
	props: ['type', 'column', 'row', 'classId', 'chosen', 'conserveSpace', 'studentID'],
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
			],
			sentNotes: false
		}
	},
	computed: {
		lastUpdatedStudent() {
			return this.$store.state.lastUpdatedStudent
		},
		latestNotes() {
			if (this.notes.length > 1) {
				let sorted = this.notes.sort((a,b) => {
					let dateA = a.dateNoted._d
					let dateB = b.dateNoted._d

					return dateA > dateB ? -1 : 1
				})

				if (sorted.length > 3) {
					return sorted.slice(0, 3)
				} else {
					return sorted
				}
			} else {
				return this.notes
			}
		},
		calculationPreference() {
			return this.$store.state.preferences.calculation
		},
		trend() {
			if (this.notes.length === 0) {
				// if calculation preference is 'no news is good news'
				// compensate by recommending an increase of 4 points
				if (this.calculationPreference == 'nonews') {
					return 4
				} else {
					return 0
				}
			} else {
				let thisWeek = moment().week()
				let thisWeeksNotes = []

				for (let i=0; i<this.notes.length; i++) {
					if (moment(this.notes[i].dateNoted._d).week() === thisWeek) {
						thisWeeksNotes.push(this.notes[i])
					}
				}

				if (thisWeeksNotes.length === 0 && this.calculationPreference == 'nonews') {
					return 4
				} else {
					let trendNumber = 0
					for (let i=0; i<thisWeeksNotes.length; i++) {
						if (thisWeeksNotes[i].type === 'positive') {
							switch (thisWeeksNotes[i].behavior.Weight) {
								case ('low'):
									trendNumber += 2
									break
								case ('medium'):
									trendNumber += 4
									break
								case ('strong'):
									trendNumber += 8
									break
							}
						} else {
							switch (thisWeeksNotes[i].behavior.Weight) {
								case ('low'):
									trendNumber -= 2
									break
								case ('medium'):
									trendNumber -= 4
									break
								case ('strong'):
									trendNumber -= 8
									break
							}
						}
					}
					return trendNumber
				}
			}
		},
		numberOfAbsences() {
			if (this.notes.length === 0) {
				return 0
			} else {
				let numberOfAbsences = 0

				for (let i=0; i<this.notes.length; i++) {
					if (this.notes[i].type === 'negative' && this.notes[i].behavior.Abbreviation === 'A') {
						numberOfAbsences++
					}
				}

				return numberOfAbsences
			}
		},
		isAbsentToday() {
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
		lastUpdatedStudent(newValue, oldValue) {
			if (newValue === this.student._id) {
				this.getStudent()
			}
		}
	},
	methods: {
		toggleSelected() {
			this.student.selected = !this.student.selected
			this.updateStudent()
		},
		getStudent() {
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

									if (notes.length !== 0) {
										if (!this.sentNotes) {
											this.$emit('notes-found', notes)
											this.sentNotes = true
										}
									}

								})
						}
					})
			} else {
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

									if (notes.length !== 0) {
										if (!this.sentNotes) {
											this.$emit('notes-found', notes)
											this.sentNotes = true
										}
									}

								})
						}
					})
			}

		},
		updateStudent() {
			db.updateSomething('students', {_id: this.student._id}, this.student)
				.then((numUpdated) => {
					this.getStudent()
				})
		},
		viewStudentProfile() {
			// get all notes from student's class and sort
			let classStudents = []
			let classNotes = []

			db.readSomething('students', {class: this.student.class})
				.then(foundStudents => {
					classStudents = foundStudents

					for (let i=0; i<classStudents.length; i++) {
						db.readSomething('notes', {student: classStudents[i]._id})
							.then(foundNotes => {
								for (let k=0; k<foundNotes.length; k++) {
									classNotes.push(foundNotes[k])
								}

								let sortedNotes = classNotes.sort((a, b) => {
									let dateA = a.dateNoted._d
									let dateB = b.dateNoted._d

									return dateA < dateB ? -1 : 1
								})

								if (sortedNotes.length > 0) {
									this.$store.dispatch('setEarliestDateNoted', sortedNotes[0].dateNoted)
								}

								this.$router.push(`/student/${this.studentID}`)
							})
					}
				})
		}
	},
	mounted() {
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

#leftHeader {
	grid-area: leftHeader;
	text-align: left;
	padding-top: 10%;
	padding-left: 25%;
}

#absences {
	font-size: 14px;
	color: var(--red);
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

#leftHeader:hover .tooltip {
	visibility: visible;
}

#centerHeader:hover .tooltip {
	visibility: visible;
}

#rightHeader:hover .tooltip {
	visibility: visible;
}

#cardFooter:hover .tooltip {
	visibility: visible;
}

.tooltip {
	visibility: hidden;
	position: absolute;
	background: var(--yellow);
	font-family: "ArchivoNarrow";
	font-size: 16px;
}

.top {
	width: 300px;
	padding: 5px;
	bottom: 189px;
	left: 59.5%;
	text-align: center;
	z-index: 1000;
	margin-left: -155px;
	margin-bottom: 20px;
	border-radius: 5px;
}
</style>
