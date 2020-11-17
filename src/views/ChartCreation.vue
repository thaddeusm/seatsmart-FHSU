<template>
	<div id="container">
		<header>
			<h1 ref="pageHeader" v-if="id == undefined">New Chart</h1>
			<h1 ref="pageHeader" v-else>Edit Chart ({{ classChart.name }})</h1>
			<h6 v-if="progress == 1">Enter the columns and rows of seating in the classroom:</h6>
			<h6 v-if="progress == 2 && mode == 'new'">Fill in information about the class:</h6>
			<h6 v-if="progress == 2 && mode == 'edit'">Edit information about the class:</h6>
			<h6 v-if="progress == 3 && mode == 'new'">Create a student list or import the XLSX from TigerCentral <button class="modal-button" @click="modalOpen = true">(?)</button></h6>
			<h6 v-if="progress == 3 && mode == 'edit'">Edit the student list:</h6>
		</header>
		<section id="diagram">
			<SeatingDiagram :rows="rowNumber" :columns="columnNumber" />
		</section>
		<section id="chartForm">
			<section class="error-area">
				<h6><img v-if="alertMessage.length > 0" src="@/assets/alert.svg" alt="alert icon" class="alert-icon-small"> {{ alertMessage }}</h6>
			</section>
			<section id="formOne" v-if="progress == 1">
				<div class="form-container">
					<h3>Classroom Arrangement</h3>
					<div class="input-wrapper">
						<div class="label-row">
							<h5 class="select-label">How many chairs will you use in each row?</h5>
						</div>
						<select name="columns" v-model="classChart.columns">
							<option 
								v-for="(columnOption, index) in columnOptions"
								:key="`columnOption${index}`"
								:value="columnOption"
							>
								{{ columnOption }}
							</option>
						</select>
						<div class="label-row">
							<h5 class="select-label">How many rows will you use?</h5>
						</div>
						<select name="rows" v-model="classChart.rows">
							<option 
								v-for="(rowOption, index) in rowOptions"
								:key="`rowOption${index}`"
								:value="rowOption"
							>
								{{ rowOption }}
							</option>
						</select>
					</div>
				</div>
				<section class="progress-button-area">
					<button class="progress-button" @click="routeBack"><img class="back-icon" src="@/assets/backarrowwhite.svg" alt="back icon"></button>
					<button class="progress-button" @click="changeProgress(2)">add class info</button>
				</section>
			</section>
			<section id="formTwo" v-if="progress == 2">
				<div class="form-container">
					<h3>Class Information</h3>
					<div class="input-wrapper">
						<h5>Name</h5>
						<input class="large-input" type="text" name="className" v-model="classChart.name" placeholder="(VFA, Leadership, etc.)">
					</div>
					<div class="input-wrapper">
						<div class="label-row">
							<h5 class="select-label">Semester</h5>
						</div>
						<select name="semester" v-model="classChart.semester">
							<option value="Fall">Fall</option>
							<option value="Spring">Spring</option>
							<option value="Summer">Summer</option>
						</select>
						<div class="label-row">
							<h5 class="select-label">Year</h5>
						</div>
						<select name="year" v-model="classChart.year">
							<option 
								v-for="(year, index) in years"
								:key="`year${index}`"
								:value="year"
							>
								{{ year }}
							</option>
						</select>
					</div>
				</div>
				<section class="progress-button-area">
					<button class="progress-button" @click="changeProgress(1)">back</button>
					<button class="progress-button" @click="changeProgress(3)">add students</button>
				</section>
			</section>
			<section id="formThree" v-if="progress == 3">
				<div class="form-container-large">
					<h3 v-if="mode === 'new'">Import or Create Class Roster</h3>
					<h3 v-else>Edit Class Roster</h3>
					<div class="input-area">
						<drop :class="[over ? 'drop-bold-outline' : 'drop-light-outline', 'drop-area']" @drop="handleDrop" @dragover="over = true" @dragleave="over = false" v-if="mode === 'new' && !importSuccess">
							<button class="drop-area-button" @click="handleOpen">import roster</button>
							<span>or drag and drop here <button class="modal-button-white" @click="modalOpen = true">(?)</button></span>
						</drop>
						<div class="drop-area" v-else-if="mode === 'new' && importSuccess">
							<button class="drop-area-button" @click="resetImport">import a different file</button>
						</div>
						<div class="label-row black-border">
							<span>First Name</span>
							<span>Last Name</span>
							<span>Tiger ID</span>
						</div>
						<div ref="formArea">
							<div class="form-group" v-for="(student, index) in classStudents" :key="index">
								<input class="small-input" type="text" name="firstName" v-model="student.firstName" :ref="index">
								<input class="small-input" type="text" name="lastName" v-model="student.lastName">
								<input class="small-input" type="text" name="tigerID" v-model="student.tigerID" placeholder="optional">
								<button class="delete-button" @click="removeFormGroup(index)">-</button>
							</div>
							<section id="addButtonArea">
								<button class="add-button" @click="addFormGroup()">+</button>
							</section>
						</div>
					</div>
				</div>
				<section class="progress-button-area">
					<button class="progress-button" @click="changeProgress(2)">back</button>
					<button class="progress-button" @click="viewSavedChart" v-if="classStudents.length > 2">view chart</button>
				</section>
			</section>
		</section>
		<section id="progressNodes">
			<ProgressNodes :steps="steps" :progress="progress" />
		</section>
		<transition name="fade">
			<Modal v-if="modalOpen" v-on:trigger-close="modalOpen = false" :dismissable="true" size="large">
				<template slot="content">
					<div class="modal-header">
						<h1>Import a Roster (FHSU Users)</h1>
					</div>
					<div class="modal-body">
						<div class="step">
							<img src="@/assets/tiger.png" alt="FHSU tiger">
							<h4>Teaching > Course Rosters on Tiger Central</h4>
							<h4>1</h4>
						</div>
						<div class="step">
							<img src="@/assets/excel.svg" alt="Excel file icon">
							<h4>Click on the Excel icon next to a course</h4>
							<h4>2</h4>
						</div>
						<div class="step">
							<img src="@/assets/import.svg" alt="import icon">
							<h4>import or drag the Excel file into Seatsmart</h4>
							<h4>3</h4>
						</div>
					</div>
					<div class="modal-footer">
						<button class="modal-footer-button" @click="modalOpen = false">Got it</button>
					</div>
				</template>
			</Modal>
		</transition>
		<transition name="fade">
			<Modal v-if="alertModalOpen" v-on:trigger-close="alertModalOpen = false" :dismissable="true" size="small">
				<template slot="content">
					<img src="@/assets/alert.svg" alt="alert icon" class="alert-icon-large">
					<div class="alert-modal-body" v-if="seatingConflict">
						<h4>The edited chart causes a seating conflict with at least one student.</h4>
						<h4>Do you want to reset seating assignments and proceed with current edits?</h4>
					</div>
					<div class="alert-modal-body" v-else-if="incompleteInformation">
						<h4>Some information is missing about the student(s) you have added.</h4>
						<h4>Please fill in the missing information and try again.</h4>
					</div>
					<div class="alert-modal-footer" v-if="seatingConflict">
						<button class="modal-footer-button yellow" @click="resetSeating">Yes</button>
						<button class="modal-footer-button" @click="cancelSeatingChange">cancel</button>
					</div>
					<div class="alert-modal-footer" v-else-if="incompleteInformation">
						<button class="modal-footer-button" @click="alertModalOpen = false">Got it</button>
					</div>
				</template>
			</Modal>
		</transition>
		<TouchBar :show="true" :bar="[
			{type: 'button', label: 'Back', method: routeBack}
		]"
		/>
	</div>
