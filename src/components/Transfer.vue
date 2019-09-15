<template>
	<div>
		<h1>Transfer</h1>
		<p>
			In some situations it may be necessary to transfer seating chart information between computers (receiving a new computer, asking a substitute instructor to continue recording participation records, etc.).  Though Seatsmart files can be copied and pasted from your computer's "(My) Documents" folder, this would force you to transfer all seating chart data rather than selecting a specific chart.
		</p>
		<p>
			As always, these records should be treated carefully as they may include personally identifiable information about your students.  Seatsmart only allows you to transfer one chart at a time in an effort to minimize unnecessary data sharing.
		</p>
		<p>
			Use the tools below to import and export your records.
		</p>
		<h4 class="subheading">Import</h4>
		<h5 class="message">{{ importMessage }}</h5>
		<div v-if="!importing">
			<drop 
				:class="[over ? 'drop-bold-outline' : 'drop-light-outline', 'drop-area']" 
				@drop="handleDrop" 
				@dragover="over = true" 
				@dragleave="over = false"
			>
				<button class="drop-area-button" @click="handleOpen">find chart file</button>
				<span>or drag and drop here</span>
			</drop>
		</div>
		<div class="loader" v-else></div>
		<h4 class="subheading">Export</h4>
		<h5 class="message">{{ exportMessage }}</h5>
		<div v-if="!exporting" id="exportForm">
			<select name="chartToTransfer" v-model="chartToTransfer" class="wide-select">
				<option 
					v-for="(classChart, index) in Object.values(classCharts)" 
					:key="`chart${index}`"
					:value="Object.keys(classCharts)[index]"
				>
					{{ classChart.name }} ({{ classChart.semester }} {{ classChart.year }})
				</option>
			</select>
			<button class="action-button bold" @click="generateTransferData" :disabled="chartToTransfer == ''">save</button>
		</div>
		<div class="loader" v-else></div>
	</div>
</template>

<script>
const { dialog } = require('electron').remote
const fs = require('fs')

import db from '@/db'

