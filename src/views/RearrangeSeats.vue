<template>
	<div id="container">
		<header>
			<TitleBar :title="classChart.name" />
		</header>
		<main>
			<div class="row" v-for="(row, index) in grid" :key="`row${index}`" :style="rowMargins">
				<drop class="drop-card" v-for="(column, subIndex) in row" :key="`column${subIndex}`" @drop="handleDrop(index, subIndex, ...arguments)" :style="cardStyle">
					<h2 v-if="column.student.firstName.indexOf('(') !== -1">{{ column.student.firstName.split('(')[1].split(')')[0].split(' ')[0] }}</h2>
					<h2 v-else>{{ column.student.firstName.split(' ')[0] }}</h2>
					<button v-if="column.student.firstName !== ''" @click="clearSeat(index, subIndex)" class="delete-button">x</button>
				</drop>
			</div>
		</main>
		<footer>
			<ActionBar background="var(--gray)" :hamburger="false" :collapsed="false" :nowrap="true">
				<template slot="left">
					<button class="action-button" @click="saveSeats" :disabled="studentsToPlace.length !== 0">
						<img src="@/assets/checkmark.svg" alt="save">
					</button>
				</template>
				<template slot="center">
					<div class="drag-area">
						<drag :effect-allowed="['link']" v-for="(student, index) in studentsToPlace" :transfer-data="{student: student, index: index}" :key="`student${index}`" class="drag">
							<span v-if="student.firstName.indexOf('(') !== -1">{{ student.firstName.split('(')[1].split(')')[0].split(' ')[0] }}</span>
							<span v-else>{{ student.firstName.split(' ')[0] }}</span>
						</drag>
					</div>
				</template>
				<template slot="right">
					<button class="action-button" @click="$router.push(`/chart/${id}`)">
						<img src="@/assets/closesolid.svg" alt="cancel">
					</button>
				</template>
			</ActionBar>
		</footer>
		<Modal v-if="introModalOpen" size="large" :dismissable="true" v-on:trigger-close="closeIntroModal">
			<template slot="content">
				<div class="modal-header">
    				<h1>How to Change Student Seating</h1>
    			</div>
    			<div class="modal-body">
    				<div class="step">
    					<drag class="drag" :effect-allowed="['link']"><span v-if="!testDropComplete">Tina</span></drag>
    					<h2>Click and drag a student name into the chart</h2>
    					<h2>1</h2>
    				</div>
    				<div class="step">
    					<drop class="drop-card border" @drop="handleTestDrop">
							<h2 v-if="testDropComplete">Tina</h2>
						</drop>
    					<h2>Drop the name into an empty seat</h2>
    					<h2>2</h2>
    				</div>
    				<div class="step">
						<div class="drop-card border">
							<h2>{{exampleText}}</h2>
							<button class="delete-button" @click="testDropComplete = false">x</button>
						</div>
    					<h2>Click the 'x' to undo the seat assignment</h2>
    					<h2>3</h2>
    				</div>
    			</div>
    			<div class="modal-footer">
    				<button class="modal-footer-button" @click="closeIntroModal">Got it</button>
    			</div>
			</template>
		</Modal>
		<Modal v-if="choiceModalOpen" :dismissable="false" size="small">
    		<template slot="content">
    			<div class="choice-modal-body">
    				<h2>Do you want to start with a blank chart or students' original seats?</h2>
    			</div>
    			<div class="choice-modal-footer">
    				<button class="modal-footer-button yellow" @click="setChoice('blank')">Blank</button>
    				<button class="modal-footer-button" @click="setChoice('original')">Original</button>
    			</div>
    		</template>
    	</Modal>
		<!-- <TouchBar :show="true" :bar="[
	      {type: 'button', label: 'Settings', method: openModal}
	    ]"/> -->
	</div>
</template>

<script>
import db from '@/db.js'
const { remote } = require('electron')

import TitleBar from '@/components/TitleBar.vue'
import ActionBar from '@/components/ActionBar.vue'
import Modal from '@/components/Modal.vue'
import TouchBar from '@/components/TouchBar.vue'

