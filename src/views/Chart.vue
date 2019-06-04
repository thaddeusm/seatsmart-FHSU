<template>
	<div id="chartContainer">
		<header id="chartHeader">
			<TitleBar
				:edit="cardType == 'edit'"
				v-on:edit-info="setLastView(`/chart/${id}`)"
				:title="classInfo.name"
			/>
			<RemoteAdapter 
				v-on:open-remote-panel="openRemotePanel"
				v-on:set-room-id="setRemoteRoomID"
				v-on:remote-connected="remoteClientConnected = true"
				v-on:connected="remoteConnected = true"
				v-on:disconnected="remoteConnected = false"
				v-on:action-completed="addToActionLog"
				v-on:absence="addAbsence"
				v-on:select-random="selectRandom"
				v-on:clear-random="clearRandom"
				v-on:end-config="remoteConfigured = true"
				:classInfo="classInfo"
				:students="students"
				:absentStudents="absentStudents"
				:randomStudent="randomStudent"
			/>
		</header>
		<main id="chartMain" ref="chartMain">
			<section v-if="!inverted" class="row" v-for="(row, index) in classInfo.rows" :style="rowMargins" :key="`row${index},${students.length}`">
				<div v-for="(column, subIndex) in classInfo.columns" class="column" :style="cardStyle">
					<NameCard
						:type="cardType"
						:conserveSpace="isHuge"
						:row="index + 1"
						:column="subIndex + 1"
						:classId="classInfo._id"
						:deselect="deselect"
						v-on:open-note-modal="openNoteModal"
						v-on:open-new-student-modal="openNewStudentModal"
						v-on:open-edit-student-modal="openEditStudentModal"
						v-on:absence="addAbsence"
						:key="students[students.length - 1]._id + index"
						:chosen="chosenSeat.row == index + 1 && chosenSeat.column == subIndex + 1"
					/>
				</div>
			</section>
			<section v-if="inverted" class="row" v-for="(row, index) in classInfo.rows" :style="rowMargins" :key="`invertedRow${index},${students.length}`">
				<div v-for="(column, subIndex) in classInfo.columns" class="column" :style="cardStyle">			
					<NameCard
						:type="cardType"
						:conserveSpace="isHuge"
						:row="classInfo.rows - index"
						:column="classInfo.columns - subIndex"
						:classId="classInfo._id"
						v-on:open-note-modal="openNoteModal"
						v-on:open-new-student-modal="openNewStudentModal"
						v-on:open-edit-student-modal="openEditStudentModal"
						v-on:absence="addAbsence"
						:deselect="deselect"
						:key="students[students.length - 1]._id + index"
						:chosen="chosenSeat.row == index + 1 && chosenSeat.column == subIndex + 1" 
					/>
				</div>
			</section>
		</main>
		<footer id="chartFooter">
			<ActionBar background="var(--gray)" :hamburger="true" v-on:expand="toggleExpand(true)" v-on:contract="toggleExpand(false)" :collapsed="false">
		        <template slot="left">
		        	<router-link to="/"><img src="@/assets/home.svg" alt="home icon"></router-link>
		        </template>
		        <template slot="center">
					<button @click="toggleEditMode" class="action-button">
						<img v-if="cardType !== 'edit'" src="@/assets/editwhite.svg" alt="edit icon">
						<img v-else src="@/assets/edit.svg" alt="edit icon">
						<span class="tooltip">toggle edit mode</span>
					</button>
		        	<button @click="rearrangeSeats" class="action-button">
						<img src="@/assets/rearrange.svg" alt="rearrange icon">
						<span class="tooltip">change student seating</span>
					</button>
					<button @click="highlightStudents" class="action-button">
						<img src="@/assets/highlight.svg" alt="highlight icon">
						<span class="tooltip">highlight students</span>
					</button>
		        	<button @dblclick="clearRandom" @click="selectRandom" class="action-button">
						<img src="@/assets/random.svg" alt="select random student icon">
						<span class="tooltip">select a random student</span>
					</button>
		        	<button @click="toggleCardStyle" class="action-button">
						<img src="@/assets/changecard.svg" alt="change card style icon">
						<span class="tooltip">toggle card styles</span>
					</button>
		        	<button @click="showTrends" class="action-button">
		        		<img v-if="!showingTrends" src="@/assets/trendicon.svg" alt="show participation trends icon">
		        		<img v-else src="@/assets/trendiconyellow.svg" alt="show participation trends icon">
						<span class="tooltip">show/hide recent trends</span>
		        	</button>
					<button @click="invertChart" class="action-button">
						<img src="@/assets/present.svg" alt="present icon" v-if="!inverted">
						<img src="@/assets/presentyellow.svg" alt="present icon" v-else>
						<span class="tooltip">toggle presentation mode</span>
					</button>
		        	<button @click="createBulkNote" class="action-button">
						<img src="@/assets/groupnote.svg" alt="group note icon">
						<span class="tooltip">note for multiple students</span>
					</button>
					<button @click="deselectStudents" class="action-button">
						<img src="@/assets/star-deselect.svg" alt="deselect all students icon">
						<span class="tooltip">deselect all students</span>
					</button>
		        </template>
		        <template slot="right">
		        	<button @click="openModal"><img src="@/assets/cog.svg" alt="settings icon"></button>
		    	</template>
		    </ActionBar>
		</footer>
		<transition name="fade">
      		<Modal v-if="noteModalOpen" v-on:trigger-close="noteModalOpen = false" :dismissable="true" size="large">
        		<template slot="content">
          			<NoteForm
						type="single"
						:student="newNoteStudent"
						v-on:trigger-modal-close="noteModalOpen = false"
						v-on:absence="addAbsence"
					/>
        		</template>
      		</Modal>
    	</transition>
		<transition name="fade">
      		<Modal v-if="newStudentModalOpen" v-on:trigger-close="resetNewStudent" :dismissable="false" size="small">
        		<template slot="content">
					<div class="student-modal">
						<section class="student-modal-header">
							<h3>Add a New Student</h3>
						</section>
						<section class="student-form">
							<div>
								<div class="form-group">
									<div class="alert-area"><span class="student-alert">{{ studentFormAlertMessage }}</span></div>
									<input class="small-input" type="text" name="firstName" v-model="newStudent.firstName" placeholder="first name">
									<input class="small-input" type="text" name="lastName" v-model="newStudent.lastName" placeholder="last name">
									<input class="small-input" type="text" name="tigerID" v-model="newStudent.tigerID" placeholder="Tiger ID">
								</div>
							</div>
						</section>
						<section class="student-modal-footer">
							<button class="student-footer-button" @click="resetNewStudent">Cancel</button>
							<button class="student-footer-button yellow" @click="saveNewStudent">Save</button>
						</section>
					</div>
        		</template>
      		</Modal>
    	</transition>
		<transition name="fade">
      		<Modal v-if="editStudentModalOpen" v-on:trigger-close="resetStudentToEdit" :dismissable="false" size="small">
        		<template slot="content">
					<div class="student-modal">
						<section class="student-modal-header">
							<h3>Edit {{ studentToEdit.firstName }} {{ studentToEdit.lastName[0] }}.</h3>
						</section>
						<section class="student-form">
							<div v-if="!promptStudentDelete">
								<div class="form-group">
									<div class="alert-area"><span class="student-alert">{{ studentFormAlertMessage }}</span></div>
									<input class="small-input" type="text" name="firstName" v-model="studentToEdit.firstName" placeholder="first name">
									<input class="small-input" type="text" name="lastName" v-model="studentToEdit.lastName" placeholder="last name">
									<input class="small-input" type="text" name="tigerID" v-model="studentToEdit.tigerID" placeholder="Tiger ID">
								</div>
							</div>
							<div v-else>
								<h4>
									Are you sure you want to permanently delete {{ studentToEdit.firstName }}?
								</h4>
							</div>
						</section>
						<section class="student-modal-footer">
							<button class="student-footer-button red" @click="promptStudentDelete = true" v-if="!promptStudentDelete">Delete Student</button>
							<button class="student-footer-button" @click="resetStudentToEdit">Cancel</button>
							<button class="student-footer-button red" v-if="promptStudentDelete" @click="deleteStudent">Delete {{ studentToEdit.firstName }}</button>
							<button class="student-footer-button yellow" @click="saveEditedStudent" v-if="!promptStudentDelete">Save</button>
						</section>
					</div>
        		</template>
      		</Modal>
    	</transition>
		<transition name="fade">
      		<Modal v-if="modalOpen" v-on:trigger-close="closeSettings" :dismissable="false" size="large">
        		<template slot="content">
          			<Settings v-on:trigger-modal-close="closeSettings"/>
        		</template>
      		</Modal>
    	</transition>
		<transition name="fade">
			<Modal v-if="alert.isAlert" :dismissable="false" size="small">
				<template slot="content">
					<div class="alert-modal-body">
	    				<h4 v-html="alert.alertMessage"></h4>
	    			</div>
	    			<div class="alert-modal-footer">
	    				<button class="modal-footer-button yellow" @click="alert.action" v-if="alert.action !== null">Ok</button>
	    				<button class="modal-footer-button" @click="alert.isAlert = false" v-else>Got it</button>
	    			</div>
				</template>
			</Modal>
		</transition>
		<transition name="fade">
			<Modal v-if="remotePanelOpen" v-on:trigger-close="closeRemotePanel" :dismissable="true" size="small">
				<template slot="content">
					<RemoteConfigPanel 
						v-if="!remoteConfigured"
						v-on:trigger-modal-close="closeRemotePanel"
						v-on:end-config="remoteConfigured = true"
						:roomID="remoteRoomID"
						:remoteClientConnected="remoteClientConnected"
						:remoteConnected="remoteConnected"
					/>
					<RemoteStatusPanel 
						v-else
						v-on:disconnect="closeRemoteConnection"
						v-on:trigger-modal-close="closeRemotePanel"
						:roomID="remoteRoomID"
						:remoteClientConnected="remoteClientConnected"
						:remoteConnected="remoteConnected"
						:log="remoteActionLog"
					/>
				</template>
			</Modal>
		</transition>
		<TouchBar :show="!modalOpen" 
			:bar="[
				{type: 'button', label: '🔀', method: function() {rearrangeSeats()}},
				{type: 'button', label: '🌈', method: function() {highlightStudents()}},
				{type: 'button', label: '🎲', method: function() {selectRandom()}},
				{type: 'button', label: '🎫', method: function() {toggleCardStyle()}},
				{type: 'button', label: '📈', method: function() {showTrends()}},
				{type: 'button', label: '📺', method: function() {invertChart()}},
				{type: 'button', label: '📝', method: function() {createBulkNote()}},
				{type: 'button', label: '🌠', method: function() {deselectStudents()}}
	    	]" 
	    	:escapeItem="{type: 'button', label: '✏️', method: function() {toggleEditMode()}}"
	    />
	</div>