export default {
	name: 'Transfer',
	data() {
		return {
			over: false,
			chartToTransfer: '',
			fileSavePath: '',
			exporting: false,
			exportMessage: 'Choose a class chart to export:',
			importMessage: 'Find or drop in a chart:',
			importing: false,
			toExport: {
				"chartData": {},
				"students": [],
				"activitySessions": []
			}
		}
	},
	computed: {
		classCharts() {
			return this.$store.state.allClasses
		}
	},
	methods: {
		generateTransferData() {
			// provide UI feedback
			this.exporting = true
			this.exportMessage = 'Finding chart data...'

			let classChartID = this.chartToTransfer

			this.toExport["chartData"] = this.classCharts[this.chartToTransfer]

			// find activitySessions by chart
			db.readSomething('activitySessions', {chart: classChartID})
				.then(activitySessionResults => {
					this.toExport["activitySessions"] = activitySessionResults							
				})

			// find students by chart, notes by student
			db.readSomething('students', {class: classChartID})
				.then((results) => {
					this.buildStudentsForExport(results, 0)
				})
		},
		buildStudentsForExport(students, index) {
			db.readSomething('notes', {student: students[index]._id})
				.then((studentNotes) => {
					this.toExport["students"].push({
						"studentData": students[index],
						"notes": studentNotes
					})

					let newIndex = index + 1

					if (newIndex == students.length) {
						this.promptSave()
					} else {
						this.buildStudentsForExport(students, newIndex)
					}
				})
		},
		promptSave() {
			let jsonObj = JSON.stringify(this.toExport)
			let defaultFilename = this.classCharts[this.chartToTransfer].name

			// once ready, use native save dialog
			let options = {
				title: "Save Exported Chart",
				defaultPath: defaultFilename,
				buttonLabel: "Save",

				filters :[
					{name: 'json', extensions: ['json']}
				]
	        }

	        this.exportMessage = `${defaultFilename} is ready for export.`

	        dialog.showSaveDialog(options, (filename) => {
	        	this.fileSavePath = filename

	        	// handle cancelation
	        	if (filename !== undefined) {
	        		fs.writeFileSync(filename, jsonObj, 'utf-8', this.endExport())
	        	} else {
	        		this.exporting = false
	        		this.resetExport()
	        	}
	        })
		},
		endExport(filename) {
			this.exportMessage = `Saved ${this.fileSavePath}`
			this.exporting = false
			
			let scope = this
			setTimeout(function() {
				scope.resetExport()
			}, 3500, scope)
		},
		resetExport() {
			this.chartToTransfer = ''
			this.toExport = {
				"chartData": {},
				"students": [],
				"activitySessions": []
			}
			this.fileSavePath = ''
			this.exportMessage = 'Choose a class chart to export:'
		},
		resetImport(message) {
			this.importMessage = message
			this.importing = false
			this.over = false
			let scope = this
			setTimeout(function() {
				scope.importMessage = 'Find or drop in a chart:'
			}, 3500, scope)
		},
		processIncomingTransferData(jsonFile) {
			fs.readFile(jsonFile, 'utf8', (err, data) => {
				if (err) {
					this.importMessage = 'File error.  Please check that it is a .json file or try exporting again.'
				} else {
					this.importing = true

					let importedData
					try {
						importedData = JSON.parse(data)
					} catch (e) {
						this.resetImport('File error.  Please check that it is a .json file or try exporting again.')
					}
					
					this.importMessage = 'Importing chart data...'

					// save the chart first
					let chartToSave = importedData.chartData
					let newChartId

					db.createSomething('classes', {
						columns: chartToSave.columns,
						rows: chartToSave.rows,
						name: `(imported) ${chartToSave.name}`,
						semester: chartToSave.semester,
						year: chartToSave.year,
	                	archived: chartToSave.archived
					}).then((classChart) => {
						newChartId = classChart._id
						console.log('new chart saved', classChart)

						let activitySessions = importedData.activitySessions
						let students = importedData.students
						
						this.saveActivitySessionsAsync(newChartId, activitySessions)
						this.saveStudentsAsync(newChartId, students, 0)
					})
				}
			})
		},
		saveActivitySessionsAsync: async function(newChartId, activitySessions) {
			for (let i=0; i<activitySessions.length; i++) {
				let newSession = activitySessions[i]

				await db.createSomething('activitySessions', {
					date: newSession.date,
					activity: newSession.activity,
					responses: newSession.responses,
					chart: newChartId
				}).then(createdSession => {
					console.log('new activity session saved', createdSession)
				})
			}
		},
		saveStudentsAsync: async function(newChartId, students, index) {
			let newStudent = students[index].studentData

			let promises = []

			db.createSomething('students', {
				firstName: newStudent.firstName,
                lastName: newStudent.lastName,
                selected: newStudent.selected,
                highlight: newStudent.highlight,
                tigerID: newStudent.tigerID,
                class: newChartId,
                seat: {
                    row: newStudent.seat.row,
                    column: newStudent.seat.column
                }
			}).then((createdStudent) => {
				let newStudentNotes = students[index].notes

				for (let j=0; j<newStudentNotes.length; j++) {
					let newNote = newStudentNotes[j]

					promises.push(db.createSomething('notes', {
						behavior: {
							Abbreviation: newNote.behavior.Abbreviation,
							Description: newNote.behavior.Description,
							Weight: newNote.behavior.Weight
						},
						student: createdStudent._id,
						dateNoted: newNote.dateNoted,
						comment: newNote.comment,
						type: newNote.type
					}).then((createdNote) => {
						
					}))
				}
			})
			
			Promise.all(promises).then(() => {
				let newIndex = index + 1

				if (newIndex == students.length) {
					// end
					this.resetImport('Import complete.')
				} else {
					this.saveStudentsAsync(newChartId, students, newIndex)
				}
			})
		},
		handleDrop(data, event) {
			event.preventDefault()
			const files = event.dataTransfer.files

			let path = event.dataTransfer.files.item(0).path

			this.processIncomingTransferData(path)
		},
		handleOpen() {
			let path = dialog.showOpenDialog({ properties: ['openFile'] })

			// in case they click 'cancel' on the dialog box
			if (path !== undefined) {
				this.processIncomingTransferData(path[0])
			}
		}
	}
}
</script>

<style scoped>
@keyframes spin {
    from {transform: rotate(0);}
    to {transform: rotate(360deg);}
}

h1 {
	margin-bottom: 25px;
}

p {
	margin: 10px 0;
}

.subheading {
	margin-top: 60px;
}

h5 {
	margin: 10px 0;
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

#exportForm {
	display: grid;
	grid-template-columns: 1fr auto;
	align-items: center;
}

.wide-select {
	width: 100%;
	margin: 10px 0;
}

.action-button {
	padding: 7px 10px 7px 10px;
	margin: 0 5px;
	box-shadow: 0px 0px 1px var(--black);
	font-size: 15px;
	border: none;
	border-radius: 5px;
	cursor: pointer;
	outline: none;
	height: 30px;
}

.neutral {
	background: var(--gray);
	color: var(--white);
}

.bold {
	background: var(--yellow);
	color: var(--black);
}

.action-button:disabled {
	background: var(--light-gray)!important;
	opacity: .6;
	cursor: not-allowed;
}

.loader {
    height: 50px;
    width: 50px;
    margin: 0 auto;
    border-radius: 50px;
    border-top: 3px solid var(--yellow);
    border-right: 3px solid var(--light-gray);
    border-bottom: 3px solid var(--light-gray);
    border-left: 3px solid var(--light-gray);
    animation-name: spin;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
}
</style>