export default {
	name: 'RearrangeSeats',
	props: ['id'],
	components: {
		TitleBar,
		ActionBar,
		Modal,
		TouchBar
	},
	data() {
		return {
			classChart: {
				_id: '',
				rows: 0,
				columns: 0,
				semester: '',
				year: null,
				name: ''
			},
			studentsToPlace: [
				{
					_id: '',
					firstName: '',
					lastName: '',
					class: '',
					seleted: false,
					seat: {
						row: 0,
						column: 0
					}
				}
			],
			placedStudents: [],
			introModalOpen: false,
			choiceModalOpen: true,
			grid: [],
			cardStyle: {
				width: '',
				height: '',
				marginLeft: '',
				marginRight: ''
			},
			rowMargins: {
				marginTop: '',
				marginBottom: ''
			},
			exampleText: 'Tina',
			choice: '',
			testDropComplete: false
		}
	},
	computed: {
		progress() {
			return this.$store.state.preferences.progress.length
		}
	},
	methods: {
		calculateCardSize() {
			// determine ideal card dimensions
			let totalWidth = remote.getGlobal('screenWidth')
			let totalHeight = remote.getGlobal('screenHeight')
			let heightAdjusted

			heightAdjusted = totalHeight * .78

			let totalCardWidth = totalWidth / this.classChart.columns
			let totalCardHeight = heightAdjusted / this.classChart.rows

			let ratio = totalCardWidth / totalCardHeight
			// enforce consistent dimensions
			if (ratio > 1.2) {
				totalCardWidth = totalCardHeight * 1.2
			} else if (ratio < 1.2) {
				totalCardHeight = totalCardWidth * .835
			}


			let totalPossibleVerticalSpace = totalCardHeight * this.classChart.rows
			let totalUsedVerticalSpace = totalPossibleVerticalSpace * .7
			let remainingVerticalSpace = heightAdjusted - totalUsedVerticalSpace
			let gaps = this.classChart.rows + 2
			let verticalMargin = remainingVerticalSpace / gaps
			this.cardStyle.width = `${totalCardWidth * .9}px`
			this.cardStyle.marginRight = `${totalCardWidth * .05}px`
			this.cardStyle.marginLeft = `${totalCardWidth * .05}px`
			this.cardStyle.height = `${totalCardHeight * .7}px`
			this.rowMargins.marginTop = `${verticalMargin}px`
			this.rowMargins.marginBottom = `${verticalMargin}px`
		},
		handleDrop(row, column, data, event) {
			event.preventDefault()
			this.studentsToPlace.splice(data.index, 1)
			this.grid[row][column].student = data.student
			this.placedStudents.push({student: data.student, originalIndex: data.index})
		},
		handleTestDrop() {
			this.testDropComplete = true
		},
		clearSeat(row, column) {
			let student = this.grid[row][column].student
			let originalIndex
			for (let i=0; i<this.placedStudents.length; i++) {
				if (this.placedStudents[i].student._id === student._id) {
					originalIndex = this.placedStudents[i].originalIndex
					this.placedStudents.splice(i, 1)
					break
				}
			}

			let blankStudentObj = {
				_id: '',
				firstName: '',
				lastName: '',
				class: '',
				selected: '',
				seat: {
					row: 0,
					column: 0
				}
			}

			this.studentsToPlace.splice(originalIndex, 0, student)
			this.grid[row][column].student = blankStudentObj
		},
		closeIntroModal() {
			this.introModalOpen = false
			this.choiceModalOpen = true
		},
		setChoice(choice) {
			this.choice = choice
			this.choiceModalOpen = false

			if (choice === 'original') {
				this.placeInOriginalSeats()
				this.studentsToPlace = []
			}
		},
		placeInOriginalSeats() {
			for (let i=0; i<this.studentsToPlace.length; i++) {
				let thisStudent = this.studentsToPlace[i]
				let row = thisStudent.seat.row - 1
				let column = thisStudent.seat.column - 1
				this.placedStudents.push({student: thisStudent, originalIndex: i})
				this.grid[row][column].student = thisStudent
			}
		},
		saveSeats() {
			for (let i=0; i<this.grid.length; i++) {
				for (let k=0; k<this.grid[i].length; k++) {
					let studentToUpdate = this.grid[i][k].student
					if (studentToUpdate._id !== '') {
						studentToUpdate.seat = this.grid[i][k].newSeat

						db.updateSomething('students', {_id: this.grid[i][k].student._id}, studentToUpdate)
					}
				}
			}

			if (this.progress === 1) {
				console.log('working')
				this.$store.dispatch('setPreferences', {
					progress: ['created class', 'rearranged seats'],
					calculation: this.$store.state.preferences.calculation,
					positiveBehaviors: this.$store.state.preferences.positiveBehaviors,
					negativeBehaviors: this.$store.state.preferences.negativeBehaviors
				})
			}

			this.$router.push(`/chart/${this.id}`)
		}
	},
	created() {
		db.readSomething('classes', {_id: this.id})
			.then((results) => {
				this.classChart = results[0]

				for (let i=0; i<this.classChart.rows; i++) {
					this.grid.push([])

					for (let k=0; k<this.classChart.columns; k++) {
						this.grid[i].push({
							student: {
								_id: '',
								firstName: '',
								lastName: '',
								class: '',
								selected: '',
								seat: {
									row: 0,
									column: 0
								}
							},
							newSeat: {
								row: i + 1,
								column: k + 1
							}
						})
					}
				}

				this.calculateCardSize()

				db.readSomething('students', {class: this.id})
					.then(results => {
						this.studentsToPlace = results

						if (this.progress === 1) {
							this.choiceModalOpen = false
							this.introModalOpen = true
						}
					})
			})
	}
}
</script>