</template>

<script>
import db from '@/db.js'
import SeatingDiagram from '@/components/SeatingDiagram.vue'
import Tabs from '@/components/Tabs.vue'
import ProgressNodes from '@/components/ProgressNodes.vue'
import TouchBar from '@/components/TouchBar.vue'
import Modal from '@/components/Modal.vue'
import moment from 'moment'
import XLSX from 'xlsx'
const { dialog } = require('electron').remote

export default {
	name: 'ChartCreation',
	components: {
		SeatingDiagram,
		Tabs,
		ProgressNodes,
		TouchBar,
		Modal
	},
	props: ['id'],
	data() {
		return {
			mode: 'new',
			alertMessage: '',
			modalOpen: false,
			alertModalOpen: false,
			over: false,
			progress: 1,
			steps: 3,
			years: [],
			importSuccess: false,
			classChart: {
				columns: 2,
				rows: 1,
				name: null,
				semester: null,
				year: null,
				_id: null,
                archived: null
			},
			classStudents: [
				{
					firstName: null,
					lastName: null,
					tigerID: null,
					selected: false,
					class: null,
					highlight: '',
					seat: {
						column: null,
						row: null
					}
				}
			],
			deletedStudents: [],
			numberOfStudentsAdded: 0,
			seatingConflict: false,
			incompleteInformation: false,
			columnOptions: [
				1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
			],
			rowOptions: [
				1, 2, 3, 4, 5, 6, 7, 8, 9
			]
		}
	},
	computed: {
		lastView() {
			return this.$store.state.lastView
		},
		rowNumber() {
			return parseInt(this.classChart.rows)
		},
		columnNumber() {
			return parseInt(this.classChart.columns)
		}
	},
	methods: {
		saveClassChart() {
			if (this.classChart._id !== null) {
				db.updateSomething('classes', {_id: this.classChart._id}, {
					columns: this.columnNumber,
					rows: this.rowNumber,
					name: this.classChart.name,
					semester: this.classChart.semester,
					year: this.classChart.year,
 					archived: this.classChart.archived
				}).then((numUpdated) => {
					return numUpdated
				})
			} else {
				db.createSomething('classes', {
					columns: this.columnNumber,
					rows: this.rowNumber,
					name: this.classChart.name,
					semester: this.classChart.semester,
					year: this.classChart.year,
                	archived: false
				}).then((classChart) => {
					this.classChart._id = classChart._id
					this.$refs.pageHeader.innerHTML += ' (' + this.classChart.name + ')'
					this.classStudents[0].class = classChart._id

					return classChart
				})

			}
		},
		selectNumber(category, num) {
			num++
			this.classChart[`${category}`] = num
		},
		errorExists(step) {
			this.alertMessage = ''
			let error = false

			// handle error checks for each form step
			switch (step) {
				case 2:
				if (this.columnNumber == 1) {
					this.alertMessage = "Please verify the number of chairs in each row."
					error = true
				} else if (this.rowNumber == 1) {
					this.alertMessage = "Please verify the number of rows."
					error = true
				}
				break
				case 3:
				if (this.classChart.semester == null) {
					this.alertMessage = "Please select a semester."
					error = true
				} else if (this.classChart.year == null) {
					this.alertMessage = "Please select a year."
					error = true
				}
				break
				case 4:
				if (this.rowNumber * this.columnNumber < this.classStudents.length) {
					this.alertMessage = 'There are not enough seats in the chart for students'
					error = true
				}
				break
			}

			return error
		},
		changeProgress(num) {
			// adjust ProgressNode prop
			if (!this.errorExists(num)) {
				this.progress = num

				if (num === 3) {
					if (this.mode == 'new') {
						this.saveClassChart()
					}
				}
			}
		},
		addFormGroup() {
			this.alertMessage = ''

			let obj = {
				firstName: null,
				lastName: null,
				tigerID: null,
				selected: false,
				highlight: '',
				class: this.classChart._id,
				seat: {
					row: null,
					column: null
				}
			}
			if (this.mode === 'edit') {
				this.numberOfStudentsAdded++
			}

			this.classStudents.push(obj)

			// move focus to new row
			let scope = this
			setTimeout(function() {
				let lastInput = scope.classStudents.length - 1
				
				scope.$refs[lastInput][0].focus()
			}, 300, scope)
		},
		removeFormGroup(index) {
			this.alertMessage = ''
			if (this.mode === 'edit') {
				this.deletedStudents.push(this.classStudents[index])
			}
			this.classStudents.splice(index, 1)
		},
		handleDrop(data, event) {
			event.preventDefault()
			const files = event.dataTransfer.files

			let path = event.dataTransfer.files.item(0).path

			this.processXLSX(path)
		},
		handleOpen() {
			let path = dialog.showOpenDialog({ properties: ['openFile'] })

			// in case they click 'cancel' on the dialog box
			if (path !== undefined) {
				this.processXLSX(path[0])
			}
		},
		processXLSX(path) {
			var workbook = XLSX.readFile(path)

			// FHSU-specific processing
			var worksheet = workbook.Sheets['Course Roster']

			var keys = Object.keys(worksheet)
			var ids = []
			var names = []
			var students = []
			var statuses = []

			for (let i=0; i<keys.length; i++) {
				if (keys[i][0] === 'A') {
					names.push(worksheet[keys[i]].v)
				} else if (keys[i][0] === 'B') {
					ids.push(worksheet[keys[i]].v)
				} else if (keys[i][0] === 'D') {
					statuses.push(worksheet[keys[i]].v)
				}
			}

			for (let i=0; i<names.length; i++) {
				if (statuses[i] === 'EN') {
					students.push({
						name: names[i],
						id: ids[i],
						status: statuses[i]
					})
				}
			}

			for (let i=0; i<students.length; i++) {
				let split = students[i].name.split(',')
				let lastName = split[0]
				let firstName = split[1].slice(1)


				this.classStudents.push({
					firstName: firstName,
					lastName: lastName,
					tigerID: '' + students[i].id + '',
					selected: false,
					highlight: '',
					class: this.classChart._id,
					seat: {
						row: null,
						column: null
					}
				})
			}

			this.classStudents.shift()

			if (this.classStudents.length === 0) {
				this.alertMessage = 'Please check the file type (xlsx) and try again.'
			} else {
				this.alertMessage = ''
				this.importSuccess = true
				this.over = false
			}
		},
		resetImport() {
			this.importSuccess = false
			this.over = false
			this.classStudents = [{
				firstName: null,
				lastName: null,
				tigerID: null,
				selected: false,
				highlight: '',
				class: null,
				seat: {
					row: null,
					column: null
				}
			}]
		},
		routeBack() {
			if (this.classChart._id !== null && this.mode == 'new') {
				db.deleteSomething('classes' ,{_id: this.classChart._id})
			}

			this.$router.push(this.lastView)
		},
		cancelSeatingChange() {
			this.alertModalOpen = false
			this.changeProgress(1)
		},
		resetSeating() {
			// randomly place students in unique seats and save edits
			let col = 1
			let row = 1
			for (let i=0; i<this.classStudents.length; i++) {
				let student = this.classStudents[i]

				student.seat.row = row
				student.seat.column = col

				db.updateSomething('students', {_id: student._id}, student)
				.then((result) => {
					console.log(result)
				})

				if (col === this.classChart.columns) {
					col = 1
					row++
				} else {
					col++
				}
			}
			this.saveClassChart()
			this.$router.push(`/chart/${this.classChart._id}`)
		},
		viewSavedChart() {
			// filter empty form groups
			let studentsToSave = this.classStudents.filter((student) => {
				return student.firstName !== null && student.lastName !== null
			})

			// ensure there are enough seats for listed students
			if (this.errorExists(4) === true) {
				this.progress = 1
			} else {
				if (this.mode === 'new') {
					// randomly place students in unique seats
					let col = 1
					let row = 1
					for (let i=0; i<studentsToSave.length; i++) {
						let student = studentsToSave[i]

						student.seat.row = row
						student.seat.column = col

						db.createSomething('students', student)

						if (col === this.classChart.columns) {
							col = 1
							row++
						} else {
							col++
						}

					}

					if (this.$store.state.preferences.progress.indexOf('created class') === -1) {
						this.$store.dispatch('setPreferences', {
							progress: ['created class']
						})
					}

					this.$store.dispatch('getAllClasses')

					this.$router.push(`/chart/${this.classChart._id}`)
				} else {
					// check for deleted students
					if (this.deletedStudents.length !== 0) {
						for (let i=0; i<this.deletedStudents.length; i++) {
							db.deleteSomething('students', {_id: this.deletedStudents[i]._id})
							.then((numDeleted) => {
								if (numDeleted > 0) {
									console.log(`${this.deletedStudents[i].firstName} was deleted`)
								}

								db.deleteSomething('notes', {student: this.deletedStudents[i]._id})
								.then((numNotesDeleted) => {
									console.log(`${numNotesDeleted} notes were deleted`)
								})
							})
						}
					}

					// check for added students
					if (this.numberOfStudentsAdded > 0) {
						this.incompleteInformation = false
						// check for missing info
						for (let i=0; i<this.numberOfStudentsAdded; i++) {
							let index = i + 1
							let newStudent = this.classStudents[this.classStudents.length - index]

							if (newStudent.firstName == null || newStudent.lastName == null) {
								this.incompleteInformation = true
								break
							}
						}

					}

					// save any changes to current student info
					for (let i=0; i<this.classStudents.length; i++) {
						db.updateSomething('students', {_id: this.classStudents[i]._id}, {
							$set: {
								firstName: this.classStudents[i].firstName,
								lastName: this.classStudents[i].lastName,
								tigerID: this.classStudents[i].tigerID,
							}
						})
					}

					// check for errors with student's current seats
					this.seatingConflict = false
					for (let i=0; i<this.classStudents.length; i++) {
						if (this.classStudents[i].seat.row > this.rowNumber || this.classStudents[i].seat.column > this.columnNumber) {
							this.seatingConflict = true
							break
						}
					}

					if (this.incompleteInformation) {
						this.alertModalOpen = true
					} else if (this.seatingConflict) {
						this.alertModalOpen = true
					} else {
						// if all information, save new students
						if (!this.incompleteInformation) {

							for (let i=0; i<this.numberOfStudentsAdded; i++) {
								let index = i + 1
								let newStudent = this.classStudents[this.classStudents.length - index]

								db.createSomething('students', newStudent)

							}
						}

						let numUpdated = this.saveClassChart()

						this.$store.dispatch('getAllClasses')
						this.$router.push(`/chart/${this.classChart._id}`)
					}
				}

			}
		}
	},
	created() {
		if (this.id !== undefined) {
			db.readSomething('classes', {_id: this.id})
				.then((existingClass) => {
					this.classChart.name = existingClass[0].name
					this.classChart.columns = existingClass[0].columns
					this.classChart.rows = existingClass[0].rows
					this.classChart.semester = existingClass[0].semester
					this.classChart.year = existingClass[0].year
					this.classChart._id = existingClass[0]._id


					this.mode = 'edit'

					db.readSomething('students', {class: this.id})
					.then((students) => {
						this.classStudents = students

					})
				})
		} else {
			this.classChart.columns = 1
			this.classChart.rows = 1
		}

		this.years.push(moment().year())
		this.years.push(this.years[0] + 1)
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
	grid-template-columns: 50% 50%;
	grid-template-areas:
	'head head'
	'diagram chartForm'
	'. .';
}

header {
	grid-area: head;
	text-align: center;
	align-self: center;
	margin-bottom: 40px;
}

h1 {
	margin-top: 70px;
	margin-bottom: 15px;
}

#diagram {
	grid-area: diagram;
	border-right: 2px solid var(--dark-gray);
}

