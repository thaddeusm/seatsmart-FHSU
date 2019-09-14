<template>
	<div>
		<h1>Transfer</h1>
		<p>
			In some situations it may be necessary to transfer seating chart information between computers (receiving a new computer, asking a substitute instructor to continue recording participation records, etc.).  Though Seatsmart files can be copied and pasted from your computer's document folder, this would force you to transfer all seating chart data rather than selecting a specific chart.
		</p>
		<p>
			As always, these records should be treated carefully as they may include personally identifiable information about your students.  Seatsmart only allows you to transfer one chart at a time in an effort to minimize unnecessary data sharing.
		</p>
		<p>
			Use the tools below to import and export your records.
		</p>
		<h4 class="subheading">Import</h4>
		<drop 
			:class="[over ? 'drop-bold-outline' : 'drop-light-outline', 'drop-area']" 
			@drop="handleDrop" 
			@dragover="over = true" 
			@dragleave="over = false"
		>
			<button class="drop-area-button" @click="handleOpen">import data</button>
			<span>or drag and drop here</span>
		</drop>
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
		<div id="loader" v-else></div>
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
			importMessage: ''
		}
	},
	computed: {
		classCharts() {
			return this.$store.state.allClasses
		}
	},
	methods: {
		generateTransferData() {
			this.exporting = true
			this.exportMessage = 'Finding chart data...'

			let classChartID = this.chartToTransfer

			let output = {
				"chartData": this.classCharts[this.chartToTransfer],
				"students": [],
				"activitySessions": []
			}

			// find activitySessions by chart
			db.readSomething('activitySessions', {chart: classChartID})
				.then(activitySessionResults => {
					output["activitySessions"] = activitySessionResults							
				})

			// find students by chart, notes by student
			db.readSomething('students', {class: classChartID})
				.then((results) => {
					let student = {
						"studentData": {},
						"notes": []
					}

					let promises = []

					for (let i=0; i<results.length; i++) {
						student["studentData"] = results[i]
						
						promises.push(db.readSomething('notes', {student: results[i]._id})
							.then(noteResults => {
								student["notes"] = noteResults

								output["students"].push(student)
							}))
					}

					Promise.all(promises).then(() => {
						console.log(output)

						let jsonObj = JSON.stringify(output)
						let defaultFilename = this.classCharts[this.chartToTransfer].name

						let options = {
							title: "Save Exported Chart",
							defaultPath: defaultFilename,
							buttonLabel: "Save",

							filters :[
								{name: 'json', extensions: ['json']}
							]
				        }

				        dialog.showSaveDialog(options, (filename) => {
				        	this.fileSavePath = filename

				        	if (filename !== undefined) {
				        		fs.writeFileSync(filename, jsonObj, 'utf-8', this.endExport())
				        	} else {
				        		// reset
				        	}
				        })
					})

				})
		},
		endExport(filename) {
			this.exporting = false
			this.exportMessage = `Saved ${this.fileSavePath}`
			let scope = this
			setTimeout(function() {
				scope.exportMessage = 'Choose a class chart to export:'
			}, 3000, scope)
		},
		processIncomingTransferData(jsonFile) {
			// check that the file is JSON

			// save the chart first

			// save the students next

			// save the notes

			// save the activitySessions
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

.wide-select {
	width: 200px;
	margin: 10px 0;
}

input {
	border-radius: 4px;
	font-size: 15px;
	padding: 7px 10px 9px 10px;
	margin: 10px 10px;
	color: var(--black);
	border: 1px solid var(--light-gray);
	outline: none;
}

.large-input {
	width: 300px;
}

.action-button {
	padding: 6px 10px 8px 10px;
	margin: 0 5px;
	box-shadow: 0px 0px 1px var(--black);
	font-size: 15px;
	border: none;
	border-radius: 5px;
	cursor: pointer;
	outline: none;
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

#loader {
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