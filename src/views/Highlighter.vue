<template>
	<div id="container">
		<header>
			<TitleBar :title="classChart.name" />
		</header>
		<main>
			<div class="row" v-for="(row, index) in grid" :key="`row${index}`" :style="rowMargins">
				<drop class="drop-card" v-for="(column, subIndex) in row" :key="`${index},${subIndex}`" :ref="`${index}And${subIndex}`" @drop="handleDrop(index, subIndex, ...arguments)" :style="[cardStyle, column.student.highlight == '' ? {background: '#E5E5E5'} : {background: column.student.highlight}]">
					<h4 v-if="classChart.columns < 7 && column.student.firstName.indexOf('(') !== -1">{{ column.student.firstName.split('(')[1].split(')')[0].split(' ')[0] }}</h4>
					<h4 v-else-if="classChart.columns < 7">{{ column.student.firstName.split(' ')[0] }}</h4>
					<h6 v-if="classChart.columns >= 7 && column.student.firstName.indexOf('(') !== -1">{{ column.student.firstName.split('(')[1].split(')')[0].split(' ')[0] }}</h6>
					<h6 v-else-if="classChart.columns >= 7">{{ column.student.firstName.split(' ')[0] }}</h6>
				</drop>
			</div>
		</main>
		<footer>
			<ActionBar background="var(--gray)" :hamburger="false" :collapsed="false" :nowrap="true">
				<template slot="left">
					<button class="action-button" @click="saveChanges">
						<img src="@/assets/checkmark.svg" alt="save">
					</button>
				</template>
				<template slot="center">
					<div class="drag-area">
						<drag
                            :effect-allowed="['link']"
                            v-for="(color, index) in colors"
                            :transfer-data="{highlight: color}"
                            :key="`color${index}`"
                            class="drag"
                            :style="{background: color}">
						</drag>
					</div>
					<button id="clearHighlightsButton" @click="clearAllHighlights">
						<span class="tooltip">clear all</span>
					</button>
				</template>
				<template slot="right">
					<button class="action-button" @click="$router.push(`/chart/${id}`)">
						<img src="@/assets/closesolid.svg" alt="cancel">
					</button>
				</template>
			</ActionBar>
		</footer>
		<TouchBar :show="true" :bar="[
			{type: 'spacer', size: 'flexible'},
			{type: 'button', label: 'save changes', method: function() {saveChanges()}},
			{type: 'button', label: 'discard changes', method: function() {$router.push(`/chart/${id}`)}},
			{type: 'spacer', size: 'flexible'}
	    ]"/>
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
	name: 'Highlighter',
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
			studentsToHighlight: [
				{
					_id: '',
					firstName: '',
					lastName: '',
					class: '',
					seleted: false,
                    highlight: '',
					seat: {
						row: 0,
						column: 0
					}
				}
			],
            colors: [
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
            ],
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
			return this.$store.state.preferences.progress
		}
	},
	methods: {
		calculateCardSize() {
			// determine ideal card dimensions
			let totalWidth = remote.getGlobal('screenWidth')
			let totalHeight = remote.getGlobal('screenHeight')
			let heightAdjusted

			heightAdjusted = totalHeight * .76

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
			let totalUsedVerticalSpace = totalPossibleVerticalSpace * .77
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

            if (this.grid[row][column].student.firstName !== '') {
                this.$refs[`${row}And${column}`][0].$el.style.background = data.highlight
                this.$set(this.grid[row][column].student, 'highlight', data.highlight)
            }

		},
		placeStudentsInSeats() {
			let remainingStudents = []
			for (let i=0; i<this.studentsToHighlight.length; i++) {
				let thisStudent = this.studentsToHighlight[i]
				if (thisStudent.seat.row !== null) {
					let row = thisStudent.seat.row - 1
					let column = thisStudent.seat.column - 1

                    if (thisStudent.highlight == undefined) {
                        thisStudent.highlight = '#E5E5E5'
                    }
					this.grid[row][column].student = thisStudent
				} else {
					remainingStudents.push(thisStudent)
				}
			}

			if (remainingStudents.length > 0) {
				this.studentsToHighlight = remainingStudents
			} else {
				this.studentsToHighlight = []
			}

		},
		clearAllHighlights() {
			for (let i=0; i<this.grid.length; i++) {
				for (let j=0; j<this.grid[i].length; j++) {
					if (this.grid[i][j].student.firstName !== '') {
		                this.$refs[`${i}And${j}`][0].$el.style.background = '#E5E5E5'
		                this.$set(this.grid[i][j].student, 'highlight', '#E5E5E5')
		            }
				}
			}

		},
		saveChanges() {
			if (this.studentsToHighlight.length == 0) {
				for (let i=0; i<this.grid.length; i++) {
					for (let k=0; k<this.grid[i].length; k++) {
						let studentToUpdate = this.grid[i][k].student
                        console.log(studentToUpdate)
						if (studentToUpdate._id !== '') {
							db.updateSomething('students', {_id: this.grid[i][k].student._id}, {$set: {highlight: studentToUpdate.highlight}})
						}
					}
				}


				this.$router.push(`/chart/${this.id}`)
			}
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
                                highlight: '#E5E5E5',
								seat: {
									row: 0,
									column: 0
								}
							}
						})
					}
				}

				this.calculateCardSize()

				db.readSomething('students', {class: this.id})
					.then(results => {
						this.studentsToHighlight = results

						this.placeStudentsInSeats()
					})
			})
	}
}
</script>

<style scoped>
#container {
	background: var(--black);
	width: 100%;
	height: 100%;
}

header {
	
}

main {
	
}

footer {
	position: fixed;
	bottom: 0;
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
	display: inline-block;
	vertical-align: middle;
}

.drag {
	display: inline-block;
	padding: 22.5px 20px;
	margin: 0 8px;
    cursor: move;
}

#clearHighlightsButton {
	display: inline-block;
	margin: 0 8px;
	cursor: pointer;
	vertical-align: middle;
	height: 45px;
	width: 40px;
	margin-bottom: 2px;
	border: 2px dotted var(--yellow);
}

#clearHighlightsButton:hover .tooltip {
	visibility: visible;
}

.tooltip {
	visibility: hidden;
	position: absolute;
	background: var(--yellow);
	padding: 5px;
	text-align: center;
	width: 50px;
	z-index: 100;
	border-radius: 5px;
	font-family: "ArchivoNarrow";
	font-size: 14px;
	bottom: 100%;
	margin-left: -30px;
}

.tooltip::after {
	content: " ";
	position: absolute;
	top: 100%; /* At the bottom of the tooltip */
	left: 50%;
	margin-left: -5px;
	border-width: 5px;
	border-style: solid;
	border-color: var(--yellow) transparent transparent transparent;
}


.row {
	text-align: center;
}

.drop-card {
	display: inline-grid;
	vertical-align: middle;
	border-radius: 10px;
	align-items: center;
}

.demo-drop-card {
	background: var(--light-gray);
	display: inline-grid;
	vertical-align: middle;
	border-radius: 10px;
	align-items: center;
}

.drop-card > h4 {
	/* margin: 10% 0 5% 0; */
	align-self: center;
}

.demo-drop-card > h4 {
	/* margin: 10% 0 5% 0; */
	align-self: center;
}

.drop-card > h6 {
	/* margin: 6% 0 2% 0; */
	align-self: center;
}

.delete-button {
	color: var(--red);
	font-size: 18px;
	align-self: flex-start;
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

.step > h5 {
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

.button-label {
	font-size: 18px;
	margin: 0 15%;
}

.fade-enter-active, .fade-leave-active {
    transition: opacity .2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
}
</style>