#chartForm {
	grid-area: chartForm;
	justify-self: center;
	align-self: center;
	margin: 0 auto;
}

#progressNodes {
	position: fixed;
	bottom: 0;
	width: 100%;
	background: var(--light-gray);
}

.error-area {
	height: 15px;
	text-align: center;
	margin-bottom: 15px;
}

.error-area > h6 {
	color: var(--red);
	display: inline-block;
}

.number-button {
	background: var(--gray);
	color: var(--white);
	width: 57px;
	height: 57px;
	margin: 5px;
	border-radius: 10px;
	font-size: 36px;
	cursor: pointer;
	outline: none;
}

.number-button:hover {
	box-shadow: 0px 0px 1px var(--black);
}

.selected {
	background: var(--black);
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

progress-button:disabled {
	cursor: not-allowed;
}

#formOne {
	width: 350px;
	margin-left: auto;
	margin-right: auto;
}

#formTwo {
	width: 390px;
}

.form-container {
	background: var(--yellow);
	border-radius: 10px;
	padding: 10px;
}

.form-container-large {
	margin-top: 10px;
	margin-bottom: 10px;
	background: var(--yellow);
	border-radius: 10px;
	padding: 10px;
}

.form-container-large > h3 {
	text-align: center;
}

.form-container > h3 {
	text-align: center;
}

