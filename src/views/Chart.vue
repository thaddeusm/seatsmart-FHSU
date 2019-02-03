<template>
	<div id="chartContainer">
		<header id="chartHeader">
			<TitleBar :title="classInfo.name" />
		</header>
		<main id="chartMain">
			<section v-if="!inverted" class="row" v-for="(row, index) in classInfo.rows" :style="rowMargins" :key="`row${index}`">
				<div v-for="(column, subIndex) in classInfo.columns" class="column" :style="cardStyle">
					<NameCard
						:type="cardType"
						:row="index + 1"
						:column="subIndex + 1"
						:classId="classInfo._id"
						v-on:open-note-modal="openNoteModal"
						v-on:absence="addAbsence"
						:chosen="chosenSeat.row == index + 1 && chosenSeat.column == subIndex + 1"
					/>
				</div>
			</section>
			<section v-if="inverted" class="row" v-for="(row, index) in classInfo.rows" :style="rowMargins" :key="`invertedRow${index}`">
				<div v-for="(column, subIndex) in classInfo.columns" class="column" :style="cardStyle">
					<NameCard
						:type="cardType"
						:row="classInfo.rows - index"
						:column="classInfo.columns - subIndex"
						:classId="classInfo._id"
						v-on:open-note-modal="openNoteModal"
						v-on:absence="addAbsence"
						:chosen="chosenSeat.row == index + 1 && chosenSeat.column == subIndex + 1" />
				</div>
			</section>
		</main>
		<footer id="chartFooter">
			<ActionBar background="var(--gray)" :hamburger="true" v-on:expand="calculateCardSize('large')" v-on:contract="calculateCardSize('small')" :collapsed="false">
		        <template slot="left">
		        	<router-link to="/"><img src="@/assets/home.svg" alt="home icon"></router-link>
		        </template>
		        <template slot="center">
		        	<button @click="setLastView(`/chart/${id}`)" class="action-button">
						<img src="@/assets/editwhite.svg" alt="edit icon">
						<span class="tooltip">edit class information</span>
					</button>
		        	<button @click="rearrangeSeats" class="action-button">
						<img src="@/assets/rearrange.svg" alt="rearrange icon">
						<span class="tooltip">edit seat assignments</span>
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
						<span class="tooltip">show/hide week trends</span>
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
      		<Modal v-if="modalOpen" v-on:trigger-close="modalOpen = false" :dismissable="false" size="large">
        		<template slot="content">
          			<Settings v-on:trigger-modal-close="modalOpen = false"/>
        		</template>
      		</Modal>
    	</transition>
		<TouchBar :show="!modalOpen" :bar="[
			{type: 'button', label: '🏠', method: function() {$router.push('/')}},
			{type: 'spacer', size: 'small'},
			{type: 'button', label: 'Edit', method: function() {setLastView(`/chart/${id}`)}},
			{type: 'button', label: 'Random', method: function() {selectRandom()}},
			{type: 'button', label: 'Style', method: function() {toggleCardStyle()}},
			{type: 'button', label: 'Trends', method: function() {showTrends()}},
			{type: 'button', label: 'Present', method: function() {invertChart()}},
			{type: 'button', label: 'Bulk', method: function() {createBulkNote()}},
			{type: 'spacer', size: 'small'},
	    	{type: 'button', label: '⚙️', method: openModal}
	    ]"/>
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
		TouchBar
	},
	data() {
		return {
			classInfo: {
				name: null,
				_id: null,
				semester: null,
				year: null,
				columns: null,
				rows: null
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
			absentStudents: []
		}
	},
	methods: {
		calculateCardSize(size) {
			// determine ideal card dimensions
			let totalWidth = remote.getGlobal('screenWidth')
			let totalHeight = remote.getGlobal('screenHeight')
			let heightAdjusted

			if (size == 'small') {
				heightAdjusted = totalHeight * .78
			} else {
				heightAdjusted = totalHeight * .88
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
			let totalUsedVerticalSpace = totalPossibleVerticalSpace * .7
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
    	setLastView(lastView) {
    		this.$store.dispatch('setLastView', lastView)
    		this.$router.push(`/chart/edit/${this.id}`)
    	},
    	selectRandom() {
			// check to ensure selected student is not absent today
			if (this.absentStudents.indexOf(this.students[this.randomStudent]._id) !== -1) {
				this.randomStudent++
			}
			let student = this.students[this.randomStudent]

    		this.chosenSeat.row = student.seat.row
    		this.chosenSeat.column = student.seat.column
    		this.randomStudent++
    		if (this.randomStudent == this.students.length) {
    			this.randomStudent = 0
    		}
    	},
    	clearRandom() {
    		this.chosenSeat.row = null
    		this.chosenSeat.column = null
    	},
    	toggleCardStyle() {
    		if (this.cardType === 'complex') {
    			this.cardType = 'simple'
    		} else {
    			this.cardType = 'complex'
    		}
    	},
    	showTrends() {
    		this.showingTrends = !this.showingTrends

    		if (this.showingTrends) {
    			this.cardType = 'trends'
    		} else {
    			this.cardType = 'complex'
    		}
    	},
		invertChart() {
			this.inverted = !this.inverted
			if (this.inverted) {
				this.cardType = 'simple'
			} else {
				this.cardType = 'complex'
			}

		},
		addAbsence(studentID) {
			this.absentStudents.push(studentID)
		},
		rearrangeSeats() {
			this.$router.push(`/chart/rearrange/${this.id}`)
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
    	}
	},
	created() {
		db.readSomething('classes', {_id: this.id})
			.then((classInfo) => {
				this.classInfo = classInfo[0]

				this.calculateCardSize('small')

				db.readSomething('students', {class: this.id})
					.then((students) => {
						this.students = this.shuffle(students)
					})
			})
	}
}
</script>

<style scoped>
#chartContainer {
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

#chartHeader {
	grid-area: "header";
}

#chartMain {
	grid-area: "main";
	overflow: auto;
}

#chartFooter {
	grid-area: "footer";
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
	margin: 0 5%;
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
	z-index: 100;
	margin-left: -75px;
	margin-bottom: 21px;
	border-radius: 5px;
	font-family: 'Merriweather';
	font-size: 1em;
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

.fade-enter-active, .fade-leave-active {
	transition: opacity .2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
	opacity: 0;
}
</style>