<style scoped>
#container {
	background: var(--black);
	width: 100vw;
	min-height: 100vh;
	height: 100%;
	display: grid;
	grid-template-rows: auto 1fr auto;
	grid-template-areas:
		"header"
		"main"
		"footer";
}

header {
	grid-area: "header";
}

main {
	grid-area: "main";
	overflow: auto;
}

footer {
	grid-area: "footer";
}

button {
  background: none;
  outline: none;
  border: none;
  cursor: pointer;
}

.action-button {
	margin: 0 5%;
	position: relative;
}

.action-button:disabled {
	opacity: .3;
	cursor: not-allowed;
}

.drag-area {
	width: auto;
	background: var(--light-gray);
}

.drag {
	display: inline-block;
	background: var(--light-gray);
	padding: 22.5px 20px;
	margin: 0;
}

.drag > span {
	font-family: 'ArchivoNarrow';
	font-size: 22px;
	cursor: move;
	vertical-align: middle;
	color: var(--black);
}

.row {
	text-align: center;
}

.drop-card {
	background: var(--light-gray);
	display: inline-block;
	vertical-align: middle;
	border-radius: 10px;
}

.drop-card > h2 {
	margin: 20px 0 10px 0;
}

.delete-button {
	color: var(--red);
	font-size: 18px;
	font-family: 'ArchivoNarrow';
}

.modal-header {
	background: var(--gray);
	text-align: center;
	height: 70px;
	padding-top: 25px;
}

.modal-header > h1 {
	color: var(--white);
}

.modal-body {
	height: 435px;
	text-align: center;
}

.step {
	display: inline-block;
	margin-top: 105px;
	margin-left: 40px;
	margin-right: 40px;
	width: 215px;
}

.step > img {
	width: 70px;
	vertical-align: middle;
}

.step > h2 {
	margin: 35px 0;
}

.modal-footer {
	background: var(--gray);
	text-align: center;
	height: 70px;
}

.modal-footer-button {
	padding: 5px 10px;
	background: var(--light-gray);
	color: var(--black);
	font-family: 'ArchivoNarrow';
	font-size: 18px;
	border-radius: 5px;
	cursor: pointer;
	outline: none;
	margin-top: 20px;
  	margin-left: 10px;
  	margin-right: 10px;
}

.border {
	border: 1px solid var(--black);
	width: 140px;
	height: 90px;
}

.yellow {
	background: var(--yellow);
}

.choice-modal-body {
	height: 180px;
	padding-top: 120px;
	text-align: center;
}

.choice-modal-footer {
	background: var(--gray);
	text-align: center;
	height: 75px;
}
</style>