.input-wrapper {
	background: var(--light-gray);
	padding: 20px;
	margin: 15px 0;
	border-radius: 10px;
}

.input-wrapper > h5 {
	padding-left: 5px;
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

.small-input {
	border-radius: 4px;
	font-size: 15px;
	padding: 7px 10px 9px 10px;
	margin: 10px 5px;
	width: 100px;
	color: var(--black);
	border: 1px solid var(--light-gray);
	outline: none;
}

.select-label {
	display: inline-block;
	margin: 0;
}

.label-row {
	padding-bottom: 5px;
	padding-left: 2px;
}

.label-row > span {
	display: inline-block;
	width: 120px;
	margin: 0 5px;
}

.black-border {
	border-bottom: 1px solid var(--black);
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

.input-area {
	background: var(--light-gray);
	margin: 20px 0;
	padding: 10px;
	height: 280px;
	overflow: auto;
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

.drop-area {
	height: 40px;
	text-align: center;
	padding: 20px 10px 10px 10px;
	margin: 10px 0 20px 0;
	background: var(--gray);
	border-radius: 10px;
}

.drop-light-outline {
	border: 2px dashed var(--black);
}

.drop-bold-outline {
	border: 2px solid var(--white);
}

.drop-area-button {
	padding: 5px 10px;
	background: var(--light-gray);
	color: var(--black);
	font-size: 16px;
	border-radius: 5px;
	cursor: pointer;
	outline: none;
}

.drop-area > span {
	color: var(--yellow);
	margin-left: 15px;
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

.modal-button-white {
	background: none;
	outline: none;
	color: var(--white);
	border: none;
	cursor: pointer;
	vertical-align: text-top;
	font-size: 14px;
}

.modal-header {
	background: var(--gray);
	text-align: center;
	height: 70px;
	padding-top: 25px;
}

.modal-header > h1 {
	color: var(--white);
	margin-top: 0;
}

.modal-body {
	height: 435px;
	text-align: center;
}

.step {
	display: inline-block;
	margin-top: 90px;
	margin-left: 40px;
	margin-right: 40px;
	width: 215px;
}

.step > img {
	width: 70px;
	vertical-align: middle;
}

.step > h4 {
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

.yellow {
	background: var(--yellow);
}

.alert-modal-body {
	height: 150px;
	padding-top: 70px;
	text-align: center;
}

.alert-modal-body > h4:first-child {
	margin-bottom: 10px;
}

.alert-modal-footer {
	background: var(--gray);
	text-align: center;
	height: 75px;
}

.alert-icon-small {
	vertical-align: middle;
	width: 20px;
	margin-bottom: 3px;
	margin-right: 5px;
}

.alert-icon-large {
	vertical-align: middle;
	width: 50px;
	margin-top: 30px;
	display: block;
	margin-left: auto;
	margin-right: auto;
}

.back-icon {
	width: 15px;
}

select {
	width: 100%;
	margin: 5px 0 20px 0;
}

.fade-enter-active, .fade-leave-active {
	transition: opacity .2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
	opacity: 0;
}
</style>
				}
