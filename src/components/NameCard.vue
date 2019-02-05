<template>
	<div v-if="type === 'trends'" id="cardContainer"
	:class="[trend === 0 ? 'gray' : '', trend < 0 ? 'red' : '', trend > 0 ? 'yellow' : '']">
		<section id="cardBody" v-if="student.firstName !== ''">
			<!-- <h3 v-if="name !== ''">{{ name.split('(')[1].split(')')[0] }}</h3> -->
			<h3 v-if="conserveSpace">{{ student.firstName }}</h3>
			<h2 v-else>{{ student.firstName }}</h2>
		</section>
		<section id="cardFooter" v-if="student.firstName !== ''">
			<h4 v-if="trend > 0">{{ '+' + trend + '' }}</h4>
			<h4 v-if="trend < 0">{{ '' + trend + '' }}</h4>
			<h4 v-if="trend === 0">(no change)</h4>
		</section>
	</div>
	<div v-else id="cardContainer" :class="[chosen ? 'chosen' : '', 'gray', isAbsentToday ? 'absent' : '']">
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
			<h3 v-if="conserveSpace">{{ student.firstName }}</h3>
			<h2 v-else>{{ student.firstName }}</h2>
		</section>
		<section id="cardFooter" v-if="student.firstName !== ''">
			<AbbreviationCircle v-if="notes.length !== 0 && type !== 'simple'" v-for="(note, index) in latestNotes" :key="index" :behavior="note.behavior" size="small" :color="note.type === 'positive' ? 'yellow' : 'red'" />
			<button class="simple-button" id="moreButton" @click="$router.push(`/student/${student._id}`)"><img src="@/assets/more.svg" alt="more icon"></button>
		</section>
	</div>
</template>

<script>
import db from '@/db.js'
import moment from 'moment'
import AbbreviationCircle from '@/components/AbbreviationCircle.vue'

export default {
	name: 'NameCard',
	props: ['type', 'column', 'row', 'classId', 'chosen', 'conserveSpace'],
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
					_id: ''
				}
			]
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
		},
		updateStudent() {
			db.updateSomething('students', {_id: this.student._id}, this.student)
				.then((numUpdated) => {
					this.getStudent()
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
	grid-template-rows: 30% 30% 40%;
	grid-template-columns: 1fr 1fr 1fr;
	border-radius: 10px;
}

#leftHeader {
	grid-area: leftHeader;
	text-align: left;
	padding-top: 10%;
	padding-left: 15%;
}

#absences {
	font-family: 'ArchivoNarrow';
	font-size: 1.1em;
	color: var(--red);
}

#centerHeader {
	grid-area: centerHeader;
}

#rightHeader {
	grid-area: rightHeader;
	text-align: right;
	padding-top: 13%;
	padding-right: 7%;
}

.simple-button {
	background: none;
	outline: none;
	border: none;
	cursor: pointer;
}

.star {
	width: 65%;
}

#cardBody {
	grid-area: cardBody;
}

#cardFooter {
	grid-area: cardFooter;
}

#addNoteButton {
	font-family: 'Merriweather';
	font-size: 1.4em;
	padding-top: 10%;
}

#moreButton {
	vertical-align: middle;
	margin: 0 3%;
}

#moreButton > img {
	width: 15px;
}

.chosen {
	box-shadow: 0 0 1px 5px var(--yellow);
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
</style>