</template>

<script>
import db from '@/db.js'
import moment from 'moment'
const { remote } = require('electron')

import TitleBar from '@/components/TitleBar.vue'
import NameCard from '@/components/NameCard.vue'
import ActionBar from '@/components/ActionBar.vue'
import Modal from '@/components/Modal.vue'
import Settings from '@/components/Settings.vue'
import NoteForm from '@/components/NoteForm.vue'
import TouchBar from '@/components/TouchBar.vue'

import RemoteAdapter from '@/components/RemoteAdapter.vue'
import RemoteConfigPanel from '@/components/RemoteConfigPanel.vue'
import RemoteStatusPanel from '@/components/RemoteStatusPanel.vue'

export default {
	name: 'Chart',
	props: ['id'],
	components: {
		TitleBar,
		NameCard,
		ActionBar,
		Modal,
		Settings,
		NoteForm,
		TouchBar,
		RemoteAdapter,
		RemoteConfigPanel,
		RemoteStatusPanel
	},
	data() {
		return {
			classInfo: {
				name: 'Class',
				_id: null,
				semester: null,
				year: null,
				columns: null,
				rows: null,
                archived: null
			},
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
			modalOpen: false,
			noteModalOpen: false,
			newStudentModalOpen: false,
			editStudentModalOpen: false,
			newNoteStudent: {
				firstName: null,
				lastName: null,
				tigerID: null,
				_id: null,
				class: null,
				selected: null,
				seat: {
					row: null,
					column: null
				}
			},
			randomStudent: 0,
			chosenSeat: {
				column: null,
				row: null
			},
			students: [
				{
					_id: null,
					seat: {
						row: null,
						column: null
					},
					class: null,
					selected: null,
					tigerID: null,
					firstName: null,
					lastName: null
				}
			],
			cardType: 'complex',
			showingTrends: false,
			inverted: false,
			absentStudents: [],
			unplacedStudents: [],
			alert: {
				isAlert: false,
				alertMessage: '',
				action: null
			},
			newStudent: {
				firstName: '',
				lastName: '',
				tigerID: '',
				seat: {
					row: null,
					column: null
				}
			},
			studentToEdit: {
				_id: null,
				seat: {
					row: null,
					column: null
				},
				class: null,
				selected: null,
				tigerID: null,
				firstName: null,
				lastName: null
			},
			studentFormAlertMessage: '',
			promptStudentDelete: false,
			deselect: false,
			expanded: false,
			remoteConnected: false,
			remoteRoomID: '',
			remoteClientConnected: false,
			remoteConfigured: false,
			remotePanelOpen: false,
			remoteActionLog: []
		}
	},
	computed: {
		isHuge() {
			return this.classInfo.rows > 8 || this.classInfo.columns > 8
		}
	},
	methods: {
		calculateCardSize() {
			// determine ideal card dimensions
			let totalWidth = window.innerWidth
			let totalHeight = window.innerHeight
			let heightAdjusted

			if (!this.expanded) {
				heightAdjusted = totalHeight * .76
			} else {
				heightAdjusted = totalHeight * .84
			}

			let totalCardWidth = totalWidth / this.classInfo.columns
			let totalCardHeight = heightAdjusted / this.classInfo.rows

			let ratio = totalCardWidth / totalCardHeight
			// enforce consistent dimensions
			if (ratio > 1.2) {
				totalCardWidth = totalCardHeight * 1.2
			} else if (ratio < 1.2) {
				totalCardHeight = totalCardWidth * .835
			}


			let totalPossibleVerticalSpace = totalCardHeight * this.classInfo.rows
			let totalUsedVerticalSpace = totalPossibleVerticalSpace * .77
			let remainingVerticalSpace = heightAdjusted - totalUsedVerticalSpace
			let gaps = this.classInfo.rows + 2
			let verticalMargin = remainingVerticalSpace / gaps
			this.cardStyle.width = `${totalCardWidth * .9}px`
			this.cardStyle.marginRight = `${totalCardWidth * .05}px`
			this.cardStyle.marginLeft = `${totalCardWidth * .05}px`
			this.cardStyle.height = `${totalCardHeight * .7}px`
			this.rowMargins.marginTop = `${verticalMargin}px`
			this.rowMargins.marginBottom = `${verticalMargin}px`
		},
		openModal() {
      		this.modalOpen = true
    	},
    	openNoteModal(student) {
    		this.noteModalOpen = true
    		this.newNoteStudent = student
    	},
		openNewStudentModal(column, row) {
			this.newStudent.seat.row = row
			this.newStudent.seat.column = column
			this.newStudentModalOpen = true
		},
		openEditStudentModal(student) {
			this.studentToEdit = student
			this.editStudentModalOpen = true
		},
    	setLastView(lastView) {
    		this.$store.dispatch('setLastView', lastView)
    		this.$router.push(`/chart/edit/${this.id}`)
    	},
    	selectRandom() {
			// check for need to recalculate card sizes
			this.calculateCardSize()

			if (this.absentStudents.length < this.students.length) {
				// check to ensure selected student is not absent today
				let matchFound = false

				while (!matchFound) {
					if (this.absentStudents.indexOf(this.students[this.randomStudent]._id) !== -1) {
						this.randomStudent++

						if (this.randomStudent == this.students.length) {
			    			this.randomStudent = 0
			    		}
					} else {
						matchFound = true
					}
				}


				let student = this.students[this.randomStudent]


				// ensure that random selections are also inverted
				if (this.inverted) {
					let rows = []
					let columns = []

					for (let i=0; i<this.classInfo.rows; i++) {
						rows.push(i + 1)
					}

					for (let i=0; i<this.classInfo.columns; i++) {
						columns.push(i + 1)
					}
					rows.reverse()
					columns.reverse()

					this.chosenSeat = {row: rows.indexOf(student.seat.row) + 1, column: columns.indexOf(student.seat.column) + 1}
					console.log(this.chosenSeat)
				} else {
					this.chosenSeat.row = student.seat.row
					this.chosenSeat.column = student.seat.column
				}

				// increment or reset
	    		this.randomStudent++
	    		if (this.randomStudent == this.students.length) {
	    			this.randomStudent = 0
	    		}
	    	} else {
	    		this.clearRandom()
	    	}
    	},
    	clearRandom() {
    		this.chosenSeat.row = null
    		this.chosenSeat.column = null
    	},
    	toggleCardStyle() {
    		// check for need to recalculate card sizes
			this.calculateCardSize()

    		if (this.cardType === 'complex') {
    			this.cardType = 'simple'
    		} else {
    			this.cardType = 'complex'
    		}
    	},
		toggleEditMode() {
			// check for need to recalculate card sizes
			this.calculateCardSize()

			if (this.cardType === 'edit') {
				this.cardType = 'complex'
			} else {
				this.cardType = 'edit'
			}
		},
		saveNewStudent() {
			if (this.newStudent.firstName !== '' && this.newStudent.lastName !== '') {
				db.createSomething('students', {
					firstName: this.newStudent.firstName,
					lastName: this.newStudent.lastName,
					tigerID: this.newStudent.tigerID,
					selected: false,
					class: this.classInfo._id,
					highlight: '',
					seat: {
						column: this.newStudent.seat.column,
						row: this.newStudent.seat.row
					}
				}).then((savedStudent) => {
					this.students.push(savedStudent)
					this.shuffle(this.students)
					this.resetNewStudent()
				})
			} else {
				this.studentFormAlertMessage = 'Please enter at least a first and last name.'
			}
		},
		saveEditedStudent() {
			if (this.studentToEdit.firstName !== '' && this.studentToEdit.lastName !== '') {
				this.newStudent.firstName = this.studentToEdit.firstName
				db.updateSomething('students', {_id: this.studentToEdit._id}, {
					$set: {
						firstName: this.studentToEdit.firstName,
						lastName: this.studentToEdit.lastName,
						tigerID: this.studentToEdit.tigerID,
					}
				}).then(() => {
					db.readSomething('students', {class: this.classInfo._id})
						.then((results) => {
							this.students = results
							this.shuffle(this.students)
							this.resetStudentToEdit()
						})
				})
			} else {
				this.studentFormAlertMessage = 'Please enter at least a first and last name.'
			}
		},
		deleteStudent() {
			db.deleteSomething('students', {_id: this.studentToEdit._id})
				.then(() => {
					db.deleteSomething('notes', {student: this.studentToEdit._id})
						.then((numNotesDeleted) => {
							console.log(`${numNotesDeleted} notes were deleted`)
						})

					for (let i=0; i<this.students.length; i++) {
						if (this.students[i]._id == this.studentToEdit._id) {
							this.students.splice(i, 1)
							break;
						}
					}

					this.shuffle(this.students)
					this.resetStudentToEdit()
					this.resetNewStudent()
				})
		},
		resetNewStudent() {
			this.newStudentModalOpen = false
			this.newStudent = {
				firstName: '',
				lastName: '',
				tigerID: '',
				seat: {
					row: null,
					column: null
				}
			}
			this.studentFormAlertMessage = ''
		},
		resetStudentToEdit() {
			this.editStudentModalOpen = false
			this.promptStudentDelete = false
			this.studentToEdit = {
				_id: null,
				seat: {
					row: null,
					column: null
				},
				class: null,
				selected: null,
				tigerID: null,
				firstName: null,
				lastName: null
			}
			this.studentFormAlertMessage = ''
		},
    	showTrends() {
    		// check for need to recalculate card sizes
			this.calculateCardSize()

    		this.showingTrends = !this.showingTrends

    		if (this.showingTrends) {
    			this.cardType = 'trends'
    		} else {
    			this.cardType = 'complex'
    		}
    	},
		invertChart() {
			// check for need to recalculate card sizes
			this.calculateCardSize()

			this.inverted = !this.inverted
			this.clearRandom()
			if (this.cardType !== 'trends') {
				if (this.inverted) {
					this.cardType = 'simple'
				} else {
					this.cardType = 'complex'
				}
			}

		},
		addAbsence(studentID) {
			this.absentStudents.push(studentID)
		},
		rearrangeSeats() {
			this.$router.push(`/chart/rearrange/${this.id}`)
		},
		highlightStudents() {
			this.$router.push(`/chart/highlight/${this.id}`)
		},
		createBulkNote() {
			this.$router.push(`/chart/bulknote/${this.id}`)
		},
    	shuffle(arr) {
    		var j, x, i;
		    for (i = arr.length - 1; i > 0; i--) {
		        j = Math.floor(Math.random() * (i + 1));
		        x = arr[i];
		        arr[i] = arr[j];
		        arr[j] = x;
		    }

		    return arr
    	},
		closeSettings() {
			this.modalOpen = false

			if (this.$store.state.preferences.progress.indexOf('viewed class chart') === -1) {
				this.$store.dispatch('setPreferences', {
					progress: ['created class', 'rearranged seats', 'viewed class chart']
				})
			}
		},
		deselectStudents() {
			this.deselect = true

			let scope = this
			setTimeout(function() {
				scope.deselect = false
			}, 1000, scope)
		},
		toggleExpand(value) {
			this.expanded = value

			this.calculateCardSize()
		},
		openRemotePanel() {
			this.remotePanelOpen = true
		},
		closeRemotePanel() {
			this.remotePanelOpen = false
		},
		setRemoteRoomID(roomID) {
			this.remoteRoomID = roomID
		},
		addToActionLog(action) {
			this.remoteActionLog.unshift(action)
		},
		closeRemoteConnection() {
			this.remoteConnected = false
			this.remoteClientConnected = false
			this.remoteConfigured = false
			this.remoteActionLog = []
			this.clearRandom()
		}
	},
	mounted() {
		let scope = this
		if (this.$store.state.preferences.progress.indexOf('rearranged seats') === -1) {
			// display tutorial info
			setTimeout(function() {
				scope.alert.isAlert = true
				scope.alert.alertMessage = 'Students have been sorted into random seats.<br><br>Try editing seat assignments now.'
				scope.alert.action = scope.rearrangeSeats
			}, 3000, scope)
		} else if (this.$store.state.preferences.progress.indexOf('viewed class chart') === -1) {
			setTimeout(function() {
				scope.modalOpen = true
			}, 5000, scope)
		}

		// listen for user attempts to correct sizing after screen resolution change
		EventBus.$on('stretch', () => {
			this.calculateCardSize()
		})
	},
	created() {
		db.readSomething('classes', {_id: this.id})
			.then((classInfo) => {
				this.classInfo = classInfo[0]

				// update last view in $store
				this.$store.dispatch('setLastView', `/chart/${this.classInfo._id}`)

				this.calculateCardSize()

				db.readSomething('students', {class: this.id})
					.then((students) => {
						this.students = this.shuffle(students)

						for (let i=0; i<this.students.length; i++) {
							if (this.students[i].seat.row == null) {
								this.unplacedStudents.push(this.students[i])
							}
						}

						// check if students have been added to the roster (and not yet seated)
						if (this.unplacedStudents.length === 1) {
							this.alert.isAlert = true
							this.alert.alertMessage = "A student you have added does not have a seat.<br><br>Let's assign them one now."
							this.alert.action = this.rearrangeSeats
						} else if (this.unplacedStudents.length > 1) {
							this.alert.isAlert = true
							this.alert.alertMessage = "Students you have added do not have a seat.<br><br>Let's assign them one now."
							this.alert.action = this.rearrangeSeats
						}

					})
			})
	},
	beforeDestroy() {
		this.$socket.emit('endSession')
	}
}
</script>

<style scoped>
body {
	background: var(--black);
}

#chartContainer {
	background: var(--black);
	width: 100%;
	height: 100%;
}

#chartHeader {
	
}

#chartMain {
	
}

#chartFooter {
	position: fixed;
	bottom: 0;
}

.row {
	text-align: center;
	transition: all .3s ease;
}

.column {
	display: inline-block;
	vertical-align: middle;
}

button {
	background: none;
	outline: none;
	border: none;
	cursor: pointer;
}

.action-button {
	margin: 0 3.5%;
	position: relative;
}

.action-button:hover .tooltip {
	visibility: visible;
}

.tooltip {
	visibility: hidden;
	position: absolute;
	background: var(--yellow);
	width: 150px;
	padding: 5px;
	bottom: 100%;
	left: 50%;
	text-align: center;
	z-index: 1000;
	margin-left: -75px;
	margin-bottom: 21px;
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

.yellow {
	background: var(--yellow)!important;
}

.red {
	background: var(--red)!important;
	color: var(--white)!important;
}

.alert-modal-body {
	height: 180px;
	padding-top: 120px;
	text-align: center;
}

.alert-modal-footer {
	background: var(--gray);
	text-align: center;
	height: 75px;
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

.student-modal {
	display: grid;
	height: 100%;
	width: 100%;
	grid-template-rows: auto 1fr auto;
	grid-template-areas:
		"studentHeader"
		"studentBody"
		"studentFooter";
	align-items: center;
}

.student-modal-header {
	padding: 20px 0;
	border-bottom: 1px solid var(--dark-gray);
	text-align: center;
	grid-area: studentHeader;
}

.student-modal-footer {
	grid-area: studentFooter;
	background: var(--gray);
	text-align: center;
	height: 70px;
}

.student-footer-button {
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

.student-form {
	grid-area: studentBody;
	width: 80%;
	margin: 0 auto;
	text-align: center;
}

.alert-area {
	height: 22px;
}

.student-alert {
	font-size: 15px;
	color: var(--red);
}

.small-input {
	border-radius: 4px;
	font-size: 18px;
	padding: 10px 15px 12px 15px;
	display: block;
	margin: 10px auto;
	width: 300px;
	color: var(--black);
	border: 1px solid var(--light-gray);
	outline: none;
}

.fade-enter-active, .fade-leave-active {
	transition: opacity .2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
	opacity: 0;
}
</style>
